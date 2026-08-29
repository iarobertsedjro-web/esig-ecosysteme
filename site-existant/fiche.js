function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('mobile-open');
}
function goToPreinscription(){
  window.location.href = 'index.html?preinscription=1';
}

const NIVEAU_LABELS = {
  bts: 'BTS', licence: 'Licence', master: 'Master / MBA',
  continue: 'Formation continue', modulaire: 'Formation modulaire'
};

function pageForNiveau(niveauId){
  if (niveauId === 'bts' || niveauId === 'licence' || niveauId === 'master') {
    return 'parcours-academique.html';
  }
  return 'formation-continue.html';
}

// Image de repli par grand domaine (photos de campus existantes).
const IMAGE_PAR_DOMAINE = [
  { motif: 'intelligence artificielle', img: 'images/campus/campus-01.jpg' },
  { motif: 'data',                       img: 'images/campus/campus-01.jpg' },
  { motif: 'cybersécurité',              img: 'images/campus/campus-02.jpg' },
  { motif: 'sécurité',                   img: 'images/campus/campus-02.jpg' },
  { motif: 'développement logiciel',     img: 'images/campus/campus-03.jpg' },
  { motif: 'marketing',                  img: 'images/campus/campus-04.jpg' },
  { motif: 'communication',              img: 'images/campus/campus-04.jpg' },
  { motif: 'supply chain',               img: 'images/campus/campus-05.jpg' },
  { motif: 'logistique',                 img: 'images/campus/campus-05.jpg' },
  { motif: 'management',                 img: 'images/campus/campus-06.jpg' },
  { motif: 'finance',                    img: 'images/campus/campus-06.jpg' },
  { motif: 'gestion',                    img: 'images/campus/campus-06.jpg' },
  { motif: 'économiques',                img: 'images/campus/campus-06.jpg' },
  { motif: 'réseaux',                    img: 'images/campus/campus-07.jpg' },
  { motif: 'télécommunications',         img: 'images/campus/campus-07.jpg' },
  { motif: 'entrepreneuriat',            img: 'images/campus/campus-08.jpg' },
  { motif: 'innovation',                 img: 'images/campus/campus-08.jpg' },
  { motif: 'génie civil',                img: 'images/campus/campus-09.jpg' },
  { motif: 'infrastructures',            img: 'images/campus/campus-09.jpg' },
  { motif: 'mécanique',                  img: 'images/campus/campus-10.jpg' },
  { motif: 'électrique',                 img: 'images/campus/campus-10.jpg' },
  { motif: 'énergies',                   img: 'images/campus/campus-10.jpg' },
  { motif: 'industrial',                 img: 'images/campus/campus-10.jpg' },
  { motif: 'techniques',                 img: 'images/campus/campus-10.jpg' },
  { motif: 'hôtellerie',                 img: 'images/campus/campus-05.jpg' },
  { motif: 'tourisme',                   img: 'images/campus/campus-05.jpg' },
  { motif: 'juridiques',                 img: 'images/campus/campus-03.jpg' },
  { motif: 'administration',             img: 'images/campus/campus-03.jpg' },
  { motif: 'homme',                      img: 'images/campus/campus-08.jpg' },
  { motif: 'société',                    img: 'images/campus/campus-08.jpg' }
];

function imageForSpec(spec){
  if (spec.image) return spec.image;
  const dom = (spec.domaine || '').toLowerCase();
  for (var i = 0; i < IMAGE_PAR_DOMAINE.length; i++){
    if (dom.indexOf(IMAGE_PAR_DOMAINE[i].motif) !== -1) return IMAGE_PAR_DOMAINE[i].img;
  }
  return 'images/campus/campus-01.jpg';
}

function listeToUl(val, cls){
  var arr = Array.isArray(val) ? val : String(val).split(/[,;]/);
  var items = arr.map(function(x){ return String(x).trim(); }).filter(Boolean);
  return '<ul class="' + cls + '">' + items.map(function(x){
    return '<li>' + esc(x) + '</li>';
  }).join('') + '</ul>';
}

function blocPresentation(spec){
  if (spec.presentation){
    return spec.presentation.split(/\n\s*\n/).map(function(p){
      return '<p>' + esc(p.trim()) + '</p>';
    }).join('');
  }
  return '<p>Cette formation prépare au métier visé en développant les compétences suivantes : ' +
    esc(spec.competences) + '.</p>' +
    '<div class="fiche-soon"><span class="soon-tag">Bientôt enrichi</span>' +
    '<p>La présentation détaillée de cette formation sera prochainement complétée.</p></div>';
}

function blocCompetences(spec){
  if (Array.isArray(spec.competences_detail) && spec.competences_detail.length){
    return listeToUl(spec.competences_detail, 'fiche-check-list');
  }
  return '<p class="fiche-comp">' + esc(spec.competences) + '</p>';
}

