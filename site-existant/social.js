// =========================================================================
//  social.js — Affichage automatique des icônes sociales
//  (Ne pas modifier — vos liens se gèrent dans config-site.js)
// =========================================================================

// Icônes SVG officielles (tracés simplifiés, monochromes)
const SOCIAL_ICONS = {
  "Facebook": '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  "LinkedIn": '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  "Instagram": '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  "YouTube": '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none"/>',
  "TikTok": '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>'
};

function buildSocialLinks(extraClass){
  if (typeof RESEAUX_SOCIAUX === 'undefined') return '';
  var actifs = RESEAUX_SOCIAUX.filter(function(r){
    return r.url && r.url.indexOf('VOTRE-') === -1 && r.url.trim() !== '';
  });
  if (!actifs.length) return '';

  var links = actifs.map(function(r){
    var icon = SOCIAL_ICONS[r.reseau] || '';
    return '<a href="' + r.url + '" class="social-link" target="_blank" rel="noopener noreferrer" ' +
      'aria-label="' + r.reseau + '" title="' + r.reseau + '">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      icon + '</svg></a>';
  }).join('');

  return '<div class="social-links ' + (extraClass || '') + '">' + links + '</div>';
}

document.addEventListener('DOMContentLoaded', function(){
  // 1. Injection dans le pied de page (toutes les pages)
  var footerBottom = document.querySelector('.footer-bottom');
  if (footerBottom && !document.querySelector('.footer-social')){
    var socialHtml = buildSocialLinks('footer-social');
    if (socialHtml){
      footerBottom.insertAdjacentHTML('beforebegin', socialHtml);
    }
  }

  // 2. Injection dans l'emplacement dédié de la page Contact (si présent)
  var contactSlot = document.getElementById('contactSocial');
  if (contactSlot){
    contactSlot.innerHTML = buildSocialLinks('contact-social');
  }

  // 3. SEO : enrichit automatiquement le champ "sameAs" des données structurées
  //    avec les réseaux réellement configurés (bénéfice référencement).
  enrichSameAs();

  // 4. Affiche la version du site, en petit, dans le pied de page.
  afficherVersion();
});

function afficherVersion(){
  if (typeof VERSION_SITE === 'undefined') return;
  var footerBottom = document.querySelector('.footer-bottom');
  if (!footerBottom || document.querySelector('.site-version')) return;
  var v = document.createElement('div');
  v.className = 'site-version';
  v.textContent = 'Version ' + VERSION_SITE.numero + ' — ' + VERSION_SITE.date;
  footerBottom.appendChild(v);
}

function enrichSameAs(){
  if (typeof RESEAUX_SOCIAUX === 'undefined') return;
  var urls = RESEAUX_SOCIAUX
    .filter(function(r){ return r.url && r.url.indexOf('VOTRE-') === -1 && r.url.trim() !== ''; })
    .map(function(r){ return r.url; });
  if (!urls.length) return;

  // Cherche le bloc JSON-LD de l'établissement et y injecte les réseaux
  var scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(function(sc){
    try {
      var data = JSON.parse(sc.textContent);
      if (data && (data['@type'] === 'CollegeOrUniversity' || data['@type'] === 'EducationalOrganization')){
        data.sameAs = urls;
        sc.textContent = JSON.stringify(data, null, 2);
      }
    } catch(e){ /* bloc non-JSON : on ignore */ }
  });
}
