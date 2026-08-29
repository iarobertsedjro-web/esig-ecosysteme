#!/usr/bin/env node
/* =========================================================================
   build/generer-fiches.js — Génération des fiches formation statiques
   -------------------------------------------------------------------------
   Produit une page HTML indexable par formation, à partir de la source unique
   data/formations.json, assemblée avec le socle partagé (en-tête, pied de page)
   et enrichie de données structurées Schema.org « Course » (SEO).

   Chaque site ne reçoit que les formations de son pôle :
     - admission  ← pôle « academique »  (BTS, Licence, Master)
     - executive  ← pôle « continue »    (continue, modulaire, langues)

   Usage :  node build/generer-fiches.js [admission|executive]   (défaut : admission)
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const DATA = require(path.join(RACINE, 'data', 'formations.json'));

const SITES = {
  admission: { dir: 'sites/admission', poles: ['academique'], ctaHref: 'index.html#preinscription', ctaLabel: 'Préinscription' },
  executive: { dir: 'sites/executive', poles: ['continue'],   ctaHref: 'devis.html',                ctaLabel: 'Demander un devis' }
};

const cible = process.argv[2] || 'admission';
const conf = SITES[cible];
if (!conf) { console.error('Site inconnu : ' + cible); process.exit(1); }

const SITE_DIR = path.join(RACINE, conf.dir);
const siteConfig = JSON.parse(fs.readFileSync(path.join(SITE_DIR, 'site.config.json'), 'utf8'));
const HEADER = fs.readFileSync(path.join(RACINE, 'shared', 'components', 'header.html'), 'utf8');
const FOOTER = fs.readFileSync(path.join(RACINE, 'shared', 'components', 'footer.html'), 'utf8');
const ANNEE = String(new Date().getFullYear());

/* ----- Utilitaires ----- */
function ech(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function jetons(html, base) {
  // NAV/CTA/ECO d'abord (ils peuvent contenir {{BASE}}), puis BASE en dernier
  // pour résoudre les {{BASE}} introduits par la navigation.
  const map = Object.assign({ ANNEE: ANNEE }, siteConfig);
  for (const k of Object.keys(map)) html = html.split('{{' + k + '}}').join(map[k]);
  html = html.split('{{BASE}}').join(base);
  return html.replace(/\{\{[A-Z0-9_]+\}\}/g, '');
}

/* ----- Rendu d'une fiche ----- */
function fiche(f) {
  const base = '../../';                         // profondeur : formations/<niveau>/
  const urlAbs = 'https://esig.tg/' + f.url;
  const ctaHref = base + (conf.ctaHref || 'index.html#preinscription');
  const ctaLabel = conf.ctaLabel || 'Préinscription';
  const badgeCls = f.pole === 'continue' ? 'badge--continue' : 'badge--academique';
  const estLangue = f.niveau === 'Langue';
  const desc = (f.presentation || f.description || f.resume || (f.intitule + ' — formation ' + f.niveau + ' à l\'ESIG Global Success.'))
    .slice(0, 160);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: f.intitule,
    description: f.presentation || f.description || f.resume || desc,
    provider: { '@type': 'CollegeOrUniversity', name: 'ESIG Global Success', url: 'https://esig.tg' },
    educationalCredentialAwarded: f.niveau,
    about: f.domaine
  };

  // Sections de contenu (uniquement celles disponibles)
  let sections = '';
  if (estLangue) {
    if (f.description) sections += bloc('Présentation', '<p>' + ech(f.description) + '</p>');
    if (f.certification) sections += bloc('Certification visée', '<p>' + ech(f.certification) + '</p>');
    if (f.niveau_cecrl) sections += bloc('Niveau visé (CECRL)', '<p>' + ech(f.niveau_cecrl) + '</p>');
  } else {
    if (f.presentation) sections += bloc('Présentation', '<p>' + ech(f.presentation) + '</p>');
    if (f.competences && f.competences.length) {
      sections += bloc('Compétences visées', '<ul>' + f.competences.map(c => '<li>' + ech(c) + '</li>').join('') + '</ul>');
    } else if (f.resume) {
      sections += bloc('Compétences visées', '<p>' + ech(f.resume) + '</p>');
    }
  }

  if (f.programme && f.programme.length) {
    const prog = f.programme.map(function (b) {
      const mods = (b.modules || []).map(m => '<li>' + ech(m) + '</li>').join('');
      return '<div class="carte"><div class="carte__corps"><h3 class="carte__titre" style="font-size:var(--fs-base)">' +
             ech(b.titre) + '</h3>' + (mods ? '<ul class="pile-s">' + mods + '</ul>' : '') + '</div></div>';
    }).join('');
    sections += bloc('Programme', '<div class="grille grille--2">' + prog + '</div>');
  }

  if (f.debouches && f.debouches.length) {
    sections += bloc('Débouchés', '<ul>' + f.debouches.map(d => '<li>' + ech(d) + '</li>').join('') + '</ul>');
  }
  if (f.poursuite) sections += bloc('Poursuite d\'études', '<p>' + ech(f.poursuite) + '</p>');

  const admissionTxt = f.admission
    ? '<p>' + ech(f.admission).replace(/\n\n/g, '</p><p>') + '</p>'
    : (estLangue
        ? '<p>Inscriptions ouvertes tout au long de l\'année au centre de langues de l\'ESIG, en sessions adaptées aux étudiants comme aux professionnels.</p>'
        : '<p>L\'admission se fait sur dossier et entretien. Les conditions détaillées et les pièces à fournir sont précisées au moment de l\'inscription.</p>');
  sections += bloc(estLangue ? 'Inscription' : 'Admission', admissionTxt +
    '<p><a class="btn btn--accent" href="' + ctaHref + '">' + ech(ctaLabel) + '</a></p>');

  // Aside : informations clés + actions
  const infos = [
    ['Niveau', f.niveau], ['Durée', f.duree], ['Domaine', f.domaine], ['Mention', f.mention],
    ['Certification', f.certification], ['Niveau CECRL', f.niveau_cecrl]
  ].filter(x => x[1]).map(x => '<li><strong>' + ech(x[0]) + '</strong><br><span class="texte-doux">' + ech(x[1]) + '</span></li>').join('');

  const page =
'<!DOCTYPE html>\n<html lang="fr">\n<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>' + ech(f.intitule) + ' — ' + ech(f.niveau) + ' | ESIG Global Success</title>\n' +
'  <meta name="description" content="' + ech(desc) + '">\n' +
'  <link rel="canonical" href="' + ech(urlAbs) + '">\n' +
'  <link rel="icon" type="image/png" href="/shared/img/logo/logo-esig.png">\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:title" content="' + ech(f.intitule) + ' — ' + ech(f.niveau) + '">\n' +
'  <meta property="og:description" content="' + ech(desc) + '">\n' +
'  <meta property="og:url" content="' + ech(urlAbs) + '">\n' +
'  <link rel="stylesheet" href="/shared/css/esig.css">\n' +
'  <link rel="stylesheet" href="/shared/components/nova/nova.css">\n' +
'  <script type="application/ld+json">' + JSON.stringify(schema) + '</script>\n' +
'</head>\n<body>\n\n' +
jetons(HEADER, base) + '\n\n' +
'<main id="contenu">\n' +
'  <div class="conteneur">\n' +
'    <nav class="fil-ariane" aria-label="Fil d\'Ariane"><ol>' +
'<li><a href="' + base + 'index.html">Accueil</a></li>' +
'<li><a href="' + base + 'catalogue.html">Nos formations</a></li>' +
'<li><span aria-current="page">' + ech(f.intitule) + '</span></li></ol></nav>\n' +
'  </div>\n\n' +
'  <section class="section" style="padding-block:var(--e-6)">\n' +
'    <div class="conteneur">\n' +
'      <p class="kicker">' + ech(f.niveau) + ' · ' + ech(f.domaine) + '</p>\n' +
'      <h1>' + ech(f.intitule) + '</h1>\n' +
'      <hr class="filet-or">\n' +
'      <div class="flex flex--enroule flex--centre">' +
'<span class="badge ' + badgeCls + '">' + ech(f.niveau) + '</span>' +
(f.duree ? '<span class="badge badge--contour">' + ech(f.duree) + '</span>' : '') +
(f.mention ? '<span class="badge badge--contour">' + ech(f.mention) + '</span>' : '') +
'</div>\n' +
'    </div>\n' +
'  </section>\n\n' +
'  <div class="conteneur"><div class="deux-colonnes">\n' +
'    <div class="pile-l">' + sections + '</div>\n' +
'    <aside class="pile">\n' +
'      <div class="carte"><div class="carte__corps">\n' +
'        <h2 class="carte__titre" style="font-size:var(--fs-md)">En bref</h2>\n' +
'        <ul class="pile-s" style="list-style:none;padding:0">' + infos + '</ul>\n' +
'      </div></div>\n' +
'      <div class="carte"><div class="carte__corps">\n' +
'        <p><strong>Intéressé(e) ?</strong></p>\n' +
'        <a class="btn btn--accent btn--bloc" href="' + ctaHref + '">' + ech(ctaLabel) + '</a>\n' +
'        <a class="btn btn--secondaire btn--bloc" href="' + base + 'index.html#contact" style="margin-top:var(--e-2)">Poser une question</a>\n' +
'        <a class="btn btn--secondaire btn--bloc" href="' + base + 'catalogue.html" style="margin-top:var(--e-2)">Retour au catalogue</a>\n' +
'      </div></div>\n' +
'    </aside>\n' +
'  </div></div>\n\n' +
'  <section class="section"><div class="conteneur"><div class="bloc-cta">\n' +
'    <p class="kicker">Build Your Future</p>\n' +
'    <h2>Construisez votre trajectoire avec l\'ESIG</h2>\n' +
'    <div class="bloc-cta__actions"><a class="btn btn--accent btn--large" href="' + ctaHref + '">' + ech(ctaLabel) + '</a>' +
'<a class="btn btn--fantome btn--large" href="' + base + 'catalogue.html">Voir d\'autres formations</a></div>\n' +
'  </div></div></section>\n' +
'</main>\n\n' +
jetons(FOOTER, base) + '\n' +
'<script>window.ESIG_CONFIG={whatsapp:"+22893033351"};window.NOVA_CONFIG={endpoint:"http://localhost:8787/api/assistant",nom:"ESIG NOVA",accroche:"Une question sur cette formation ? Je vous oriente.",whatsapp:"+22893033351"};</script>\n' +
'<script src="/shared/js/commun.js" defer></script>\n' +
'<script src="/shared/components/nova/nova.js" defer></script>\n' +
'</body>\n</html>\n';

  return page;
}

function bloc(titre, contenu) {
  return '<section><h2>' + ech(titre) + '</h2><hr class="filet-or">' + contenu + '</section>';
}

/* ----- Génération ----- */
const formations = DATA.formations.filter(f => conf.poles.indexOf(f.pole) !== -1);
let n = 0;
for (const f of formations) {
  const dest = path.join(SITE_DIR, f.url);            // ex. sites/admission/formations/bts/x.html
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fiche(f), 'utf8');
  n++;
}
console.log('Fiches générées pour « ' + cible + ' » : ' + n + ' (' + conf.poles.join(', ') + ')');
