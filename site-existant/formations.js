// Données des mentions (chapeaux) — extraites du PDF officiel ESIG 2026-2027
// Rattachées par nom de domaine pour affichage en tête de section Licence
const MENTIONS_INFO = {
  "Sciences Économiques et de Gestion": {
    titre: "Sciences de Gestion",
    intro: "Vous souhaitez acquérir de solides connaissances dans les différents domaines liés à la gestion d'entreprise ? L'ESIG Global Success propose plusieurs Licences Professionnelles (bac+3 en 3 ans) alliant technique et pratique : comptabilité, finance, commercial, juridique, ressources humaines ou logistique. À partir de la 2ᵉ année, vous vous spécialisez sur l'un des parcours proposés.",
    debouches: "Gestionnaire back office, conseiller en gestion, gestionnaire de stock, assistant de direction, financier, conseiller bancaire, gestionnaire d'assurance, analyste risques, chargé de portefeuille, chargé d'études marketing, responsable commercial, acheteur international, responsable logistique, chargé de développement RH. Poursuites d'études possibles en Master (Marketing, Commerce International, Management, Finance)."
  },
  "Sciences et Technologies": {
    titre: "Sciences de l'Ingénieur & Sciences Informatiques",
    intro: "Vous souhaitez devenir technicien supérieur, futur ingénieur ou professionnel du numérique ? L'ESIG Global Success propose plusieurs Licences Professionnelles (bac+3 en 3 ans) alliant mathématiques appliquées, sciences physiques, technologie, développement logiciel, réseaux et pratique en atelier/laboratoire. Dès la 2ᵉ année, vous vous spécialisez sur l'un des parcours proposés.",
    debouches: "Technicien de bureau d'études, technicien de maintenance industrielle, automaticien, technicien de production, dessinateur/projeteur, conducteur de travaux, technicien topographe, développeur d'applications, administrateur systèmes et réseaux, technicien en cybersécurité, analyste SOC, administrateur data center, chef de projet informatique."
  },
  "Sciences de l'Homme et de la Société": {
    titre: "Information et Communication",
    intro: "Vous souhaitez maîtriser les techniques de communication, de journalisme et du numérique ? L'ESIG Global Success propose plusieurs Licences Professionnelles (bac+3 en 3 ans) combinant théories de l'information, pratique éditoriale, communication d'entreprise, marketing digital, PAO et audiovisuel. Dès la 2ᵉ année, vous vous spécialisez sur un des parcours proposés.",
    debouches: "Chargé(e) de communication interne/externe, responsable marketing et communication, chargé(e) de communication événementielle, conseiller en communication, média-planneur, manager de marque, chargé(e) des relations publiques et presse, journaliste presse écrite, journaliste radio-télé, reporter, monteur, chargé de production, community manager."
  },
  "Sciences Juridiques et de l'Administration": {
    titre: "Sciences de l'Administration & Sciences Juridiques",
    intro: "Vous souhaitez accompagner les dirigeants d'organisations ou vous orienter vers les métiers des carrières judiciaires ? L'ESIG Global Success propose des Licences Professionnelles (bac+3 en 3 ans) mêlant bureautique, communication professionnelle, gestion, théorie générale du droit, droit des affaires, procédures judiciaires et méthodologie professionnelle.",
    debouches: "Assistant(e) administratif(ve), assistant(e) de direction, secrétaire de direction, gestionnaire administratif, greffier, huissier de justice, clerc de notaire, agent de la magistrature, juriste d'entreprise, assistant juridique, gestionnaire de contentieux, collaborateur en études notariales et d'huissier."
  }
};
// ===== Icônes SVG par type de domaine =====
const ICONS = {
  money: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  tech: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  comm: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  tourism: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  admin: '<path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4"/>',
  security: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'
};
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
const JOBS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9M14 17H5M17 3l4 4-4 4M7 21l-4-4 4-4"/></svg>';
const FLAGS = {'Français':'\u{1F1EB}\u{1F1F7}','Anglais':'\u{1F1EC}\u{1F1E7}','Chinois (mandarin)':'\u{1F1E8}\u{1F1F3}','Espagnol':'\u{1F1EA}\u{1F1F8}','Allemand':'\u{1F1E9}\u{1F1EA}'};

function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// URL de la page statique d'une formation (générée par tools/generer-fiches.js)
function urlFicheStatique(niveauId, slug){
  var prefixe = (niveauId === 'langues' ? 'langue' : niveauId) + '-';
  var court = slug.indexOf(prefixe) === 0 ? slug.slice(prefixe.length) : slug;
  return 'formations/' + niveauId + '/' + court + '.html';
}

// Évite la redondance entre durée et niveau, et allège l'affichage
function durLabel(spec){
  const d = spec.duree, n = spec.niveau_nom;
  // Pour les formations à "modules courts", le niveau (académie/pôle) suffit
  if (d === 'Modules courts') return n;
  if (!d || d === n || n.indexOf(d) !== -1 || d.indexOf(n) !== -1) return n;
  return d + ' · ' + n;
}

