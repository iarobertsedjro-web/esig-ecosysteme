#!/usr/bin/env node
/* =========================================================================
   build/assembler-staging.js — Paquet de PRÉVISUALISATION (Netlify)
   -------------------------------------------------------------------------
   Regroupe les 6 sites dans UN seul dossier navigable « dist-staging/ »,
   pour une mise en ligne de test (Netlify « Deploy manually » / glisser-déposer)
   AVANT le déploiement définitif par sous-domaine (voir assembler.js + §DEPLOIEMENT).

   Structure produite :
     dist-staging/
       index.html, agrements.html, …        ← www (institutionnel) à la racine
       admission/  executive/  cooperation/  carrieres/  alumni/  news/  tech/
       shared/  data/  medias/               ← mutualisés une seule fois
       robots.txt (Disallow), _headers (noindex)

   Adaptations propres à la préviz (pas de backend Node sur Netlify) :
     · liens inter-sous-domaines réécrits en chemins internes (/admission/…) ;
     · NOVA masqué (endpoint vidé) ;
     · formulaires en « confirmation directe » (endpoint vidé, aucun envoi) ;
     · dossiers internes _* exclus (documents réservés, etc.) ;
     · indexation bloquée (robots.txt + X-Robots-Tag).

   Usage :  node build/build.js  &&  node build/assembler-staging.js
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const OUT = path.join(RACINE, 'dist-staging');
const SITES = ['www', 'admission', 'executive', 'cooperation', 'carrieres', 'alumni', 'news', 'tech'];
const PARTAGES = ['shared', 'data', 'medias'];

function copierPages(site, dest) {
  const src = path.join(RACINE, 'sites', site);
  fs.mkdirSync(dest, { recursive: true });
  (function copie(dir, rel) {
    for (const nom of fs.readdirSync(dir)) {
      if (nom.endsWith('.src.html') || nom === 'site.config.json') continue;
      const p = path.join(dir, nom);
      const cible = path.join(dest, rel, nom);
      if (fs.statSync(p).isDirectory()) { fs.mkdirSync(cible, { recursive: true }); copie(p, path.join(rel, nom)); }
      else fs.copyFileSync(p, cible);
    }
  })(src, '');
}

function purgerInternes(dir) {
  for (const nom of fs.readdirSync(dir)) {
    const p = path.join(dir, nom);
    if (!fs.statSync(p).isDirectory()) continue;
    if (nom.startsWith('_')) { fs.rmSync(p, { recursive: true, force: true }); continue; }
    purgerInternes(p);
  }
}

// Réécriture des liens pour le mode « un seul site »
function reecrire(html) {
  return html
    .replace(/https:\/\/admission\.esig\.tg\/?/g, '/admission/')
    .replace(/https:\/\/executive\.esig\.tg\/?/g, '/executive/')
    .replace(/https:\/\/cooperation\.esig\.tg\/?/g, '/cooperation/')
    .replace(/https:\/\/carrieres\.esig\.tg\/?/g, '/carrieres/')
    .replace(/https:\/\/alumni\.esig\.tg\/?/g, '/alumni/')
    .replace(/https:\/\/news\.esig\.tg\/?/g, '/news/')
    .replace(/https:\/\/tech\.esig\.tg\/?/g, '/tech/')
    // Anciens sous-domaines (transition) : repliés sur les nouveaux espaces
    .replace(/https:\/\/international\.esig\.tg\/?/g, '/cooperation/')
    .replace(/https:\/\/entreprises\.esig\.tg\/?/g, '/carrieres/')
    .replace(/https:\/\/esig\.tg\/?/g, '/')
    .replace(/http:\/\/localhost:8787\/api\/assistant/g, '/api/assistant')   // NOVA visible (dégradé : « indisponible » si on l'interroge, faute de backend)
    .replace(/http:\/\/localhost:8788\/api\/formulaire/g, ''); // formulaires : confirmation directe
}

function walkHtml(dir, cb) {
  for (const nom of fs.readdirSync(dir)) {
    const p = path.join(dir, nom);
    if (fs.statSync(p).isDirectory()) walkHtml(p, cb);
    else if (nom.endsWith('.html')) cb(p);
  }
}

if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// 1. assets mutualisés à la racine
for (const part of PARTAGES) {
  const s = path.join(RACINE, part);
  if (fs.existsSync(s)) fs.cpSync(s, path.join(OUT, part), { recursive: true });
}
// gabarits de build inutiles en ligne
const frag = path.join(OUT, 'shared', 'components');
if (fs.existsSync(frag)) for (const n of fs.readdirSync(frag)) if (n.endsWith('.html')) fs.rmSync(path.join(frag, n), { force: true });

// Correctif D8 (2026-08-29) : les fichiers SERVEUR des composants ne doivent
// JAMAIS figurer dans le dossier publié. Seuls nova.js et nova.css sont des
// assets d'exécution navigateur. Le prompt système, les relais Node, leurs
// README techniques et la base documentaire du relais restent côté serveur.
// (Leur secret n'est pas une barrière de sécurité — les contrôles restent
// côté serveur — mais leur publication facilite inutilement l'analyse.)
const FICHIERS_SERVEUR = [
  'shared/components/nova/prompt-systeme.md',
  'shared/components/nova/serveur-relais.js',
  'shared/components/nova/README-NOVA.md',
  'shared/components/nova/base-documentaire',
  'shared/components/formulaires/serveur-formulaires.js',
  'shared/components/formulaires/README-FORMULAIRES.md',
];
for (const rel of FICHIERS_SERVEUR) {
  const p = path.join(OUT, rel);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// 2. pages : www à la racine, les autres en sous-dossier
copierPages('www', OUT);
for (const site of SITES) if (site !== 'www') copierPages(site, path.join(OUT, site));

// 3. exclure les dossiers internes (_documents-reserves, _a-integrer, _boite-reception…)
purgerInternes(OUT);

// 4. réécrire les liens dans tout le HTML
let n = 0;
walkHtml(OUT, function (p) { fs.writeFileSync(p, reecrire(fs.readFileSync(p, 'utf8')), 'utf8'); n++; });

// 5. bloquer l'indexation de la préviz
fs.writeFileSync(path.join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n', 'utf8');
fs.writeFileSync(path.join(OUT, '_headers'), '/*\n  X-Robots-Tag: noindex\n', 'utf8');

console.log('✓ dist-staging/ prêt — ' + n + ' pages réécrites.');
console.log('  Glissez le dossier « dist-staging » sur Netlify (Add new site → Deploy manually).');
