#!/usr/bin/env node
/* =========================================================================
   build/assembler.js — Assemblage des paquets de déploiement
   -------------------------------------------------------------------------
   Produit, dans dist/, un dossier AUTONOME par sous-domaine, prêt à être
   copié tel quel à la racine web du sous-domaine correspondant.

   Chaque dist/<site>/ contient :
     · les pages du site (sites/<site>/, hors *.src.html et site.config.json)
     · shared/  (design system, JS, composants, NOVA)
     · data/    (formations.json, actualites.json)
     · medias/  (images et documents)
   Ainsi les chemins absolus /shared, /data, /medias, /formations/… résolvent
   correctement à la racine de chaque sous-domaine.

   À lancer APRÈS build.js et generer-fiches.js.
   Usage :  node build/assembler.js
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const DIST = path.join(RACINE, 'dist');

const SITES = ['www', 'admission', 'executive', 'cooperation', 'carrieres', 'alumni', 'news', 'tech'];
const PARTAGES = ['shared', 'data', 'medias'];

function copierSite(site, dest) {
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

if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });

for (const site of SITES) {
  if (!fs.existsSync(path.join(RACINE, 'sites', site))) { console.warn('  ⚠ site absent : ' + site); continue; }
  const dest = path.join(DIST, site);
  copierSite(site, dest);
  for (const part of PARTAGES) {
    const src = path.join(RACINE, part);
    if (fs.existsSync(src)) fs.cpSync(src, path.join(dest, part), { recursive: true });
  }
  // Nettoyage : retirer tout dossier interne (préfixe « _ »), où qu'il soit.
  // Couvre la boîte de dépôt medias/_a-integrer, les documents réservés
  // medias/_documents-reserves (agrément, certificat) ET la boîte de réception
  // des formulaires _boite-reception — jamais exposés publiquement.
  (function purgerInternes(dir) {
    for (const nom of fs.readdirSync(dir)) {
      const p = path.join(dir, nom);
      if (!fs.statSync(p).isDirectory()) continue;
      if (nom.startsWith('_')) { fs.rmSync(p, { recursive: true, force: true }); continue; }
      purgerInternes(p);
    }
  })(dest);
  // Nettoyage : les gabarits de build (shared/components/*.html : header, footer)
  // sont déjà injectés dans les pages et contiennent des jetons non remplacés.
  // Inutile de les exposer. On conserve shared/components/nova/ (assets d'exécution).
  const fragments = path.join(dest, 'shared', 'components');
  if (fs.existsSync(fragments)) {
    for (const nom of fs.readdirSync(fragments)) {
      if (nom.endsWith('.html')) fs.rmSync(path.join(fragments, nom), { force: true });
    }
  }
  console.log('  ✓ dist/' + site + ' (' + (site === 'www' ? 'esig.tg' : site + '.esig.tg') + ')');
}
console.log('Paquets de déploiement prêts dans dist/.');