function renderCard(spec){
  const jobs = spec.debouches.map(j => '<span class="job-tag">' + esc(j) + '</span>').join('');
  return '<a class="fcard" href="' + urlFicheStatique(spec.niveau_id, spec.slug) + '">' +
    '<div class="fcard-mention">' + esc(spec.mention) + '</div>' +
    '<h4>' + esc(spec.titre) + '</h4>' +
    '<div class="fcard-section"><div class="fcard-label">' + CHECK_SVG + 'Compétences clés</div>' +
    '<div class="fcard-text">' + esc(spec.competences) + '</div></div>' +
    '<div class="fcard-section"><div class="fcard-label">' + JOBS_SVG + 'Débouchés</div>' +
    '<div class="fcard-jobs">' + jobs + '</div></div>' +
    '<div class="fcard-foot"><span class="fcard-dur">' + esc(durLabel(spec)) + '</span>' +
    '<span class="fcard-cta">Voir la fiche →</span></div></a>';
}

function renderMentionChapeau(dom){
  // Affiche le chapeau de mention (intro + débouchés) issu du PDF, si disponible pour ce domaine
  const info = (typeof MENTIONS_INFO !== 'undefined') ? MENTIONS_INFO[dom.nom] : null;
  if (!info) return '';
  return '<div class="mention-chapeau">' +
    '<div class="mention-intro">' + esc(info.intro) + '</div>' +
    '<div class="mention-debouches">' +
      '<span class="mention-deb-label">Débouchés &amp; poursuites d\'études</span>' +
      '<p>' + esc(info.debouches) + '</p>' +
    '</div>' +
  '</div>';
}

function renderDomain(dom, withMention){
  const icon = ICONS[dom.icon] || ICONS.admin;
  const n = dom.specialites.length;
  const label = n + ' spécialité' + (n > 1 ? 's' : '');
  const note = dom.note ? '<p class="domain-note">' + esc(dom.note) + '</p>' : '';
  const chapeau = withMention ? renderMentionChapeau(dom) : '';
  const cards = dom.specialites.map(renderCard).join('');
  return '<div class="domain"><div class="domain-head">' +
    '<span class="domain-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + icon + '</svg></span>' +
    '<h3>' + esc(dom.nom) + '</h3><span class="dcount">' + label + '</span></div>' +
    chapeau + note + '<div class="formations">' + cards + '</div></div>';
}

function renderPanel(niveauId, data){
  const total = data.domaines.reduce((s,d) => s + d.specialites.length, 0);
  const withMention = (niveauId === 'licence'); // chapeaux de mention (PDF) sur la Licence
  const domains = data.domaines.map(function(d){ return renderDomain(d, withMention); }).join('');
  return '<div class="container"><div class="level-intro">' +
    '<span class="badge">' + esc(data.niveau.toUpperCase()) + ' · ' + esc(data.duree.toUpperCase()) + '</span>' +
    '<h2>' + esc(data.titre) + '</h2><p>' + esc(data.intro) + '</p>' +
    '<div class="level-stat">' + total + ' spécialités réparties en ' + data.domaines.length + ' domaines</div>' +
    '</div>' + domains + '</div>';
}

function renderLanguesPanel(data){
  const items = data.items.map(function(it){
    const flag = FLAGS[it.langue] || '\u{1F310}';
    return '<a class="lang-card" href="' + urlFicheStatique('langues', it.slug) + '">' +
      '<div class="lang-head"><span class="lang-flag">' + flag + '</span>' +
      '<div><h4>' + esc(it.langue) + '</h4><span class="lang-tag">' + esc(it.tag) + '</span></div>' +
      '<span class="lang-level">' + esc(it.niveau) + '</span></div>' +
      '<p class="lang-desc">' + esc(it.desc) + '</p>' +
      '<div class="lang-certif"><span class="lang-certif-label">Certifications</span> ' + esc(it.certif) + '</div></a>';
  }).join('');
  return '<div class="container"><div class="level-intro">' +
    '<span class="badge">' + esc(data.niveau.toUpperCase()) + '</span>' +
    '<h2>' + esc(data.titre) + '</h2><p>' + esc(data.intro) + '</p></div>' +
    '<div class="langs-grid">' + items + '</div></div>';
}

function buildPanels(){
  const order = ['bts','licence','master','continue','modulaire'];
  order.forEach(function(id){
    const panel = document.getElementById(id);
    if (panel && FORMATIONS_DATA[id]) {
      panel.innerHTML = renderPanel(id, FORMATIONS_DATA[id]);
    }
  });
  const langPanel = document.getElementById('langues');
  if (langPanel) langPanel.innerHTML = renderLanguesPanel(LANGUES_DATA);
}
function showTab(id, btn){
  document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  const tabsTop = document.querySelector('.tabs-wrap').offsetTop;
  window.scrollTo({ top: tabsTop - 68, behavior: 'smooth' });
}

function toggleMenu(){
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

function goToPreinscription(){
  window.location.href = 'index.html?preinscription=1';
}

document.addEventListener('DOMContentLoaded', function(){
  buildPanels();
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  if (tab && document.getElementById(tab)) {
    document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
    document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
    document.getElementById(tab).classList.add('active');
    const btn = document.querySelector('.tab[data-tab="' + tab + '"]');
    if (btn) btn.classList.add('active');
  }

  // Sur cette page, les grandes cartes activent l'onglet directement (sans recharger)
  document.querySelectorAll('.pcard').forEach(function(card){
    card.addEventListener('click', function(e){
      const href = card.getAttribute('href') || '';
      const m = href.match(/tab=(\w+)/);
      if (m && document.getElementById(m[1])) {
        e.preventDefault();
        const targetBtn = document.querySelector('.tab[data-tab="' + m[1] + '"]');
        if (targetBtn) showTab(m[1], targetBtn);
      }
    });
  });
});
