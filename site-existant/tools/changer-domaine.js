#!/usr/bin/env node
/* =========================================================================
   tools/changer-domaine.js — Change le domaine canonique PARTOUT
   -------------------------------------------------------------------------
   Usage :  node tools/changer-domaine.js https://esig.tg
   Remplace l'ancien domaine (lu dans config-site.js) par le nouveau dans :
   pages HTML, fiches générées, sitemap.xml, robots.txt et config-site.js.
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const nouveau = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https:\/\/[a-z0-9.-]+$/.test(nouveau)) {
  console.error('Usage : node tools/changer-domaine.js https://nouveau-domaine.tg');
  process.exit(1);
}

const conf = fs.readFileSync(path.join(RACINE, 'config-site.js'), 'utf8');
const ancien = (conf.match(/const SITE_URL = "([^"]+)"/) || [])[1];
if (!ancien) { console.error('SITE_URL introuvable dans config-site.js'); process.exit(1); }
if (ancien === nouveau) { console.log('Le domaine est déjà ' + nouveau); process.exit(0); }

let fichiers = 0, remplacements = 0;
function traiter(dossier) {
  for (const nom of fs.readdirSync(dossier)) {
    const chemin = path.join(dossier, nom);
    const stat = fs.statSync(chemin);
    if (stat.isDirectory()) {
      if (['images', 'node_modules', '.git'].includes(nom)) continue;
      traiter(chemin);
    } else if (/\.(html|xml|txt|js|json)$/.test(nom)) {
      const contenu = fs.readFileSync(chemin, 'utf8');
      const occurrences = contenu.split(ancien).length - 1;
      if (occurrences > 0) {
        fs.writeFileSync(chemin, contenu.split(ancien).join(nouveau));
        fichiers++; remplacements += occurrences;
      }
    }
  }
}
traiter(RACINE);
console.log('✓ ' + ancien + ' → ' + nouveau + ' : ' + remplacements + ' remplacements dans ' + fichiers + ' fichiers.');
console.log('  Pensez à activer le bloc de redirection 301 dans .htaccess le jour de la bascule.');