function blocProgramme(spec){
  if (Array.isArray(spec.programme) && spec.programme.length){
    if (typeof spec.programme[0] === 'object'){
      return spec.programme.map(function(bloc){
        return '<div class="prog-bloc">' +
          '<h3>' + esc(bloc.titre) + '</h3>' +
          listeToUl(bloc.modules, 'fiche-module-list') +
        '</div>';
      }).join('');
    }
    return listeToUl(spec.programme, 'fiche-module-list');
  }
  return '<div class="fiche-soon"><span class="soon-tag">Bientôt disponible</span>' +
    '<p>Le programme détaillé (matières, volumes horaires, projets) sera prochainement publié.</p></div>';
}

function blocDebouches(spec){
  var jobs = (spec.debouches || []).map(function(j){
    return '<li>' + esc(j) + '</li>';
  }).join('');
  var html = '<ul class="fiche-jobs">' + jobs + '</ul>';
  if (spec.poursuite){
    html += '<div class="fiche-poursuite"><h3>Poursuite d\'études</h3><p>' + esc(spec.poursuite) + '</p></div>';
  }
  return html;
}

function blocAdmission(spec){
  // Profil d'entrée (séries de bac requises) affiché en tête si disponible
  var profilBlock = spec.profil
    ? '<div class="fiche-profil"><h3>Profil d\'entrée</h3><p>' + esc(spec.profil) + '</p></div>'
    : '';
  if (spec.admission){
    return profilBlock + spec.admission.split(/\n\s*\n/).map(function(p){
      return '<p>' + esc(p.trim()) + '</p>';
    }).join('');
  }
  if (spec.profil){
    // Profil connu mais pas de texte d'admission détaillé : profil + repli générique
    return profilBlock +
      '<p>L\'admission s\'effectue sur dossier et entretien d\'orientation. La procédure complète (pièces du dossier, étapes) est détaillée sur la page <a href="admission.html">Admission</a>.</p>';
  }
  var niveauAcces = spec.niveau_id === 'master' ? 'une Licence (Bac+3) ou diplôme équivalent'
    : spec.niveau_id === 'licence' ? 'le Baccalauréat (pour la 1re année) ou un Bac+2 (admission parallèle)'
    : 'le Baccalauréat ou un diplôme équivalent';
  return '<p>L\'admission s\'effectue sur dossier et entretien d\'orientation. Cette formation est accessible aux candidats titulaires de ' + niveauAcces + '.</p>' +
    '<p>La procédure complète (pièces du dossier, étapes) est détaillée sur la page <a href="admission.html">Admission</a>.</p>';
}

function renderFormation(spec){
  var niveauLabel = NIVEAU_LABELS[spec.niveau_id] || spec.niveau_label;
  var img = imageForSpec(spec);

  var tabs = [
    { id: 'presentation', label: 'Présentation', html: blocPresentation(spec) },
    { id: 'competences',  label: 'Compétences',  html: blocCompetences(spec) },
    { id: 'programme',    label: 'Programme',    html: blocProgramme(spec) },
    { id: 'debouches',    label: 'Débouchés',    html: blocDebouches(spec) },
    { id: 'admission',    label: 'Admission',    html: blocAdmission(spec) }
  ];

  var tabButtons = tabs.map(function(t, i){
    return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' +
      esc(t.label) + '</button>';
  }).join('');

  var tabPanels = tabs.map(function(t, i){
    return '<div class="tab-panel' + (i === 0 ? ' active' : '') + '" id="panel-' + t.id + '">' +
      t.html + '</div>';
  }).join('');

  return '<section class="fiche-hero fiche-hero-img" style="background-image:linear-gradient(160deg,rgba(31,56,100,.62) 0%,rgba(22,40,74,.55) 100%),url(\'' + img + '\')">' +
      '<div class="container">' +
        '<nav class="breadcrumb">' +
          '<a href="index.html">Accueil</a> <span>›</span> ' +
          '<a href="' + pageForNiveau(spec.niveau_id) + '?tab=' + spec.niveau_id + '">' + esc(niveauLabel) + '</a> <span>›</span> ' +
          '<span class="current">' + esc(spec.titre) + '</span>' +
        '</nav>' +
        '<div class="fiche-level-badge">' + esc(spec.niveau_nom) + ' · ' + esc(spec.duree) + '</div>' +
        '<h1>' + esc(spec.titre) + '</h1>' +
        '<div class="fiche-meta">' +
          '<span class="fiche-meta-item"><strong>Domaine</strong>' + esc(spec.domaine) + '</span>' +
          '<span class="fiche-meta-item"><strong>Mention</strong>' + esc(spec.mention) + '</span>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div class="container fiche-body">' +
      '<div class="fiche-grid">' +
        '<div class="fiche-main">' +
          '<div class="fiche-tabs">' +
            '<div class="tab-bar">' + tabButtons + '</div>' +
            '<div class="tab-panels">' + tabPanels + '</div>' +
          '</div>' +
        '</div>' +
        '<aside class="fiche-side">' +
          '<div class="fiche-card-cta">' +
            '<h3>Intéressé par cette formation ?</h3>' +
            '<p>Faites votre pré-inscription. Notre équipe vous recontacte sous 48h.</p>' +
            '<a href="index.html?preinscription=1" class="btn btn-teal">Faire ma pré-inscription</a>' +
            '<a href="' + pageForNiveau(spec.niveau_id) + '?tab=' + spec.niveau_id + '" class="btn btn-ghost">← Toutes les formations</a>' +
          '</div>' +
          '<div class="fiche-facts">' +
            '<div class="fact"><span class="fact-label">Niveau</span><span class="fact-val">' + esc(spec.niveau_nom) + '</span></div>' +
            '<div class="fact"><span class="fact-label">Durée</span><span class="fact-val">' + esc(spec.duree) + '</span></div>' +
            '<div class="fact"><span class="fact-label">Domaine</span><span class="fact-val">' + esc(spec.domaine) + '</span></div>' +
            '<div class="fact"><span class="fact-label">Mention</span><span class="fact-val">' + esc(spec.mention) + '</span></div>' +
          '</div>' +
        '</aside>' +
      '</div>' +
    '</div>';
}

