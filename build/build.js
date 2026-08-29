#!/usr/bin/env node
/* =========================================================================
   build/build.js — Assemblage des pages de l'écosystème ESIG
   -------------------------------------------------------------------------
   OBJECTIF : ne jamais écrire deux fois le même code. L'en-tête, le pied de
   page et les autres fragments partagés (dossier shared/components/) sont
   injectés automatiquement dans chaque page.

   COMMENT ÇA MARCHE
   -----------------
   1. On écrit les pages sources avec l'extension « .src.html ».
   2. Là où l'on veut un fragment partagé, on place un repère :
          <!--#inclure:header-->
          <!--#inclure:footer-->
   3. On lance :  node build/build.js
      → chaque « page.src.html » devient « page.html », fragments injectés.

   JETONS : {{ANNEE}} est remplacé par l'année courante. Une page peut définir
   ses propres jetons via un bloc de configuration en tête de fichier :
          <!--esig-config
          { "NAV": "<li><a href=\"/\">Accueil</a></li>", "CTA_URL": "/admission.html" }
          -->
   Les jetons non renseignés sont simplement vidés.

   Usage :  node build/build.js [dossier]     (défaut : racine du projet)
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DOSSIER_COMPOSANTS = path.join(RACINE, 'shared', 'components');
const cibleArg = process.argv[2];
// Un chemin relatif est interprété par rapport à la racine du projet
// (et non au dossier courant), pour un usage simple depuis n'importe où.
const CIBLE = cibleArg
  ? (path.isAbsolute(cibleArg) ? cibleArg : path.join(RACINE, cibleArg))
  : RACINE;

/* ----- Lister récursivement les fichiers *.src.html ----------------- */
function listerSources(dir, acc) {
  acc = acc || [];
  for (const nom of fs.readdirSync(dir)) {
    if (nom === 'node_modules' || nom === 'site-existant' || nom.startsWith('.')) continue;
    const p = path.join(dir, nom);
    const st = fs.statSync(p);
    if (st.isDirectory()) listerSources(p, acc);
    else if (nom.endsWith('.src.html')) acc.push(p);
  }
  return acc;
}

/* ----- Charger la configuration du site (site.config.json) ---------- */
/* Cherché dans le dossier de la page, puis en remontant jusqu'à la racine.
   Ses valeurs servent de jetons par défaut, communs à toutes les pages du
   site (navigation, CTA…), et sont surchargées par le bloc esig-config
   propre à chaque page. Évite de répéter la navigation dans chaque page. */
const cacheSiteConfig = {};
function chargerSiteConfig(dossier) {
  if (cacheSiteConfig[dossier] !== undefined) return cacheSiteConfig[dossier];
  let d = dossier;
  while (true) {
    const p = path.join(d, 'site.config.json');
    if (fs.existsSync(p)) {
      try { return cacheSiteConfig[dossier] = JSON.parse(fs.readFileSync(p, 'utf8')); }
      catch (e) { console.warn('  ⚠ site.config.json illisible : ' + p); break; }
    }
    if (d === RACINE) break;
    const parent = path.dirname(d);
    if (parent === d) break;
    d = parent;
  }
  return cacheSiteConfig[dossier] = {};
}

/* ----- Charger un fragment partagé (avec cache) --------------------- */
const cacheFragments = {};
function fragment(nom) {
  if (cacheFragments[nom] !== undefined) return cacheFragments[nom];
  const chemin = path.join(DOSSIER_COMPOSANTS, nom + '.html');
  if (!fs.existsSync(chemin)) {
    console.warn('  ⚠ Fragment introuvable : ' + nom + ' (' + chemin + ')');
    return cacheFragments[nom] = '<!-- fragment "' + nom + '" introuvable -->';
  }
  return cacheFragments[nom] = fs.readFileSync(chemin, 'utf8');
}

/* ----- Injecter les inclusions (plusieurs passes pour l'imbrication) - */
function injecterInclusions(html) {
  // Plusieurs passes pour gérer les fragments imbriqués. Une nouvelle
  // expression régulière est créée à chaque passe (pas de lastIndex partagé),
  // et l'on s'arrête dès que le texte est stable.
  for (let passe = 0; passe < 6; passe++) {
    const avant = html;
    html = html.replace(/<!--#inclure:([a-z0-9_\-\/]+)-->/gi, (_, nom) => fragment(nom.trim()));
    if (html === avant) break;
  }
  return html;
}

/* ----- Extraire le bloc de configuration éventuel ------------------- */
function extraireConfig(html) {
  const m = html.match(/<!--esig-config\s*([\s\S]*?)-->/i);
  if (!m) return { config: {}, html: html };
  let config = {};
  try { config = JSON.parse(m[1]); }
  catch (e) { console.warn('  ⚠ Bloc esig-config illisible (JSON invalide) — ignoré.'); }
  return { config: config, html: html.replace(m[0], '') };
}

/* ----- Remplacer les jetons {{CLE}} --------------------------------- */
function remplacerJetons(html, config) {
  const jetons = Object.assign({ ANNEE: String(new Date().getFullYear()) }, config);
  // Jetons fournis
  for (const cle of Object.keys(jetons)) {
    html = html.split('{{' + cle + '}}').join(jetons[cle]);
  }
  // Jetons restants (non fournis) → vidés proprement
  html = html.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
  return html;
}

/* ----- Construire une page ------------------------------------------ */
function construire(cheminSrc) {
  let html = fs.readFileSync(cheminSrc, 'utf8');
  const extrait = extraireConfig(html);
  // Jetons : site.config.json (défauts communs) surchargés par la page.
  const siteConfig = chargerSiteConfig(path.dirname(cheminSrc));
  const config = Object.assign({}, siteConfig, extrait.config);
  html = injecterInclusions(extrait.html);
  html = remplacerJetons(html, config);
  const cheminSortie = cheminSrc.replace(/\.src\.html$/, '.html');
  fs.writeFileSync(cheminSortie, html, 'utf8');
  return path.relative(RACINE, cheminSortie);
}

/* ----- Exécution ---------------------------------------------------- */
const sources = listerSources(CIBLE);
if (!sources.length) {
  console.log('Aucune page « .src.html » trouvée dans ' + path.relative(RACINE, CIBLE) + '.');
  console.log('Rappel : les pages sources portent l\'extension .src.html et contiennent <!--#inclure:header--> etc.');
  process.exit(0);
}
console.log('Assemblage de ' + sources.length + ' page(s)…');
sources.forEach(src => console.log('  ✓ ' + construire(src)));
console.log('Terminé.');
