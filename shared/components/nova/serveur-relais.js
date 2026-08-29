#!/usr/bin/env node
/* =========================================================================
   ESIG NOVA — Relais serveur (API de référence)
   -------------------------------------------------------------------------
   Point de terminaison appelé par le widget (shared/components/nova/nova.js) :
       POST /api/assistant   { messages:[{role,content}...], page }
       ->                    { reponse, transfert_humain, sources }

   Refonte du serveur-exemple hérité, avec les corrections de l'audit :
     · Liste d'origines autorisées (les 6 sous-domaines de l'écosystème)
     · Clé API du modèle en variable d'environnement (JAMAIS dans le code)
     · Limitation de débit par IP, taille de requête plafonnée
     · Anti-invention : sans document pertinent, transfert vers un humain
     · Journalisation minimale (voir note RGPD dans README-NOVA.md)

   Démarrage :
     CLE_API_MODELE=sk-ant-...  node shared/components/nova/serveur-relais.js
   Node >= 18 (fetch natif), aucune dépendance externe.
   ========================================================================= */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8787;
const CLE_API = process.env.CLE_API_MODELE || '';
const MODELE = process.env.MODELE || 'claude-haiku-4-5-20251001';

// Origines autorisées : les sous-domaines de l'écosystème + le local pour les tests.
// (international/entreprises conservés le temps de la transition — ils redirigent 301.)
const ORIGINES_AUTORISEES = (process.env.ORIGINES_AUTORISEES ||
  'https://esig.tg,https://admission.esig.tg,https://executive.esig.tg,' +
  'https://cooperation.esig.tg,https://carrieres.esig.tg,https://alumni.esig.tg,' +
  'https://news.esig.tg,https://tech.esig.tg,' +
  'https://international.esig.tg,https://entreprises.esig.tg,' +
  'http://localhost:8080,http://127.0.0.1:8080'
).split(',').map(s => s.trim());

const DOSSIER_DOCS = path.join(__dirname, 'base-documentaire');
const PROMPT_SYSTEME = fs.readFileSync(path.join(__dirname, 'prompt-systeme.md'), 'utf8');

/* ----- Base documentaire (RAG simple) ------------------------------ */
function chargerDocuments() {
  const docs = [];
  if (!fs.existsSync(DOSSIER_DOCS)) return docs;
  for (const nom of fs.readdirSync(DOSSIER_DOCS)) {
    const chemin = path.join(DOSSIER_DOCS, nom);
    if (nom.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(chemin, 'utf8'));
      const liste = Array.isArray(data) ? data : (data.formations || [data]);
      liste.forEach((d, i) => docs.push({ id: nom + '#' + i, texte: JSON.stringify(d) }));
    } else if (nom.endsWith('.md')) {
      docs.push({ id: nom, texte: fs.readFileSync(chemin, 'utf8') });
    }
  }
  return docs;
}
const DOCUMENTS = chargerDocuments();

function rechercher(question, limite) {
  const mots = question.toLowerCase().split(/\W+/).filter(m => m.length > 3);
  return DOCUMENTS
    .map(d => ({ d, score: mots.reduce((s, m) => s + (d.texte.toLowerCase().includes(m) ? 1 : 0), 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite || 6)
    .map(x => x.d);
}

/* ----- Limitation de débit : 12 requêtes / minute / IP ------------- */
const compteurs = new Map();
function debitOk(ip) {
  const t = Date.now();
  const liste = (compteurs.get(ip) || []).filter(x => t - x < 60000);
  liste.push(t); compteurs.set(ip, liste);
  return liste.length <= 12;
}

/* ----- Appel du modèle (Claude API) -------------------------------- */
async function appelerModele(messages, contexte) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CLE_API, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODELE,
      max_tokens: 600,
      system: PROMPT_SYSTEME + '\n\n## Documents fournis\n' + contexte,
      messages: messages
    })
  });
  if (!r.ok) throw new Error('API modèle : HTTP ' + r.status);
  const data = await r.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}

/* ----- Serveur ----------------------------------------------------- */
http.createServer(async (req, res) => {
  const origine = req.headers.origin;
  if (origine && ORIGINES_AUTORISEES.indexOf(origine) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origine);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/api/assistant') {
    res.writeHead(404); return res.end('{"erreur":"introuvable"}');
  }
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (!debitOk(ip)) { res.writeHead(429); return res.end('{"erreur":"trop de requetes"}'); }

  let corps = '';
  req.on('data', c => { corps += c; if (corps.length > 20000) req.destroy(); });
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(corps);
      if (!Array.isArray(messages) || !messages.length) throw new Error('messages requis');
      const question = String(messages[messages.length - 1].content || '').slice(0, 500);

      const sources = rechercher(question);
      const contexte = sources.map(s => '### ' + s.id + '\n' + s.texte.slice(0, 1500)).join('\n\n')
        || '(Aucun document pertinent : applique la règle « information non validée ».)';

      let texte, transfert = false;
      if (!CLE_API) {
        texte = 'Assistant en cours de configuration. Un conseiller peut vous répondre dès maintenant.';
        transfert = true;
      } else {
        texte = await appelerModele(messages.slice(-10), contexte);
        try { const j = JSON.parse(texte); texte = j.reponse; transfert = !!j.transfert_humain; } catch (e) {}
        if (!sources.length) transfert = true;
      }

      res.writeHead(200);
      res.end(JSON.stringify({ reponse: texte, transfert_humain: transfert, sources: sources.map(s => s.id) }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ erreur: 'requete invalide' }));
    }
  });
}).listen(PORT, () => {
  console.log('ESIG NOVA — relais : http://localhost:' + PORT + '/api/assistant');
  console.log('Modèle :', MODELE, '| Clé API :', CLE_API ? 'chargée' : 'ABSENTE (mode transfert humain)');
  console.log('Origines autorisées :', ORIGINES_AUTORISEES.join(', '));
});
