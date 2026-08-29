#!/usr/bin/env node
/* =========================================================================
   build/audit.js — Audit automatisé de toutes les pages de l'écosystème
   -------------------------------------------------------------------------
   Contrôles (par page HTML générée dans sites/) :
     · <!DOCTYPE html> présent          · un seul <title>
     · lang="fr"                        · exactement un <h1>
     · toutes les <img> ont un alt      · aucun jeton {{…}} résiduel
     · aucun repère <!--#inclure: résiduel
   Ne remplace pas le validateur W3C officiel (à lancer en ligne au
   déploiement), mais détecte les défauts structurels et d'accessibilité
   les plus courants sur l'ensemble des pages.

   Usage :  node build/audit.js
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const SITES = path.join(RACINE, 'sites');

function listerHtml(dir, acc) {
  acc = acc || [];
  for (const nom of fs.readdirSync(dir)) {
    const p = path.join(dir, nom);
    const st = fs.statSync(p);
    if (st.isDirectory()) listerHtml(p, acc);
    else if (nom.endsWith('.html') && !nom.endsWith('.src.html')) acc.push(p);
  }
  return acc;
}

function auditer(html) {
  const pb = [];
  if (!/<!doctype html>/i.test(html)) pb.push('doctype manquant');
  if (!/<html[^>]*\blang="fr"/i.test(html)) pb.push('lang="fr" manquant');
  const titres = (html.match(/<title>/gi) || []).length;
  if (titres !== 1) pb.push(titres + ' <title>');
  const h1 = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1 !== 1) pb.push(h1 + ' <h1>');
  // images sans alt
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const sansAlt = imgs.filter(t => !/\balt=/i.test(t)).length;
  if (sansAlt) pb.push(sansAlt + ' <img> sans alt');
  if (/\{\{[A-Z0-9_]+\}\}/.test(html)) pb.push('jeton {{…}} résiduel');
  if (/<!--#inclure:/.test(html)) pb.push('repère #inclure résiduel');
  return pb;
}

const fichiers = fs.existsSync(SITES) ? listerHtml(SITES) : [];
let ok = 0, poidsTotal = 0;
const echecs = [];
const parSite = {};

for (const f of fichiers) {
  const html = fs.readFileSync(f, 'utf8');
  poidsTotal += Buffer.byteLength(html);
  const rel = path.relative(SITES, f).replace(/\\/g, '/');
  const site = rel.split('/')[0];
  parSite[site] = (parSite[site] || 0) + 1;
  const pb = auditer(html);
  if (pb.length) echecs.push({ page: rel, pb }); else ok++;
}

console.log('=== AUDIT ÉCOSYSTÈME ===');
console.log('Pages HTML analysées : ' + fichiers.length);
console.log('Par site : ' + JSON.stringify(parSite));
console.log('Poids HTML total : ' + (poidsTotal / 1024 / 1024).toFixed(2) + ' Mo (moyenne ' + Math.round(poidsTotal / (fichiers.length || 1) / 1024) + ' Ko/page)');
console.log('Conformes : ' + ok + ' / ' + fichiers.length);
if (echecs.length) {
  console.log('\n⚠ ' + echecs.length + ' page(s) avec anomalie :');
  echecs.slice(0, 40).forEach(e => console.log('   - ' + e.page + ' : ' + e.pb.join(', ')));
  if (echecs.length > 40) console.log('   … (+' + (echecs.length - 40) + ')');
  process.exitCode = 1;
} else {
  console.log('\n✓ Aucune anomalie structurelle ni d\'accessibilité détectée.');
}
