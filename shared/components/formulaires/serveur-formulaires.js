#!/usr/bin/env node
/* =========================================================================
   ESIG — Service de traitement des formulaires (relais serveur)
   -------------------------------------------------------------------------
   Appelé par shared/js/formulaires.js :
       POST /api/formulaire   { _formulaire, _page, ...champs }
       ->                     { ok:true, voie:"email"|"fichier" }

   Même principe de sécurité que le relais NOVA :
     · Node pur, aucune dépendance OBLIGATOIRE (nodemailer optionnel)
     · Secrets (SMTP) en variables d'environnement — JAMAIS dans le code
     · Liste d'origines autorisées, pot de miel, limitation de débit par IP,
       taille de requête plafonnée
     · Envoi par e-mail (SMTP via nodemailer) ; à défaut, REPLI FICHIER pour
       ne perdre aucune demande.

   Démarrage (exemple) :
     SMTP_HOTE=smtp.esig.tg SMTP_PORT=587 SMTP_USER=site@esig.tg SMTP_MDP=*** \
       node shared/components/formulaires/serveur-formulaires.js
   Sans SMTP configuré : le service tourne quand même et stocke les demandes
   dans _boite-reception/ (à sécuriser, hors racine web — voir README).
   Node >= 18. Pour l'e-mail : npm install nodemailer.
   ========================================================================= */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT_FORMULAIRES || 8788;

// Origines autorisées : les sous-domaines de l'écosystème + le local pour les tests.
// (international/entreprises conservés le temps de la transition — ils redirigent 301.)
const ORIGINES_AUTORISEES = (process.env.ORIGINES_AUTORISEES ||
  'https://esig.tg,https://admission.esig.tg,https://executive.esig.tg,' +
  'https://cooperation.esig.tg,https://carrieres.esig.tg,https://alumni.esig.tg,' +
  'https://news.esig.tg,https://tech.esig.tg,' +
  'https://international.esig.tg,https://entreprises.esig.tg,' +
  'http://localhost:8080,http://127.0.0.1:8080,http://localhost:8090,http://127.0.0.1:8090'
).split(',').map(s => s.trim());

// Destinataire par type de formulaire (adresses réelles ESIG). Repli : contact@.
const DESTINATAIRES = {
  'preinscription': 'admissions@esig.tg',
  'demande-info': 'admissions@esig.tg',
  'rendez-vous': 'admissions@esig.tg',
  'candidature-internationale': 'admissions@esig.tg',
  'devis': 'formation@esig.tg',
  'depot-offre': 'contact@esig.tg',
  'demande-document': 'contact@esig.tg',
  'contact': 'contact@esig.tg',
  'proposer-tech': 'contact@esig.tg',
  'devenir-partenaire': 'contact@esig.tg',
  'rejoindre-alumni': 'contact@esig.tg'
};
const DEST_DEFAUT = process.env.DESTINATAIRE_DEFAUT || 'contact@esig.tg';

const LIBELLES = {
  'preinscription': 'Préinscription',
  'demande-info': "Demande d'information",
  'rendez-vous': 'Rendez-vous conseiller',
  'candidature-internationale': 'Candidature internationale',
  'devis': 'Demande de devis',
  'depot-offre': "Dépôt d'offre",
  'demande-document': 'Demande de document officiel',
  'contact': 'Message de contact',
  'proposer-tech': 'ESIG Tech — projet / partenariat',
  'devenir-partenaire': 'Coopération — devenir partenaire',
  'rejoindre-alumni': 'Alumni — adhésion / mise à jour de profil'
};

/* ----- E-mail (SMTP via nodemailer, optionnel) --------------------- */
let nodemailer = null;
try { nodemailer = require('nodemailer'); } catch (e) { /* module absent : repli fichier */ }
const SMTP = {
  hote: process.env.SMTP_HOTE || '',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: /^(1|true|oui)$/i.test(process.env.SMTP_SECURISE || ''),
  user: process.env.SMTP_USER || '',
  mdp: process.env.SMTP_MDP || '',
  from: process.env.EXPEDITEUR || 'site@esig.tg'
};
const emailPret = !!(nodemailer && SMTP.hote && SMTP.user && SMTP.mdp);
let transport = null;
function getTransport() {
  if (!transport && emailPret) {
    transport = nodemailer.createTransport({
      host: SMTP.hote, port: SMTP.port, secure: SMTP.secure,
      auth: { user: SMTP.user, pass: SMTP.mdp }
    });
  }
  return transport;
}

