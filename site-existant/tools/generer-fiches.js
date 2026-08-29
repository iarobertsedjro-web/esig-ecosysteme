#!/usr/bin/env node
/* =========================================================================
   tools/generer-fiches.js — Génère les pages HTML statiques des formations
   -------------------------------------------------------------------------
   POURQUOI : le contenu des formations doit être présent dans le HTML pour
   être indexé par Google et lisible sans JavaScript (SEO + accessibilité).

   QUAND L'EXÉCUTER : après CHAQUE modification de formations-data.js.

   COMMENT :   node tools/generer-fiches.js
   RÉSULTAT :  un dossier /formations/ avec une page par formation
               (ex. formations/bts/comptabilite-gestion-des-entreprises.html)
               + un index du catalogue (formations/index.html).
   ========================================================================= */

'use strict';
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'formations');

/* ----- Chargement des données et de la configuration ----- */
const src = fs.readFileSync(path.join(RACINE, 'formations-data.js'), 'utf8');
eval(src + ';globalThis.FD = FORMATIONS_DATA; globalThis.LD = typeof LANGUES_DATA !== "undefined" ? LANGUES_DATA : null;');
const conf = fs.readFileSync(path.join(RACINE, 'config-site.js'), 'utf8');
const mSite = conf.match(/const SITE_URL = "([^"]+)"/);
const SITE = mSite ? mSite[1] : 'https://esig.tg';

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ----- Image d'illustration par domaine (identique à fiche.js) ----- */
const IMAGE_PAR_DOMAINE = [
  ['intelligence artificielle', 'campus-01'], ['data', 'campus-01'],
  ['cybersécurité', 'campus-02'], ['sécurité', 'campus-02'],
  ['développement logiciel', 'campus-03'], ['marketing', 'campus-04'],
  ['communication', 'campus-04'], ['supply chain', 'campus-05'],
  ['logistique', 'campus-05'], ['management', 'campus-06'],
  ['finance', 'campus-06'], ['gestion', 'campus-06'], ['économiques', 'campus-06'],
  ['réseaux', 'campus-07'], ['télécommunications', 'campus-07'],
  ['entrepreneuriat', 'campus-08'], ['innovation', 'campus-08'],
  ['génie civil', 'campus-09'], ['infrastructures', 'campus-09'],
  ['mécanique', 'campus-10'], ['électrique', 'campus-10'], ['énergies', 'campus-10'],
  ['industrial', 'campus-10'], ['techniques', 'campus-10'],
  ['hôtellerie', 'campus-05'], ['tourisme', 'campus-05'],
  ['juridiques', 'campus-03'], ['administration', 'campus-03'],
  ['homme', 'campus-08'], ['société', 'campus-08']
];
function imageFor(spec) {
  if (spec.image) return '/' + spec.image;
  const dom = (spec.domaine || '').toLowerCase();
  for (const [motif, img] of IMAGE_PAR_DOMAINE) {
    if (dom.indexOf(motif) !== -1) return '/images/campus/' + img + '.jpg';
  }
  return '/images/campus/campus-01.jpg';
}

const PAGE_NIVEAU = {
  bts: '/parcours-academique.html?tab=bts',
  licence: '/parcours-academique.html?tab=licence',
  master: '/parcours-academique.html?tab=master',
  continue: '/formation-continue.html?tab=continue',
  modulaire: '/formation-continue.html?tab=modulaire',
  langues: '/formation-continue.html?tab=langues'
};
const NOM_NIVEAU = {
  bts: 'BTS', licence: 'Licence', master: 'Master / MBA',
  continue: 'Formation continue', modulaire: 'Formation modulaire', langues: 'Langues'
};

function shortSlug(niveauId, slug) {
  const prefixe = (niveauId === 'langues' ? 'langue' : niveauId) + '-';
  return slug.indexOf(prefixe) === 0 ? slug.slice(prefixe.length) : slug;
}
function urlFiche(niveauId, slug) {
  return '/formations/' + niveauId + '/' + shortSlug(niveauId, slug) + '.html';
}