function renderLangue(it){
  var img = 'images/campus/campus-04.jpg';
  var tabs = [
    { id: 'objectifs', label: 'Objectifs', html: '<p class="fiche-comp">' + esc(it.desc) + '</p>' },
    { id: 'certif',    label: 'Certifications', html: '<p class="fiche-comp">' + esc(it.certif) + '</p>' },
    { id: 'admission', label: 'Inscription', html: '<p>L\'inscription est ouverte tout au long de l\'année. Le calendrier des sessions et les tarifs sont précisés lors de la pré-inscription. Voir aussi la page <a href="admission.html">Admission</a>.</p>' }
  ];
  var tabButtons = tabs.map(function(t, i){
    return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + t.id + '">' + esc(t.label) + '</button>';
  }).join('');
  var tabPanels = tabs.map(function(t, i){
    return '<div class="tab-panel' + (i === 0 ? ' active' : '') + '" id="panel-' + t.id + '">' + t.html + '</div>';
  }).join('');

  return '<section class="fiche-hero fiche-hero-img" style="background-image:linear-gradient(160deg,rgba(31,56,100,.62) 0%,rgba(22,40,74,.55) 100%),url(\'' + img + '\')">' +
      '<div class="container">' +
        '<nav class="breadcrumb">' +
          '<a href="index.html">Accueil</a> <span>›</span> ' +
          '<a href="formation-continue.html?tab=langues">Langues</a> <span>›</span> ' +
          '<span class="current">' + esc(it.langue) + '</span>' +
        '</nav>' +
        '<div class="fiche-level-badge">Certification ' + esc(it.niveau) + '</div>' +
        '<h1>' + esc(it.langue) + '</h1>' +
        '<div class="fiche-meta">' +
          '<span class="fiche-meta-item"><strong>Positionnement</strong>' + esc(it.tag) + '</span>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div class="container fiche-body">' +
      '<div class="fiche-grid">' +
        '<div class="fiche-main">' +
          '<div class="fiche-tabs">' +
            '<div class="tab-bar">' + tabButtons + '</div>' +
            '<div class="tab-panels">' + tabPanels + '</div>' +
          '</div>' +
        '</div>' +
        '<aside class="fiche-side">' +
          '<div class="fiche-card-cta">' +
            '<h3>Envie d\'apprendre cette langue ?</h3>' +
            '<p>Faites votre pré-inscription. Notre équipe vous recontacte sous 48h.</p>' +
            '<a href="index.html?preinscription=1" class="btn btn-teal">Faire ma pré-inscription</a>' +
            '<a href="formation-continue.html?tab=langues" class="btn btn-ghost">← Toutes les langues</a>' +
          '</div>' +
          '<div class="fiche-facts">' +
            '<div class="fact"><span class="fact-label">Niveau visé</span><span class="fact-val">' + esc(it.niveau) + '</span></div>' +
          '</div>' +
        '</aside>' +
      '</div>' +
    '</div>';
}

function renderNotFound(){
  return '<div class="container fiche-notfound">' +
    '<h1>Formation introuvable</h1>' +
    '<p>La formation que vous recherchez n\'existe pas ou a été déplacée.</p>' +
    '<a href="parcours-academique.html" class="btn btn-teal">Voir toutes nos formations</a>' +
    '</div>';
}