const DOSSIER_REPLI = process.env.DOSSIER_REPLI || path.join(__dirname, '_boite-reception');

/* ----- Limitation de débit : 6 envois / 10 min / IP ---------------- */
const compteurs = new Map();
function debitOk(ip) {
  const t = Date.now();
  const liste = (compteurs.get(ip) || []).filter(x => t - x < 600000);
  liste.push(t); compteurs.set(ip, liste);
  return liste.length <= 6;
}

function nettoyer(s) { return String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').slice(0, 5000); }

function corpsEmail(donnees) {
  const type = donnees._formulaire || 'inconnu';
  const lignes = ['Type : ' + (LIBELLES[type] || type), 'Page : ' + nettoyer(donnees._page), ''];
  Object.keys(donnees).forEach(function (k) {
    if (k === '_formulaire' || k === '_page' || k === 'consentement') return;
    lignes.push(k + ' : ' + nettoyer(donnees[k]));
  });
  lignes.push('', 'Consentement RGPD : ' + (donnees.consentement ? 'oui' : 'non'));
  return lignes.join('\n');
}

function enregistrerRepli(donnees) {
  try {
    fs.mkdirSync(DOSSIER_REPLI, { recursive: true });
    const fichier = path.join(DOSSIER_REPLI, (donnees._formulaire || 'inconnu').replace(/[^a-z0-9\-]/gi, '_') + '.jsonl');
    fs.appendFileSync(fichier, JSON.stringify(Object.assign({ _date: new Date().toISOString() }, donnees)) + '\n', 'utf8');
    return true;
  } catch (e) { return false; }
}

async function traiter(donnees) {
  const type = donnees._formulaire || 'inconnu';
  const dest = DESTINATAIRES[type] || DEST_DEFAUT;
  const objet = '[Site ESIG] ' + (LIBELLES[type] || type) +
    (donnees.nom ? ' — ' + nettoyer(donnees.nom).slice(0, 80) : '');
  const texte = corpsEmail(donnees);

  if (emailPret) {
    try {
      const reply = (donnees.email && /.+@.+\..+/.test(donnees.email)) ? nettoyer(donnees.email) : undefined;
      await getTransport().sendMail({ from: SMTP.from, to: dest, replyTo: reply, subject: objet, text: texte });
      return 'email';
    } catch (e) {
      if (enregistrerRepli(donnees)) return 'fichier(email-echec)';  // ne rien perdre
      throw e;
    }
  }
  if (enregistrerRepli(donnees)) return 'fichier';
  throw new Error('aucune voie de traitement');
}

/* ----- Serveur ----------------------------------------------------- */
http.createServer(function (req, res) {
  const origine = req.headers.origin;
  if (origine && ORIGINES_AUTORISEES.indexOf(origine) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', origine);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST' || req.url !== '/api/formulaire') {
    res.writeHead(404); return res.end('{"erreur":"introuvable"}');
  }
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (!debitOk(ip)) { res.writeHead(429); return res.end('{"erreur":"trop de requetes"}'); }

  let corps = '';
  req.on('data', c => { corps += c; if (corps.length > 50000) req.destroy(); });
  req.on('end', async function () {
    let donnees;
    try { donnees = JSON.parse(corps); }
    catch (e) { res.writeHead(400); return res.end('{"ok":false,"erreur":"json"}'); }
    if (donnees && donnees._gotcha) { res.writeHead(200); return res.end('{"ok":true}'); } // robot
    try {
      const voie = await traiter(donnees);
      res.writeHead(200); res.end(JSON.stringify({ ok: true, voie: voie }));
    } catch (e) {
      res.writeHead(500); res.end(JSON.stringify({ ok: false, erreur: 'traitement' }));
    }
  });
}).listen(PORT, function () {
  console.log('ESIG — service formulaires : http://localhost:' + PORT + '/api/formulaire');
  console.log('E-mail :', emailPret ? ('SMTP ' + SMTP.hote) : 'NON configuré → repli fichier (' + DOSSIER_REPLI + ')');
  if (!nodemailer) console.log('  (module « nodemailer » absent : npm install nodemailer pour activer l\'envoi e-mail)');
  console.log('Origines autorisées :', ORIGINES_AUTORISEES.join(', '));
});