/* ----- Blocs de contenu (portage de fiche.js) ----- */
function paragraphes(texte) {
  return texte.split(/\n\s*\n/).map(p => '<p>' + esc(p.trim()) + '</p>').join('\n          ');
}
function blocPresentation(spec) {
  if (spec.presentation) return paragraphes(spec.presentation);
  return '<p>Cette formation prépare au métier visé en développant les compétences suivantes : ' +
    esc(spec.competences) + '.</p>';
}
function blocCompetences(spec) {
  if (spec.competences_detail && spec.competences_detail.length) {
    return '<ul class="fiche-comp-list">' +
      spec.competences_detail.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>';
  }
  const items = String(spec.competences || '').split(/[,;]/).map(x => x.trim()).filter(Boolean);
  return '<ul class="fiche-comp-list">' + items.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>';
}
function blocProgramme(spec) {
  if (Array.isArray(spec.programme) && spec.programme.length && spec.programme[0].titre) {
    return spec.programme.map(bloc =>
      '<div class="fiche-prog-bloc"><h3>' + esc(bloc.titre) + '</h3><ul class="fiche-module-list">' +
      (bloc.modules || []).map(m => '<li>' + esc(m) + '</li>').join('') + '</ul></div>'
    ).join('\n          ');
  }
  if (spec.programme) {
    const items = Array.isArray(spec.programme) ? spec.programme : String(spec.programme).split(/[,;]/);
    return '<ul class="fiche-module-list">' + items.map(m => '<li>' + esc(String(m).trim()) + '</li>').join('') + '</ul>';
  }
  return '<div class="fiche-soon"><span class="soon-tag">Bientôt disponible</span>' +
    '<p>Le programme détaillé (matières, volumes horaires, projets) sera prochainement publié.</p></div>';
}
function blocDebouches(spec) {
  let html = '<ul class="fiche-jobs">' + (spec.debouches || []).map(j => '<li>' + esc(j) + '</li>').join('') + '</ul>';
  if (spec.poursuite) {
    html += '<div class="fiche-poursuite"><h3>Poursuite d\'études</h3><p>' + esc(spec.poursuite) + '</p></div>';
  }
  return html;
}
function blocAdmission(spec) {
  const profil = spec.profil
    ? '<div class="fiche-profil"><h3>Profil d\'entrée</h3><p>' + esc(spec.profil) + '</p></div>' : '';
  if (spec.admission) return profil + paragraphes(spec.admission);
  if (spec.profil) {
    return profil + '<p>L\'admission s\'effectue sur dossier et entretien d\'orientation. La procédure complète est détaillée sur la page <a href="/admission.html">Admission</a>.</p>';
  }
  const acces = spec.niveau_id === 'master' ? 'une Licence (Bac+3) ou diplôme équivalent'
    : spec.niveau_id === 'licence' ? 'le Baccalauréat (pour la 1re année) ou un Bac+2 (admission parallèle)'
    : 'le Baccalauréat ou un diplôme équivalent';
  return '<p>L\'admission s\'effectue sur dossier et entretien d\'orientation. Cette formation est accessible aux candidats titulaires de ' + acces + '.</p>' +
    '<p>La procédure complète (pièces du dossier, étapes) est détaillée sur la page <a href="/admission.html">Admission</a>.</p>';
}

/* ----- Description SEO (155 caractères max) ----- */
function metaDescription(spec) {
  let d = spec.presentation ? spec.presentation.split(/\n/)[0]
    : (spec.titre + ' (' + spec.niveau_nom + ') à l\'ESIG Global Success, Lomé. Compétences : ' + spec.competences + '.');
  if (d.length > 155) d = d.slice(0, 152).replace(/\s+\S*$/, '') + '…';
  return d;
}

