/* =========================================================================
   alumni-portraits.js — Rendu des portraits de diplômés (Alumni)
   Cible : <div data-portraits-liste data-source="/data/portraits-alumni.json">
   Aucune dépendance. N'affiche que les portraits présents dans le JSON.
   ========================================================================= */
(function () {
  'use strict';
  var conteneur = document.querySelector('[data-portraits-liste]');
  if (!conteneur) return;

  function ech(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var invitation =
    '<div class="carte" style="max-width:640px;margin-inline:auto"><div class="carte__corps texte-centre">' +
    '<h3 class="carte__titre" style="font-size:var(--fs-md)">Vous êtes diplômé de l\'ESIG ?</h3>' +
    '<p class="carte__texte">Proposez votre portrait et inspirez les nouvelles promotions.</p>' +
    '<p><a class="btn btn--accent" href="rejoindre.html">Proposer mon portrait</a></p>' +
    '</div></div>';

  var source = conteneur.getAttribute('data-source') || '/data/portraits-alumni.json';
  fetch(source)
    .then(function (r) { return r.json(); })
    .then(function (data) { rendre((data && data.portraits) || []); })
    .catch(function () { conteneur.innerHTML = invitation; });

  function carte(p) {
    var media = p.photo
      ? '<div class="carte__media ratio-4-3"><img src="' + ech(p.photo) + '" class="couvre" alt="' + ech(p.nom) + '" loading="lazy" width="640" height="480"></div>'
      : '';
    var sous = [p.poste, p.lieu].filter(Boolean).map(ech).join(' · ');
    return '<figure class="carte" style="margin:0">' + media + '<div class="carte__corps">' +
      (p.filiere ? '<p class="kicker">' + ech(p.filiere) + '</p>' : '') +
      '<blockquote style="margin:0"><p class="carte__texte">« ' + ech(p.citation || '') + ' »</p></blockquote>' +
      '<figcaption class="texte-doux" style="margin-top:var(--e-2)"><strong>' + ech(p.nom) + '</strong>' +
      (sous ? ' — ' + sous : '') + '</figcaption>' +
      '</div></figure>';
  }

  function rendre(portraits) {
    if (!portraits.length) { conteneur.innerHTML = invitation; return; }
    conteneur.innerHTML =
      '<div class="grille grille--3">' + portraits.map(carte).join('') + '</div>' +
      '<div style="margin-top:var(--e-6)">' + invitation + '</div>';
  }
})();
