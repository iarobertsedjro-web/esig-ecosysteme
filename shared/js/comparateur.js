/* =========================================================================
   shared/js/comparateur.js — Comparateur de formations (2 à 3 côte à côte)
   -------------------------------------------------------------------------
   Alimenté par data/formations.json. 100 % côté client, sans dépendance.
     <div data-comparateur data-poles="academique" data-source="/data/formations.json"></div>
   ========================================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var hote = document.querySelector('[data-comparateur]');
    if (!hote) return;
    var source = hote.getAttribute('data-source') || '/data/formations.json';
    var poles = (hote.getAttribute('data-poles') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    hote.innerHTML =
      '<div class="recherche"><div class="grille grille--3" id="cmp-selecteurs"></div></div>' +
      '<div class="tableau-conteneur" id="cmp-sortie" style="margin-top:var(--e-5)"></div>';

    var zoneSel = hote.querySelector('#cmp-selecteurs');
    var sortie = hote.querySelector('#cmp-sortie');
    var toutes = [], choix = [null, null, null];

    fetch(source).then(function (r) { return r.json(); }).then(function (data) {
      toutes = (data.formations || []).filter(function (f) { return !poles.length || poles.indexOf(f.pole) !== -1; });
      for (var i = 0; i < 3; i++) zoneSel.appendChild(selecteur(i));
      rendre();
    }).catch(function () { sortie.innerHTML = '<p class="texte-doux">Catalogue indisponible pour le moment.</p>'; });

    function selecteur(i) {
      var ch = document.createElement('div'); ch.className = 'champ'; ch.style.margin = '0';
      var id = 'cmp-sel-' + i;
      var lab = document.createElement('label'); lab.setAttribute('for', id); lab.textContent = 'Formation ' + (i + 1);
      var sel = document.createElement('select'); sel.id = id;
      sel.appendChild(opt('', i < 2 ? 'Choisir…' : 'Choisir… (facultatif)'));
      // Groupé par niveau
      var niveaux = {};
      toutes.forEach(function (f) { (niveaux[f.niveau] = niveaux[f.niveau] || []).push(f); });
      Object.keys(niveaux).forEach(function (n) {
        var og = document.createElement('optgroup'); og.label = n;
        niveaux[n].forEach(function (f) { og.appendChild(opt(f.id, f.intitule)); });
        sel.appendChild(og);
      });
      sel.addEventListener('change', function () {
        choix[i] = toutes.filter(function (f) { return f.id === sel.value; })[0] || null;
        rendre();
      });
      ch.appendChild(lab); ch.appendChild(sel); return ch;
    }
    function opt(v, t) { var o = document.createElement('option'); o.value = v; o.textContent = t; return o; }

    function rendre() {
      var sel = choix.filter(Boolean);
      if (sel.length < 2) { sortie.innerHTML = '<p class="texte-doux">Choisissez au moins deux formations à comparer.</p>'; return; }

      var lignes = [
        ['Niveau', function (f) { return f.niveau; }],
        ['Domaine', function (f) { return f.domaine || '—'; }],
        ['Mention', function (f) { return f.mention || '—'; }],
        ['Durée', function (f) { return f.duree || '—'; }],
        ['Compétences visées', function (f) { return f.resume || '—'; }],
        ['Débouchés', function (f) { return (f.debouches || []).slice(0, 4).join(', ') || '—'; }]
      ];

      var t = document.createElement('table'); t.className = 'tableau';
      var thead = '<thead><tr><th scope="col">Critère</th>' +
        sel.map(function (f) { return '<th scope="col">' + ech(f.intitule) + '</th>'; }).join('') + '</tr></thead>';
      var tbody = '<tbody>' + lignes.map(function (lg) {
        return '<tr><th scope="row">' + lg[0] + '</th>' +
          sel.map(function (f) { return '<td>' + ech(lg[1](f)) + '</td>'; }).join('') + '</tr>';
      }).join('') +
      '<tr><th scope="row">Fiche</th>' + sel.map(function (f) {
        return '<td><a class="btn btn--secondaire" href="' + ech(f.url) + '">Voir la fiche</a></td>';
      }).join('') + '</tr></tbody>';
      t.innerHTML = thead + tbody;
      sortie.innerHTML = ''; sortie.appendChild(t);
    }

    function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  });
})();