/* ----- Données structurées ----- */
function jsonLd(spec, url, niveauId) {
  const course = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    'name': spec.titre,
    'description': metaDescription(spec),
    'url': SITE + url,
    'inLanguage': 'fr',
    'courseCode': spec.slug,
    'educationalCredentialAwarded': spec.niveau_label + ' — ' + spec.niveau_nom,
    'timeRequired': spec.duree,
    'about': spec.domaine,
    'provider': {
      '@type': 'CollegeOrUniversity',
      'name': 'ESIG Global Success',
      'url': SITE,
      'address': { '@type': 'PostalAddress', 'addressLocality': 'Lomé', 'addressCountry': 'TG' }
    },
    'hasCourseInstance': {
      '@type': 'CourseInstance',
      'courseMode': 'onsite',
      'location': { '@type': 'Place', 'name': 'Campus ESIG Global Success', 'address': 'Bè Kpota, Bd. de l\'Oti, Lomé, Togo' }
    }
  };
  const fil = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE + '/' },
      { '@type': 'ListItem', 'position': 2, 'name': 'Formations', 'item': SITE + '/formations/' },
      { '@type': 'ListItem', 'position': 3, 'name': NOM_NIVEAU[niveauId], 'item': SITE + PAGE_NIVEAU[niveauId].split('?')[0] },
      { '@type': 'ListItem', 'position': 4, 'name': spec.titre, 'item': SITE + url }
    ]
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(course, null, 2) +
    '\n  <\/script>\n  <script type="application/ld+json">\n' + JSON.stringify(fil, null, 2) + '\n  <\/script>';
}

/* ----- Gabarit de page ----- */
function gabarit({ titre, description, url, corps, ld }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(titre)} — ESIG Global Success</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${SITE}${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(titre)} — ESIG Global Success">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${SITE}${url}">
  <meta property="og:image" content="${SITE}/images/hero/hero-diplomes.jpg">
  <meta property="og:site_name" content="ESIG Global Success">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/images/logo/logo-esig.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/formations.css">
  <link rel="stylesheet" href="/fiche.css">
  <link rel="stylesheet" href="/social.css">
  <link rel="stylesheet" href="/base-commun.css">
  ${ld}
</head>
<body>

  <a class="skip-link" href="#contenu">Aller au contenu principal</a>

  <header>
    <div class="container nav">
      <a href="/" class="logo">
        <span class="logo-mark"></span>
        ESIG Global Success
      </a>
      <nav class="nav-links" id="navLinks" aria-label="Navigation principale">
        <a href="/">Accueil</a>
        <a href="/parcours-academique.html">Parcours académique</a>
        <a href="/formation-continue.html">Formation Continue &amp; Modulaire</a>
        <a href="/actualites.html">Actualités</a>
        <a href="/admission.html">Admission</a>
        <a href="/contact.html">Contact</a>
        <a href="/index.html?preinscription=1" class="btn btn-teal">Pré-inscription</a>
      </nav>
      <button class="menu-toggle" id="menuToggle" aria-label="Ouvrir le menu de navigation" aria-expanded="false" aria-controls="navLinks">&#9776;</button>
    </div>
  </header>

  <main id="contenu">
${corps}
  </main>

  <footer>
    <div class="container">
      <div class="footer-top">
        <div class="footer-logo">
          <span class="logo-mark"></span>
          ESIG Global Success
        </div>
        <nav class="footer-links" aria-label="Pied de page">
          <a href="/">Accueil</a>
          <a href="/parcours-academique.html">Parcours académique</a>
          <a href="/formation-continue.html">Formation Continue &amp; Modulaire</a>
          <a href="/actualites.html">Actualités</a>
          <a href="/admission.html">Admission</a>
          <a href="/contact.html">Contact</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <address>Bd. de l'Oti, Bè Kpota · 11 BP 149 · Lomé, Togo · <a href="tel:+22893033351">(+228)&nbsp;93&nbsp;03&nbsp;33&nbsp;51</a></address>
        <nav class="footer-legal" aria-label="Informations légales">
          <a href="/mentions-legales.html">Mentions légales</a>
          <a href="/confidentialite.html">Politique de confidentialité</a>
          <a href="/cookies.html">Cookies</a>
          <a href="/accessibilite.html">Déclaration d'accessibilité</a>
          <a href="/cgu.html">CGU</a>
        </nav>
        <p>© 2026 ESIG Global Success · Tous droits réservés</p>
      </div>
    </div>
  </footer>

  <script src="/config-site.js"><\/script>
  <script src="/social.js"><\/script>
  <script src="/assistant.js"><\/script>
  <script src="/commun.js"><\/script>
