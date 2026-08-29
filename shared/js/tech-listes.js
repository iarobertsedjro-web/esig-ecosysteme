/* =========================================================================
   shared/js/tech-listes.js — Laboratoires & Partenaires (ESIG TECH)
   -------------------------------------------------------------------------
   Deux listes pilotées par données, sur des pages distinctes :
     · <div data-labos-liste data-source="/data/laboratoires-tech.json"></div>
     · <div data-partenaires-liste data-source="/data/partenaires-tech.json"></div>
   ========================================================================= */
(function () {
  'use strict';

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function webp(jpg) { return (jpg || '').replace(/\.jpe?g$/i, '.webp'); }

  document.addEventListener('DOMContentLoaded', function () {
    charger('[data-labos-liste]', 'laboratoires', rendreLabos);
    charger('[data-partenaires-liste]', 'partenaires', rendrePartenaires);
  });

  function charger(sel, cle, rendu) {
    var hote = document.querySelector(sel);
    if (!hote) return;
    var source = hote.getAttribute('data-source');
    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { rendu(hote, data[cle] || []); })
      .catch(function () { hote.innerHTML = '<p class="texte-doux">Contenu momentanément indisponible.</p>'; });
  }

  function rendreLabos(hote, labos) {
    var g = document.createElement('div');
    g.className = 'grille grille--3';
    labos.forEach(function (l) {
      var media = l.image
        ? '<div class="carte__media ratio-16-9"><picture><source srcset="' + ech(webp(l.image)) + '" type="image/webp">' +
          '<img class="couvre" src="' + ech(l.image) + '" alt="' + ech(l.nom) + '" loading="lazy" width="640" height="360"></picture></div>'
        : '';
      var tags = (l.equipements && l.equipements.length)
        ? '<ul class="tech-tags" style="margin-top:var(--e-2)">' + l.equipements.map(function (e) { return '<li>' + ech(e) + '</li>'; }).join('') + '</ul>'
        : '';
      var f = document.createElement('figure');
      f.className = 'carte'; f.style.margin = '0';
      f.innerHTML = media + '<div class="carte__corps"><h3 class="carte__titre" style="font-size:var(--fs-md)">' + ech(l.nom) + '</h3>' +
        (l.resume ? '<p class="carte__texte">' + ech(l.resume) + '</p>' : '') + tags + '</div>';
      g.appendChild(f);
    });
    hote.innerHTML = ''; hote.appendChild(g);
  }

  function rendrePartenaires(hote, parts) {
    var g = document.createElement('div');
    g.className = 'grille grille--3';
    parts.forEach(function (p) {
      var logo = p.logo
        ? '<div class="carte__media ratio-16-9" style="background:var(--blanc)"><img class="couvre" src="' + ech(p.logo) + '" alt="' + ech(p.nom) + '" loading="lazy" style="object-fit:contain;padding:var(--e-4)" width="480" height="270"></div>'
        : '';
      var el, attrs = '';
      if (p.lien && /^https?:/.test(p.lien)) { el = 'a'; attrs = ' href="' + ech(p.lien) + '" target="_blank" rel="noopener"'; }
      else { el = 'article'; }
      var carte = document.createElement(el);
      carte.className = 'carte' + (el === 'a' ? ' carte-lien' : '');
      if (attrs) { carte.setAttribute('href', p.lien); carte.target = '_blank'; carte.rel = 'noopener'; }
      carte.innerHTML = logo + '<div class="carte__corps">' +
        (p.type ? '<span class="badge badge--contour">' + ech(p.type) + '</span>' : '') +
        '<h3 class="carte__titre" style="font-size:var(--fs-md)">' + ech(p.nom) + '</h3>' +
        (p.resume ? '<p class="carte__texte">' + ech(p.resume) + '</p>' : '') + '</div>';
      g.appendChild(carte);
    });
    hote.innerHTML = ''; hote.appendChild(g);
  }
})();
