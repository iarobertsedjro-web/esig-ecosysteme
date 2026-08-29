/* =========================================================================
   carrieres-offres.js — Rendu des offres de stages & d'emploi (Carrières)
   Cible : <div data-offres-liste data-source="/data/offres-carrieres.json">
   Aucune dépendance. Filtre par type (Stage / Emploi / Alternance).
   ========================================================================= */
(function () {
  'use strict';
  var conteneur = document.querySelector('[data-offres-liste]');
  if (!conteneur) return;

  function ech(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var source = conteneur.getAttribute('data-source') || '/data/offres-carrieres.json';
  fetch(source)
    .then(function (r) { return r.json(); })
    .then(function (data) { rendre(data); })
    .catch(function () {
      conteneur.innerHTML = '<p class="texte-doux">Les offres seront publiées ici prochainement. ' +
        'Entreprises : <a href="recruteurs.html">déposez une offre</a>.</p>';
    });

  function carte(o) {
    var badges = '<span class="badge badge--or">' + ech(o.type) + '</span>' +
      (o.exemple ? ' <span class="badge">Exemple</span>' : '');
    var meta = [o.entreprise, o.lieu, o.duree].filter(Boolean).map(ech).join(' · ');
    return '<article class="carte" data-type="' + ech(o.type) + '"><div class="carte__corps">' +
      '<p>' + badges + '</p>' +
      '<h3 class="carte__titre" style="font-size:var(--fs-md)">' + ech(o.titre) + '</h3>' +
      (o.domaine ? '<p class="texte-doux">' + ech(o.domaine) + '</p>' : '') +
      '<p class="carte__texte">' + ech(o.resume || '') + '</p>' +
      (meta ? '<p class="texte-doux" style="font-size:var(--fs-xs)">' + meta + '</p>' : '') +
      '</div></article>';
  }

  function rendre(data) {
    var offres = (data && data.offres) || [];
    var meta = (data && data.meta) || {};
    var cats = meta.categories || [];
    var html = '';

    if (meta.note) {
      html += '<div class="alerte"><div class="alerte__contenu"><p><strong>Exemples de format.</strong> ' +
        ech(meta.note) + '</p></div></div>';
    }

    html += '<div class="flex flex--enroule" role="group" aria-label="Filtrer par type" ' +
      'data-offres-filtres style="gap:var(--e-2);margin:var(--e-4) 0">';
    html += '<button type="button" class="btn btn--secondaire" data-filtre="" aria-pressed="true">Toutes</button>';
    cats.forEach(function (c) {
      html += '<button type="button" class="btn btn--secondaire" data-filtre="' + ech(c) + '" aria-pressed="false">' + ech(c) + '</button>';
    });
    html += '</div>';

    html += '<div class="grille grille--3" data-offres-grille>' + offres.map(carte).join('') + '</div>';
    conteneur.innerHTML = html;

    var grille = conteneur.querySelector('[data-offres-grille]');
    var boutons = conteneur.querySelectorAll('[data-filtre]');
    conteneur.querySelector('[data-offres-filtres]').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-filtre]');
      if (!b) return;
      var f = b.getAttribute('data-filtre');
      boutons.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      grille.querySelectorAll('[data-type]').forEach(function (el) {
        el.hidden = !(f === '' || el.getAttribute('data-type') === f);
      });
    });
  }
})();
