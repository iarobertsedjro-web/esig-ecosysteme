#!/usr/bin/env node
/* =========================================================================
   assistant/serveur-exemple.js — API de référence de l'ESIG Success Assistant
   -------------------------------------------------------------------------
   Exemple fonctionnel minimal (Node >= 18, aucune dépendance) montrant le
   contrat attendu par le widget assistant.js :
     POST /api/assistant  { messages:[{role,content}...], page }
     ->   { reponse, transfert_humain, sources }

   - RAG simple sur base-documentaire/ (formations.json + fichiers .md)
   - Appel Claude API (clé en variable d'environnement, JAMAIS dans le code)
   - Limitation de débit par IP + journalisation
   Démarrage :  CLE_API_MODELE=sk-... node assistant/serveur-exemple.js
   ========================================================================= */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8787;
const CLE_API = process.env.CLE_API_MODELE || '';
const ORIGINE_AUTORISEE = process.env.ORIGINE_AUTORISEE || 'https://esig.tg';
const DOSSIER_DOCS = path.join(__dirname, 'base-documentaire');
const PROMPT_SYSTEME = fs.readFileSync(path.join(__dirname, 'prompt-systeme.md'), 'utf8');

/* ----- Chargement de la base documentaire ----- */
function chargerDocuments() {
  const docs = [];
  for (const nom of fs.readdirSync(DOSSIER_DOCS)) {
    const chemin = path.join(DOSSIER_DOCS, nom);
    if (nom.endsWith('.json')) {
      const data = JSON.parse(fs.readFileSync(chemin, 'utf8'));
      (Array.isArray(data) ? data : [data]).forEach((d, i) =>
        docs.push({ id: nom + '#' + i, texte: JSON.stringify(d) }));
    } else if (nom.endsWith('.md')) {
      docs.push({ id: nom, texte: fs.readFileSync(chemin, 'utf8') });
    }
  }
  return docs;
}
const DOCUMENTS = chargerDocuments();

/* ----- Recherche naïve (à remplacer par des embeddings en production) ----- */
function rechercher(question, limite) {
  const mots = question.toLowerCase().split(/\W+/).filter(m => m.length > 3);
  return DOCUMENTS
    .map(d => ({ d, score: mots.reduce((s, m) => s + (d.texte.toLowerCase().includes(m) ? 1 : 0), 0) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite || 6)
    .map(x => x.d);
}

/* ----- Limitation de débit : 10 requêtes / minute / IP ----- */
const compteurs = new Map();
function debitOk(ip) {
  const maintenant = Date.now();
  const liste = (compteurs.get(ip) || []).filter(t => maintenant - t < 60000);
  liste.push(maintenant);
  compteurs.set(ip, liste);
  return liste.length <= 10;
}

/* ----- Appel du modèle (Claude API) ----- */
async function appelerModele(messages, contexte) {
  const reponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': CLE_API,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: PROMPT_SYSTEME + '\n\n## Documents fournis\n' + contexte,
      messages: messages
    })
  });
  if (!reponse.ok) throw new Error('API modèle : HTTP ' + reponse.status);
  const data = await reponse.json();
  return data.content && data.content[0] ? data.content[0].text : '';
}

/* ----- Serveur ----- */
http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGINE_AUTORISEE);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/api/assistant') {
    res.writeHead(404); return res.end('{"erreur":"introuvable"}');
  }
  const ip = req.socket.remoteAddress;
  if (!debitOk(ip)) { res.writeHead(429); return res.end('{"erreur":"trop de requêtes"}'); }

  let corps = '';
  req.on('data', c => { corps += c; if (corps.length > 20000) req.destroy(); });
  req.on('end', async () => {
    try {
      const { messages } = JSON.parse(corps);
      if (!Array.isArray(messages) || !messages.length) throw new Error('messages requis');
      const question = String(messages[messages.length - 1].content || '').slice(0, 500);

      const sources = rechercher(question);
      const contexte = sources.map(s => '### ' + s.id + '\n' + s.texte.slice(0, 1500)).join('\n\n')
        || '(Aucun document pertinent trouvé : applique la règle « information non validée ».)';

      let texte, transfert = false;
      if (!CLE_API) {
        texte = 'Assistant en cours de configuration. Un conseiller peut vous répondre dès maintenant.';
        transfert = true;
      } else {
        texte = await appelerModele(messages.slice(-10), contexte);
        try { const j = JSON.parse(texte); texte = j.reponse; transfert = !!j.transfert_humain; } catch (e) {}
        if (!sources.length) transfert = true;
      }

      /* Journalisation (sans données personnelles superflues) */
      fs.appendFileSync(path.join(__dirname, 'journal-assistant.log'),
        JSON.stringify({ date: new Date().toISOString(), question, sources: sources.map(s => s.id), transfert }) + '\n');

      res.writeHead(200);
      res.end(JSON.stringify({ reponse: texte, transfert_humain: transfert, sources: sources.map(s => s.id) }));
    } catch (e) {
      res.writeHead(400);
      res.end(JSON.stringify({ erreur: 'requête invalide' }));
    }
  });
}).listen(PORT, () => console.log('ESIG Success Assistant : http://localhost:' + PORT + '/api/assistant'));
