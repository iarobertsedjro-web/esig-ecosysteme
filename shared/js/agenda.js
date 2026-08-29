/* =========================================================================
   shared/js/agenda.js — Agenda / Planning « ESIG News »
   -------------------------------------------------------------------------
   Piloté par data/agenda.json (aucune base de données). Usage :
     <div data-agenda-liste data-source="/data/agenda.json"></div>

   Affiche les événements À VENIR (du plus proche au plus lointain), avec
   filtre par catégorie ; les événements PASSÉS sont regroupés dans une
   section « archives » repliable. Le même fichier alimente le CMS plus tard
   (voir docs/CMS-MODELE-CONTENU.md) : la structure des champs est identique.
   ========================================================================= */
(function () {
  'use strict';

  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function parDateAsc(a, b) { return (a.date || '').localeCompare(b.date || ''); }
  function parDateDesc(a, b) { return (b.date || '').localeCompare(a.date || ''); }

  /* Date du jour au format AAAA-MM-JJ (comparaison lexicographique sûre) */
  function aujourdhui() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var j = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + j;
  }

  /* Pastille de date : jour + mois abrégé + année, sans dépendre du fuseau */
  function pastille(dateISO) {
    var p = (dateISO || '').split('-');
    if (p.length < 3) return '<div class="evenement__date"><span class="evenement__jour">·</span></div>';
    var jour = parseInt(p[2], 10);
    var moisIdx = parseInt(p[1], 10) - 1;
    var mois = (moisIdx >= 0 && moisIdx < 12) ? MOIS[moisIdx] : '';
    return '<div class="evenement__date">' +
      '<span class="evenement__jour">' + (isNaN(jour) ? '·' : jour) + '</span>' +
      '<span class="evenement__mois">' + mois + '</span>' +
      '<span class="evenement__annee">' + ech(p[0]) + '</span>' +
    '</div>';
  }

  var ICONE_LIEU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>';

  /* ----- Un événement (élément de liste) ----- */
  function evenement(e, passe) {
    var li = document.createElement('li');
    li.className = 'carte evenement' + (passe ? ' evenement--passe' : '');

    var quand = e.date_texte || e.date || '';
    if (e.date_fin && e.date_fin !== e.date) quand += ' → ' + (e.date_fin_texte || e.date_fin);
    if (e.heure) quand += ' · ' + e.heure;

    var lien = (e.lien && /^(https?:|\/|mailto:|tel:)/.test(e.lien))
      ? '<div class="carte__pied"><a class="btn btn--secondaire" href="' + ech(e.lien) + '">' + ech(e.lien_libelle || 'En savoir plus') + '</a></div>'
      : '';

    li.innerHTML = pastille(e.date) +
      '<div class="evenement__corps">' +
        '<div class="evenement__meta">' +
          (e.categorie ? '<span class="badge badge--continue">' + ech(e.categorie) + '</span>' : '') +
          '<time datetime="' + ech(e.date) + '" class="texte-doux" style="font-size:var(--fs-xs)">' + ech(quand) + '</time>' +
        '</div>' +
        '<h3 class="evenement__titre">' + ech(e.titre) + '</h3>' +
        (e.lieu ? '<p class="evenement__lieu">' + ICONE_LIEU + ech(e.lieu) + '</p>' : '') +
        (e.resume ? '<p class="evenement__texte">' + ech(e.resume) + '</p>' : '') +
        lien +
      '</div>';
    return li;
  }

  /* ----- Rendu principal ----- */
  document.addEventListener('DOMContentLoaded', function () {
    var hote = document.querySelector('[data-agenda-liste]');
    if (!hote) return;
    var source = hote.getAttribute('data-source') || '/data/agenda.json';

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { rendre(hote, data.evenements || []); })
      .catch(function () {
        hote.innerHTML = '<p class="texte-doux">L\'agenda est momentanément indisponible.</p>';
      });
  });

  function rendre(hote, evts) {
    var jour = aujourdhui();
    // Un événement est « à venir » tant que sa date de fin (ou de début) n'est pas dépassée.
    var aVenir = evts.filter(function (e) { return (e.date_fin || e.date || '') >= jour; }).sort(parDateAsc);
    var passes = evts.filter(function (e) { return (e.date_fin || e.date || '') < jour; }).sort(parDateDesc);

    hote.innerHTML = '';

    /* Filtre par catégorie (sur les événements à venir) */
    var categories = [];
    aVenir.forEach(function (e) { if (e.categorie && categories.indexOf(e.categorie) === -1) categories.push(e.categorie); });

    var barre = document.createElement('div');
    barre.className = 'flex flex--enroule flex--centre';
    barre.setAttribute('role', 'group');
    barre.setAttribute('aria-label', 'Filtrer par catégorie');
    barre.style.marginBottom = 'var(--e-6)';
    barre.innerHTML = '<button type="button" class="btn btn--secondaire" data-cat="">Tout</button>' +
      categories.map(function (c) { return '<button type="button" class="btn btn--secondaire" data-cat="' + ech(c) + '">' + ech(c) + '</button>'; }).join('');

    var liste = document.createElement('ul');
    liste.className = 'liste-evenements';

    function afficher(cat) {
      liste.innerHTML = '';
      var filtres = cat ? aVenir.filter(function (e) { return e.categorie === cat; }) : aVenir;
      if (!filtres.length) {
        liste.innerHTML = '<li class="carte" style="padding:var(--e-5)"><p class="texte-doux" style="margin:0">Aucun événement à venir dans cette catégorie pour le moment. Revenez bientôt.</p></li>';
      } else {
        filtres.forEach(function (e) { liste.appendChild(evenement(e, false)); });
      }
      barre.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-cat') === (cat || '') ? 'true' : 'false');
      });
    }
    barre.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-cat]'); if (b) afficher(b.getAttribute('data-cat'));
    });

    if (categories.length > 1) hote.appendChild(barre);
    hote.appendChild(liste);
    afficher('');

    /* Section archives (événements passés), repliée par défaut */
    if (passes.length) {
      var details = document.createElement('details');
      details.className = 'section';
      details.style.marginTop = 'var(--e-8)';
      var listePasses = document.createElement('ul');
      listePasses.className = 'liste-evenements';
      passes.forEach(function (e) { listePasses.appendChild(evenement(e, true)); });
      var sommaire = document.createElement('summary');
      sommaire.style.cursor = 'pointer';
      sommaire.style.fontWeight = 'var(--poids-gras)';
      sommaire.style.marginBottom = 'var(--e-4)';
      sommaire.textContent = 'Événements passés (' + passes.length + ')';
      details.appendChild(sommaire);
      details.appendChild(listePasses);
      hote.appendChild(details);
    }
  }
})();
