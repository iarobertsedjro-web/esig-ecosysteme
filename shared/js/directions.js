/* =========================================================================
   shared/js/directions.js — Directions & services (Gouvernance)
   -------------------------------------------------------------------------
   Piloté par data/directions.json. Deux usages :
     · Liste (page Gouvernance) : <div data-directions-liste data-source="/data/directions.json"></div>
     · Fiche (direction.html)   : <div data-direction-fiche data-source="/data/directions.json"></div>
                                  (la direction affichée dépend de ?slug=… dans l'URL)
   Chaque carte de la liste renvoie vers direction.html?slug=… ; on peut enrichir
   chaque fiche en éditant SEULEMENT directions.json (description, missions, image…).
   ========================================================================= */
(function () {
  'use strict';

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function badgeClasse(cat) { return /m[ée]tier/i.test(cat || '') ? 'badge--academique' : ''; }

  document.addEventListener('DOMContentLoaded', function () {
    var liste = document.querySelector('[data-directions-liste]');
    var fiche = document.querySelector('[data-direction-fiche]');
    if (!liste && !fiche) return;
    var source = (liste || fiche).getAttribute('data-source') || '/data/directions.json';

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var dirs = data.directions || [];
        if (liste) rendreListe(liste, dirs);
        if (fiche) rendreFiche(fiche, dirs);
      })
      .catch(function () {
        var h = liste || fiche;
        h.innerHTML = '<p class="texte-doux">Les directions sont momentanément indisponibles.</p>';
      });
  });

  /* ----- Liste : grille de cartes cliquables ----- */
  function rendreListe(hote, dirs) {
    var grille = document.createElement('div');
    grille.className = 'grille grille--3';
    dirs.forEach(function (d) {
      var a = document.createElement('a');
      a.className = 'carte carte-lien';
      a.href = 'direction.html?slug=' + encodeURIComponent(d.slug);
      a.innerHTML =
        '<div class="carte__corps">' +
          '<span class="badge ' + badgeClasse(d.categorie) + '">' + ech(d.categorie) + '</span>' +
          '<h3 class="carte__titre">' + ech(d.nom) + '</h3>' +
          '<p class="carte__texte">' + ech(d.resume) + '</p>' +
        '</div>';
      grille.appendChild(a);
    });
    hote.innerHTML = '';
    hote.appendChild(grille);
  }

  /* ----- Fiche : détail d'une direction (?slug=) ----- */
  function rendreFiche(hote, dirs) {
    var slug = new URLSearchParams(location.search).get('slug');
    var d = dirs.filter(function (x) { return x.slug === slug; })[0];
    if (!d) {
      hote.innerHTML = '<div class="section-entete"><h1>Direction introuvable</h1><hr class="filet-or">' +
        '<p>Cette direction n\'existe pas ou a été retirée. <a href="gouvernance.html">Retour à la gouvernance</a>.</p></div>';
      return;
    }

    document.title = d.nom + ' — ESIG Global Success';

    var image = d.image
      ? '<figure class="ratio-16-9" style="margin:var(--e-5) 0"><img class="couvre" src="' + ech(d.image) + '" alt="' + ech(d.nom) + '" width="1200" height="675"></figure>'
      : '';

    var paragraphes = (d.description && d.description.length)
      ? d.description.map(function (p) { return '<p>' + ech(p) + '</p>'; }).join('')
      : '<p class="texte-doux">Présentation détaillée de cette direction à venir.</p>';

    var missions = (d.missions && d.missions.length)
      ? '<h2>Missions principales</h2><ul class="pile-s">' + d.missions.map(function (m) { return '<li>' + ech(m) + '</li>'; }).join('') + '</ul>'
      : '';

    var responsable = d.responsable
      ? '<p class="texte-doux" style="margin-top:var(--e-5)">Responsable : <strong>' + ech(d.responsable) + '</strong></p>'
      : '';

    hote.innerHTML =
      '<nav class="fil-ariane" aria-label="Fil d\'Ariane"><ol>' +
        '<li><a href="index.html">Accueil</a></li>' +
        '<li><a href="gouvernance.html">Gouvernance</a></li>' +
        '<li><span aria-current="page">' + ech(d.nom) + '</span></li>' +
      '</ol></nav>' +
      '<div class="section-entete"><p class="kicker">' + ech(d.categorie) + '</p>' +
        '<h1>' + ech(d.nom) + '</h1><hr class="filet-or">' +
        '<p class="chapo">' + ech(d.resume) + '</p></div>' +
      image +
      '<div class="mesure">' + paragraphes + '</div>' +
      missions +
      responsable +
      '<p style="margin-top:var(--e-6)"><a class="btn btn--secondaire" href="gouvernance.html">← Toutes les directions</a></p>';
  }
})();