</body>
</html>
`;
}

/* ----- Corps d'une fiche formation (sections empilées, 100 % indexables) ----- */
function corpsFormation(spec, niveauId, url) {
  const img = imageFor(spec);
  const sections = [
    ['presentation', 'Présentation', blocPresentation(spec)],
    ['competences', 'Compétences visées', blocCompetences(spec)],
    ['programme', 'Programme', blocProgramme(spec)],
    ['debouches', 'Débouchés', blocDebouches(spec)],
    ['admission', 'Conditions d\'admission', blocAdmission(spec)]
  ];
  const nav = sections.map(([id, label]) => '<a href="#' + id + '">' + esc(label) + '</a>').join('\n            ');
  const blocs = sections.map(([id, label, html]) =>
    `<section class="fiche-section" id="${id}" aria-labelledby="titre-${id}">
            <h2 id="titre-${id}">${esc(label)}</h2>
            ${html}
          </section>`).join('\n          ');

  return `    <section class="fiche-hero fiche-hero-img" style="background-image:linear-gradient(160deg,rgba(31,56,100,.62) 0%,rgba(22,40,74,.55) 100%),url('${img}')">
      <div class="container">
        <nav class="breadcrumb fil-ariane-fiche" aria-label="Fil d'Ariane">
          <a href="/">Accueil</a> <span aria-hidden="true">›</span>
          <a href="/formations/">Formations</a> <span aria-hidden="true">›</span>
          <a href="${PAGE_NIVEAU[niveauId]}">${esc(NOM_NIVEAU[niveauId])}</a> <span aria-hidden="true">›</span>
          <span class="current" aria-current="page">${esc(spec.titre)}</span>
        </nav>
        <div class="fiche-level-badge">${esc(spec.niveau_nom)} · ${esc(spec.duree)}</div>
        <h1>${esc(spec.titre)}</h1>
        <div class="fiche-meta">
          <span class="fiche-meta-item"><strong>Domaine</strong>${esc(spec.domaine)}</span>
          <span class="fiche-meta-item"><strong>Mention</strong>${esc(spec.mention)}</span>
        </div>
      </div>
    </section>
    <div class="container fiche-body">
      <div class="fiche-grid">
        <div class="fiche-main">
          <nav class="fiche-sommaire" aria-label="Sommaire de la fiche">
            ${nav}
          </nav>
          ${blocs}
        </div>
        <aside class="fiche-side">
          <div class="fiche-card-cta">
            <h3>Intéressé par cette formation ?</h3>
            <p>Faites votre pré-inscription. Notre équipe vous recontacte sous 48h.</p>
            <a href="/index.html?preinscription=1" class="btn btn-teal">Faire ma pré-inscription</a>
            <a href="/contact.html" class="btn btn-ghost">Demander une brochure</a>
            <a href="${PAGE_NIVEAU[niveauId]}" class="btn btn-ghost">← Toutes les formations</a>
          </div>
          <div class="fiche-facts">
            <div class="fact"><span class="fact-label">Diplôme</span><span class="fact-val">${esc(spec.niveau_label)}</span></div>
            <div class="fact"><span class="fact-label">Niveau</span><span class="fact-val">${esc(spec.niveau_nom)}</span></div>
            <div class="fact"><span class="fact-label">Durée</span><span class="fact-val">${esc(spec.duree)}</span></div>
            <div class="fact"><span class="fact-label">Modalité</span><span class="fact-val">Présentiel — Campus de Lomé</span></div>
            <div class="fact"><span class="fact-label">Rentrée</span><span class="fact-val">Voir calendrier — nous contacter</span></div>
            <div class="fact"><span class="fact-label">Frais</span><span class="fact-val">Sur demande (devis gratuit)</span></div>
            <div class="fact"><span class="fact-label">Contact</span><span class="fact-val"><a href="mailto:admissions@esig.tg">admissions@esig.tg</a></span></div>
          </div>
        </aside>
      </div>
    </div>`;
}

/* ----- Corps d'une fiche langue ----- */
function corpsLangue(it, url) {
  const sections = [
    ['objectifs', 'Objectifs', '<p class="fiche-comp">' + esc(it.desc) + '</p>'],
    ['certifications', 'Certifications préparées', '<p class="fiche-comp">' + esc(it.certif) + '</p>'],
    ['inscription', 'Inscription', '<p>L\'inscription est ouverte tout au long de l\'année. Le calendrier des sessions et les tarifs sont précisés lors de la pré-inscription. Voir aussi la page <a href="/admission.html">Admission</a>.</p>']
  ];
  const blocs = sections.map(([id, label, html]) =>
    `<section class="fiche-section" id="${id}" aria-labelledby="titre-${id}">
            <h2 id="titre-${id}">${esc(label)}</h2>
            ${html}
          </section>`).join('\n          ');
  return `    <section class="fiche-hero fiche-hero-img" style="background-image:linear-gradient(160deg,rgba(31,56,100,.62) 0%,rgba(22,40,74,.55) 100%),url('/images/campus/campus-04.jpg')">
      <div class="container">
        <nav class="breadcrumb fil-ariane-fiche" aria-label="Fil d'Ariane">
          <a href="/">Accueil</a> <span aria-hidden="true">›</span>
          <a href="/formations/">Formations</a> <span aria-hidden="true">›</span>
          <a href="${PAGE_NIVEAU.langues}">Langues</a> <span aria-hidden="true">›</span>
          <span class="current" aria-current="page">${esc(it.langue)}</span>
        </nav>
        <div class="fiche-level-badge">Certification ${esc(it.niveau)}</div>
        <h1>Cours de ${esc(it.langue)} — préparation ${esc(it.certif.split(/[,(]/)[0].trim())}</h1>
        <div class="fiche-meta">
          <span class="fiche-meta-item"><strong>Positionnement</strong>${esc(it.tag)}</span>
        </div>
      </div>
    </section>
    <div class="container fiche-body">
      <div class="fiche-grid">
        <div class="fiche-main">
          ${blocs}
        </div>
        <aside class="fiche-side">
          <div class="fiche-card-cta">
            <h3>Envie d'apprendre cette langue ?</h3>
            <p>Faites votre pré-inscription. Notre équipe vous recontacte sous 48h.</p>
            <a href="/index.html?preinscription=1" class="btn btn-teal">Faire ma pré-inscription</a>
            <a href="${PAGE_NIVEAU.langues}" class="btn btn-ghost">← Toutes les langues</a>
          </div>
          <div class="fiche-facts">
            <div class="fact"><span class="fact-label">Niveau visé</span><span class="fact-val">${esc(it.niveau)}</span></div>
            <div class="fact"><span class="fact-label">Modalité</span><span class="fact-val">Présentiel — Campus de Lomé</span></div>
            <div class="fact"><span class="fact-label">Contact</span><span class="fact-val"><a href="mailto:formation@esig.tg">formation@esig.tg</a></span></div>
          </div>
        </aside>
      </div>
    </div>`;
}

/* ----- Génération ----- */
let total = 0;
const index = []; // pour formations/index.html et le sitemap

for (const niveauId of Object.keys(FD)) {
  const niveau = FD[niveauId];
  const dossier = path.join(SORTIE, niveauId);
  fs.mkdirSync(dossier, { recursive: true });
  for (const dom of (niveau.domaines || [])) {
    for (const spec of (dom.specialites || [])) {
      const url = urlFiche(niveauId, spec.slug);
      const page = gabarit({
        titre: spec.titre + ' (' + spec.niveau_label + ' — ' + spec.niveau_nom + ')',
        description: metaDescription(spec),
        url,
        corps: corpsFormation(spec, niveauId, url),
        ld: jsonLd(spec, url, niveauId)
      });
      fs.writeFileSync(path.join(RACINE, url.slice(1)), page);
      index.push({ niveauId, titre: spec.titre, url, domaine: dom.nom });
      total++;
    }
  }
}

if (LD && LD.items) {
  fs.mkdirSync(path.join(SORTIE, 'langues'), { recursive: true });
  for (const it of LD.items) {
    const url = urlFiche('langues', it.slug);
    const page = gabarit({
      titre: 'Cours de ' + it.langue + ' et certifications',
      description: 'Cours de ' + it.langue + ' à l\'ESIG Global Success (Lomé) — préparation aux certifications ' + it.certif + '. Niveau visé : ' + it.niveau + '.',
      url,
      corps: corpsLangue(it, url),
      ld: '<script type="application/ld+json">' + JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Course',
        'name': 'Cours de ' + it.langue, 'description': it.desc, 'url': SITE + url,
        'inLanguage': 'fr',
        'provider': { '@type': 'CollegeOrUniversity', 'name': 'ESIG Global Success', 'url': SITE }
      }, null, 2) + '<\/script>'
    });
    fs.writeFileSync(path.join(RACINE, url.slice(1)), page);
    index.push({ niveauId: 'langues', titre: 'Cours de ' + it.langue, url, domaine: 'Centre de langues' });
    total++;
  }
}

/* ----- Index du catalogue : formations/index.html ----- */
const groupes = {};
index.forEach(i => { (groupes[i.niveauId] = groupes[i.niveauId] || []).push(i); });
const sectionsIndex = Object.keys(groupes).map(niv => {
  const liens = groupes[niv].map(i => '<li><a href="' + i.url + '">' + esc(i.titre) + '</a></li>').join('\n          ');
  return `<section class="fiche-section" aria-labelledby="cat-${niv}">
        <h2 id="cat-${niv}">${esc(NOM_NIVEAU[niv])} (${groupes[niv].length})</h2>
        <ul class="catalogue-liste">
          ${liens}
        </ul>
      </section>`;
}).join('\n      ');

const pageIndex = gabarit({
  titre: 'Catalogue des formations — BTS, Licences, Masters, formation continue',
  description: 'Les ' + total + ' formations de l\'ESIG Global Success à Lomé : BTS, Licences, Masters/MBA, formation continue, formation modulaire et langues.',
  url: '/formations/',
  corps: `    <section class="page-hero">
      <div class="container">
        <div class="eyebrow">Catalogue complet</div>
        <h1>Toutes nos formations (${total})</h1>
        <p>BTS, Licences, Masters/MBA, formation continue, formation modulaire et centre de langues : explorez l'offre complète de l'ESIG Global Success.</p>
      </div>
    </section>
    <div class="container fiche-body">
      ${sectionsIndex}
    </div>`,
  ld: '<script type="application/ld+json">' + JSON.stringify({
    '@context': 'https://schema.org', '@type': 'ItemList',
    'name': 'Catalogue des formations ESIG Global Success',
    'numberOfItems': total,
    'itemListElement': index.map((i, n) => ({ '@type': 'ListItem', 'position': n + 1, 'name': i.titre, 'url': SITE + i.url }))
  }) + '<\/script>'
});
fs.writeFileSync(path.join(SORTIE, 'index.html'), pageIndex);

/* ----- Export JSON (base documentaire assistant IA + intégrations) ----- */
fs.mkdirSync(path.join(RACINE, 'assistant', 'base-documentaire'), { recursive: true });
fs.writeFileSync(
  path.join(RACINE, 'assistant', 'base-documentaire', 'formations.json'),
  JSON.stringify(index.map(i => ({ titre: i.titre, niveau: NOM_NIVEAU[i.niveauId], domaine: i.domaine, url: SITE + i.url })), null, 2)
);

console.log('✓ ' + total + ' fiches générées dans /formations/ (+ index du catalogue)');
console.log('✓ Export JSON pour l\'assistant : assistant/base-documentaire/formations.json');
