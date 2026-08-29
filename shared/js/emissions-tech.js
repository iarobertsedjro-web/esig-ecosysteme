/* =========================================================================
   shared/js/emissions-tech.js — Émissions / replays tech (ESIG TECH)
   -------------------------------------------------------------------------
   Piloté par data/emissions-tech.json :
     <div data-emissions-liste data-source="/data/emissions-tech.json"></div>
   Chaque émission = une vignette (poster) + bouton lecture ; le clic ouvre la
   vidéo sur YouTube dans un nouvel onglet. AUCUNE iframe, aucun script externe
   n'est chargé (respect « pas de CDN critique » et RGPD).
   ========================================================================= */
(function () {
  'use strict';

  var ICONE_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function webp(jpg) { return (jpg || '').replace(/\.jpe?g$/i, '.webp'); }
  function lienSur(u) { return u && /^https?:/.test(u); }

  document.addEventListener('DOMContentLoaded', function () {
    var hote = document.querySelector('[data-emissions-liste]');
    if (!hote) return;
    var source = hote.getAttribute('data-source') || '/data/emissions-tech.json';
    var limite = parseInt(hote.getAttribute('data-limite') || '0', 10);

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { var e = data.emissions || []; rendre(hote, limite > 0 ? e.slice(0, limite) : e); })
      .catch(function () { hote.innerHTML = '<p class="texte-doux">Les émissions sont momentanément indisponibles.</p>'; });
  });

  function rendre(hote, emissions) {
    var grille = document.createElement('div');
    grille.className = 'grille grille--3';
    emissions.forEach(function (e) {
      var carte = lienSur(e.lien) ? document.createElement('a') : document.createElement('article');
      carte.className = 'carte carte-emission';
      if (lienSur(e.lien)) {
        carte.href = e.lien; carte.target = '_blank'; carte.rel = 'noopener';
        carte.setAttribute('aria-label', 'Voir « ' + (e.titre || '') + ' » sur YouTube (nouvel onglet)');
      }
      var poster = e.poster
        ? '<picture><source srcset="' + ech(webp(e.poster)) + '" type="image/webp">' +
          '<img class="couvre" src="' + ech(e.poster) + '" alt="" loading="lazy" width="640" height="360"></picture>'
        : '';
      carte.innerHTML =
        '<div class="carte__media">' + poster +
          '<span class="carte-emission__play"><span>' + ICONE_PLAY + '</span></span>' +
          (e.duree ? '<span class="carte-emission__duree">' + ech(e.duree) + '</span>' : '') +
        '</div>' +
        '<div class="carte__corps">' +
          '<div class="carte__meta">' +
            (e.categorie ? '<span class="badge badge--continue">' + ech(e.categorie) + '</span>' : '') +
            (e.date_texte ? '<time class="texte-doux" style="font-size:var(--fs-xs)">' + ech(e.date_texte) + '</time>' : '') +
          '</div>' +
          '<h3 class="carte__titre">' + ech(e.titre) + '</h3>' +
          (e.resume ? '<p class="carte__texte">' + ech(e.resume) + '</p>' : '') +
        '</div>';
      grille.appendChild(carte);
    });
    hote.innerHTML = '';
    hote.appendChild(grille);
  }
})();