function switchTab(id){
  var btns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  btns.forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === id); });
  panels.forEach(function(p){ p.classList.toggle('active', p.id === 'panel-' + id); });
}

var SITE_BASE = (typeof SITE_URL !== 'undefined') ? SITE_URL : 'https://esig.tg';

// URL de la version statique (canonique) d'une fiche
function urlFicheStatique(niveauId, slug){
  var prefixe = (niveauId === 'langues' ? 'langue' : niveauId) + '-';
  var court = slug.indexOf(prefixe) === 0 ? slug.slice(prefixe.length) : slug;
  return '/formations/' + niveauId + '/' + court + '.html';
}

// Injecte un bloc JSON-LD dans le <head>
function injectJsonLd(obj){
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(obj, null, 2);
  document.head.appendChild(s);
}

// Données structurées Course + fil d'Ariane pour une formation
function jsonLdFormation(spec){
  var url = SITE_BASE + '/fiche.html?f=' + spec.slug;
  var descr = spec.presentation
    ? spec.presentation.split(/\n\s*\n/)[0]
    : ('Formation ' + spec.titre + ' (' + spec.niveau_nom + ') à l\'ESIG Global Success. Compétences : ' + spec.competences + '.');

  var course = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": spec.titre,
    "description": descr,
    "url": url,
    "inLanguage": "fr",
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": "ESIG Global Success",
      "url": SITE_BASE,
      "sameAs": SITE_BASE
    },
    "educationalCredentialAwarded": spec.niveau_label + ' (' + spec.niveau_nom + ')',
    "about": spec.domaine,
    "teaches": String(spec.competences).split(/[,;]/).map(function(x){ return x.trim(); }).filter(Boolean),
    "occupationalCategory": (spec.debouches || []),
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "onsite",
      "location": {
        "@type": "Place",
        "name": "ESIG Global Success — Lomé",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lomé",
          "addressCountry": "TG"
        }
      }
    }
  };

  var breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE_BASE + '/' },
      { "@type": "ListItem", "position": 2, "name": (NIVEAU_LABELS[spec.niveau_id] || spec.niveau_label), "item": SITE_BASE + '/' + pageForNiveau(spec.niveau_id) },
      { "@type": "ListItem", "position": 3, "name": spec.titre, "item": url }
    ]
  };

  return [course, breadcrumb];
}

// Données structurées pour une langue
function jsonLdLangue(it){
  return [{
    "@context": "https://schema.org",
    "@type": "Course",
    "name": it.langue + ' — Certification ' + it.niveau,
    "description": it.desc,
    "url": SITE_BASE + '/fiche.html?f=' + it.slug,
    "inLanguage": "fr",
    "provider": {
      "@type": "CollegeOrUniversity",
      "name": "ESIG Global Success",
      "url": SITE_BASE
    },
    "educationalCredentialAwarded": it.certif,
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "onsite",
      "location": { "@type": "Place", "name": "ESIG Global Success — Lomé", "address": { "@type": "PostalAddress", "addressLocality": "Lomé", "addressCountry": "TG" } }
    }
  }];
}

document.addEventListener('DOMContentLoaded', function(){
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('f');
  const container = document.getElementById('ficheContent');
  const item = slug ? FORMATIONS_INDEX[slug] : null;

  if (!item) {
    container.innerHTML = renderNotFound();
    return;
  }

  if (item.langue) {
    container.innerHTML = renderLangue(item);
    document.getElementById('pageTitle').textContent = item.langue + ' — ESIG Global Success';
    document.getElementById('pageDesc').setAttribute('content', 'Formation en ' + item.langue + ' à l\'ESIG Global Success, Lomé. ' + it_desc(item));
    jsonLdLangue(item).forEach(injectJsonLd);
  } else {
    container.innerHTML = renderFormation(item);
    document.getElementById('pageTitle').textContent = item.titre + ' — ESIG Global Success';
    document.getElementById('pageDesc').setAttribute('content', item.titre + ' (' + item.niveau_nom + ') à l\'ESIG Global Success, Lomé. ' + item.competences);
    jsonLdFormation(item).forEach(injectJsonLd);
  }
  // Lien canonique dynamique
  var canon = document.createElement('link');
  canon.rel = 'canonical';
  var prefixeSlug = slug.split('-')[0];
  var niveauCanon = prefixeSlug === 'langue' ? 'langues' : prefixeSlug;
  canon.href = SITE_BASE + urlFicheStatique(niveauCanon, slug);
  document.head.appendChild(canon);

  window.scrollTo(0, 0);
});

function it_desc(item){ return item.desc || ''; }


// Délégation d'événements pour les onglets de la fiche (compatibles CSP)
document.addEventListener('click', function(e){
  var b = e.target.closest('.tab-btn[data-tab]');
  if (b && typeof switchTab === 'function') switchTab(b.getAttribute('data-tab'));
});
