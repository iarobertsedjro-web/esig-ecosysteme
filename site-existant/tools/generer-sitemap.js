#!/usr/bin/env node
/* =========================================================================
   tools/generer-sitemap.js — Régénère sitemap.xml
   À exécuter après generer-fiches.js :  node tools/generer-sitemap.js
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const conf = fs.readFileSync(path.join(RACINE, 'config-site.js'), 'utf8');
const SITE = (conf.match(/const SITE_URL = "([^"]+)"/) || [])[1] || 'https://esig.tg';
const JOUR = new Date().toISOString().slice(0, 10);

function url(loc, prio, freq) {
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${JOUR}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
}

const entrees = [
  url('/', '1.0', 'weekly'),
  url('/parcours-academique.html', '0.9', 'weekly'),
  url('/formation-continue.html', '0.9', 'weekly'),
  url('/formations/', '0.9', 'weekly'),
  url('/admission.html', '0.8', 'monthly'),
  url('/actualites.html', '0.7', 'weekly'),
  url('/contact.html', '0.6', 'yearly'),
  url('/mentions-legales.html', '0.2', 'yearly'),
  url('/confidentialite.html', '0.2', 'yearly'),
  url('/cookies.html', '0.2', 'yearly'),
  url('/accessibilite.html', '0.2', 'yearly'),
  url('/cgu.html', '0.2', 'yearly')
];

/* Fiches de formation générées */
const dossierFormations = path.join(RACINE, 'formations');
if (fs.existsSync(dossierFormations)) {
  for (const niveau of fs.readdirSync(dossierFormations)) {
    const sousDossier = path.join(dossierFormations, niveau);
    if (!fs.statSync(sousDossier).isDirectory()) continue;
    for (const fichier of fs.readdirSync(sousDossier)) {
      if (fichier.endsWith('.html')) {
        entrees.push(url('/formations/' + niveau + '/' + fichier, '0.7', 'monthly'));
      }
    }
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entrees.join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(RACINE, 'sitemap.xml'), xml);
console.log('✓ sitemap.xml régénéré : ' + entrees.length + ' URLs (domaine ' + SITE + ')');
