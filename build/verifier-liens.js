#!/usr/bin/env node
/* =========================================================================
   build/verifier-liens.js — Vérification des liens et ressources internes
   -------------------------------------------------------------------------
   OBJECTIF : garantir qu'aucune page ne pointe vers un lien interne cassé ni
   vers une image/feuille de style/script manquant. Contrôle, sur les paquets
   de déploiement (dist/), chaque attribut href / src / srcset qui désigne un
   fichier local.

   CE QUI EST VÉRIFIÉ / IGNORÉ
   ---------------------------
   · Vérifié : liens relatifs (page.html, ../x.html) et absolus à la racine du
     site (/shared/…, /medias/…, /data/…) → le fichier cible doit exister.
   · Ignoré  : http(s):// (dont les liens inter-sous-domaines esig.tg — normal),
     mailto:, tel:, #ancres, data:, javascript:.

   Note : les liens générés par JavaScript (fiches, actualités, agenda) ne sont
   pas visibles ici — ils sont pilotés par data/*.json et testés séparément.

   PRÉ-REQUIS : lancer d'abord la chaîne de build jusqu'à l'assemblage :
       node build/build.js
       node build/assembler.js
   Puis :
       node build/verifier-liens.js

   Code de sortie : 0 si tout est bon, 1 si au moins un lien est cassé.
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DIST = path.join(RACINE, 'dist');

function walk(dir, acc) {
  acc = acc || [];
  for (const nom of fs.readdirSync(dir)) {
    const p = path.join(dir, nom);
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

/* Extrait les URL des attributs href / src / srcset d'une page. */
function liensDe(html) {
  const out = [];
  let m;
  const reAttr = /(?:href|src)\s*=\s*"([^"]*)"/gi;
  while ((m = reAttr.exec(html))) out.push(m[1]);
  const reSet = /srcset\s*=\s*"([^"]*)"/gi;
  while ((m = reSet.exec(html))) {
    m[1].split(',').forEach(function (c) {
      const u = c.trim().split(/\s+/)[0];
      if (u) out.push(u);
    });
  }
  return out;
}

if (!fs.existsSync(DIST)) {
  console.error('Dossier dist/ introuvable. Lancez d\'abord : node build/build.js && node build/assembler.js');
  process.exit(1);
}

const sites = fs.readdirSync(DIST).filter(function (d) { return fs.statSync(path.join(DIST, d)).isDirectory(); });
let nbLiens = 0, nbPages = 0;
const problemes = [];

for (const site of sites) {
  const root = path.join(DIST, site);
  const pages = walk(root).filter(function (f) { return f.endsWith('.html'); });
  for (const page of pages) {
    nbPages++;
    const html = fs.readFileSync(page, 'utf8');
    for (const lien of liensDe(html)) {
      if (!lien) continue;
      if (/^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(lien)) continue;
      nbLiens++;
      const l = lien.split('#')[0].split('?')[0];
      if (!l) continue;
      let cible = l.startsWith('/') ? path.join(root, l) : path.join(path.dirname(page), l);
      if (l.endsWith('/')) cible = path.join(cible, 'index.html');
      if (!fs.existsSync(cible)) {
        problemes.push(site + '  [' + path.relative(root, page) + ']  →  ' + lien);
      }
    }
  }
}

console.log('=== VÉRIFICATION DES LIENS ===');
console.log('Pages analysées : ' + nbPages);
console.log('Liens/ressources internes vérifiés : ' + nbLiens);
if (problemes.length === 0) {
  console.log('\n✓ Aucun lien interne cassé ni ressource manquante.');
  process.exit(0);
} else {
  console.log('\n✗ ' + problemes.length + ' problème(s) :');
  problemes.slice(0, 200).forEach(function (p) { console.log('  - ' + p); });
  if (problemes.length > 200) console.log('  … (+ ' + (problemes.length - 200) + ' autres)');
  process.exit(1);
}
