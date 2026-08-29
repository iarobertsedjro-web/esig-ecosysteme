// Configuration des cartes de parcours, organisées en 2 PÔLES
// Couleurs : déclinaison harmonieuse de l'identité ESIG (navy → teal → gold)

// PÔLE 1 — Parcours académique (diplômant)
const POLE_ACADEMIQUE = [
  {
    id: 'bts',
    eyebrow: 'Brevet de Technicien Supérieur',
    titre: 'BTS',
    duree: 'Bac+2 · 2 ans',
    desc: 'Première immersion dans le monde professionnel. Formation pratique et concrète pour acquérir les fondamentaux techniques et opérationnels.',
    points: ['16 spécialités disponibles', '80% de pratique professionnelle', 'Insertion ou poursuite en Licence'],
    grad: ['#1F3864', '#2E5090'],
    icon: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>'
  },
  {
    id: 'licence',
    eyebrow: 'Licence Professionnelle & Fondamentale',
    titre: 'Licence',
    duree: 'Bac+3 · 3 ans',
    desc: 'Approfondissement des compétences et spécialisation. Formation académique rigoureuse, adossée au programme BUT français.',
    points: ['25 spécialités (LP & LF)', 'Partenariat Sorbonne Paris Nord', 'Projets et stages professionnels'],
    grad: ['#0E6B7C', '#13899E'],
    icon: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
  },
  {
    id: 'master',
    eyebrow: 'Master Professionnel',
    titre: 'Master / MBA',
    duree: 'Bac+5 · 2 ans',
    desc: 'Haut niveau d\'expertise pour les profils confirmés. Formation de pointe avec accréditations et partenariats internationaux.',
    points: ['34 spécialités d\'expertise', 'Double diplomation possible', 'Réseau d\'alumni et de partenaires'],
    grad: ['#13363F', '#1F5563'],
    icon: '<path d="M12 15c2.5 0 4.5-2 4.5-4.5S14.5 6 12 6s-4.5 2-4.5 4.5S9.5 15 12 15z"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/>'
  }
];

// PÔLE 2 — Formation Continue & Modulaire
const POLE_CONTINUE = [
  {
    id: 'continue',
    eyebrow: 'Formation Continue & Certifiante',
    titre: 'Formation continue',
    duree: '13 académies certifiantes',
    desc: 'Montez en compétences sur les métiers d\'avenir. Académies professionnelles et certifiantes pour les actifs et les profils en reconversion.',
    points: ['13 académies professionnelles', '59 modules certifiants', 'Format court et flexible'],
    grad: ['#9A6A0E', '#BC8418'],
    icon: '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3"/>'
  },
  {
    id: 'modulaire',
    eyebrow: 'Centre de Formation Modulaire',
    titre: 'Formation modulaire',
    duree: 'Pôles métiers',
    desc: 'Acquérez un métier rapidement. Quatre pôles de compétences adossés aux gisements d\'emploi du Togo, du port de Lomé à l\'industrie.',
    points: ['4 pôles métiers ciblés', '15 parcours professionnalisants', 'Ancrés sur l\'emploi local'],
    grad: ['#1F3864', '#0E7C7B'],
    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
  },
  {
    id: 'langues',
    eyebrow: 'Centre de Langues & Certifications',
    titre: 'Langues',
    duree: 'Certifications CECRL',
    desc: 'Ouvrez-vous à l\'international. Cinq langues adossées à leur certification de référence, pour l\'employabilité et la mobilité académique.',
    points: ['5 langues (FR, EN, ZH, ES, DE)', 'Certifications officielles (DELF, TOEFL, HSK)', 'Niveaux alignés sur le CECRL'],
    grad: ['#5A2D82', '#7B3FA0'],
    icon: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20z"/>'
  }
];

// Quelle page cible pour chaque pôle
const PAGE_ACADEMIQUE = 'parcours-academique.html';
const PAGE_CONTINUE = 'formation-continue.html';

// --- Comptage automatique des spécialités depuis le catalogue réel ---
// Évite les chiffres figés : le nombre affiché suit toujours les données.
function compterSpecialites(niveauId){
  if (typeof FORMATIONS_DATA === 'undefined') return null;
  var niv = FORMATIONS_DATA[niveauId];
  if (!niv || !niv.domaines) return null;
  return niv.domaines.reduce(function(total, dom){
    return total + (dom.specialites ? dom.specialites.length : 0);
  }, 0);
}

// Remplace le nombre en tête d'un libellé par le compte réel.
// Ex. "34 spécialités d'expertise" -> "25 spécialités d'expertise"
function actualiserCompte(libelle, niveauId){
  var n = compterSpecialites(niveauId);
  if (n === null || !n) return libelle;          // données absentes : on garde le libellé d'origine
  return libelle.replace(/^\d+/, String(n));
}

function renderOneCard(c, targetPage){
  var points = c.points.map(function(p, i){
    // Le 1er point porte le nombre de spécialités : on le recalcule si possible
    if (i === 0 && c.id && /^\d+\s+spécialit/.test(p)) {
      p = actualiserCompte(p, c.id);
    }
    return '<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' + p + '</li>';
  }).join('');
  return '<a class="pcard" href="' + targetPage + '?tab=' + c.id + '" style="--g1:' + c.grad[0] + ';--g2:' + c.grad[1] + '">' +
    '<div class="pcard-top">' +
      '<span class="pcard-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + c.icon + '</svg></span>' +
      '<div class="pcard-eyebrow">' + c.eyebrow + '</div>' +
      '<h3>' + c.titre + '</h3>' +
      '<span class="pcard-duree"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>' + c.duree + '</span>' +
    '</div>' +
    '<div class="pcard-body">' +
      '<p class="pcard-desc">' + c.desc + '</p>' +
      '<ul class="pcard-points">' + points + '</ul>' +
      '<span class="pcard-btn">Découvrir <span class="arr">→</span></span>' +
    '</div>' +
  '</a>';
}

function renderPole(cards, targetPage){
  return cards.map(function(c){ return renderOneCard(c, targetPage); }).join('');
}

// Injecte les 2 pôles dans un conteneur (page d'accueil)
function injectTwoPoles(academiqueId, continueId){
  var a = document.getElementById(academiqueId);
  if (a) a.innerHTML = renderPole(POLE_ACADEMIQUE, PAGE_ACADEMIQUE);
  var c = document.getElementById(continueId);
  if (c) c.innerHTML = renderPole(POLE_CONTINUE, PAGE_CONTINUE);
}

// Injecte les cartes d'un seul pôle (pages de pôle). Les cartes activent l'onglet sur place.
function injectPoleCards(containerId, poleName){
  var el = document.getElementById(containerId);
  if (!el) return;
  var cards = (poleName === 'academique') ? POLE_ACADEMIQUE : POLE_CONTINUE;
  var targetPage = (poleName === 'academique') ? PAGE_ACADEMIQUE : PAGE_CONTINUE;
  el.innerHTML = renderPole(cards, targetPage);
}
