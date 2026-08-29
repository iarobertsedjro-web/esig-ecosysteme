/* =========================================================================
   shared/js/recherche-formations.js — Moteur de recherche des formations
   -------------------------------------------------------------------------
   Charge data/formations.json (source unique) et affiche des cartes
   filtrables par mot-clé, pôle, niveau et domaine. 100% côté client,
   sans dépendance. Utilisé par les sites www, admission et executive.

   Mise en place dans une page :
     <div data-recherche-formations
          data-poles="academique,continue"   (optionnel : restreindre)
          data-source="/data/formations.json"></div>
   ========================================================================= */
(function () {
  'use strict';

  var LIBELLES_POLE = { academique: 'Parcours académique', continue: 'Formation continue & modulaire' };

  document.addEventListener('DOMContentLoaded', function () {
    var hote = document.querySelector('[data-recherche-formations]');
    if (!hote) return;

    var source = hote.getAttribute('data-source') || '/data/formations.json';
    var polesAutorises = (hote.getAttribute('data-poles') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    // Restriction thématique optionnelle : data-mots-cles="informatique,réseau,…"
    // (garde les formations dont domaine/intitulé/mention contient l'un des mots).
    var motsCles = (hote.getAttribute('data-mots-cles') || '').split(',').map(function (s) { return normaliser(s.trim()); }).filter(Boolean);

    // Structure de l'interface
    hote.innerHTML =
      '<form class="recherche" role="search" aria-label="Rechercher une formation">' +
        '<div class="recherche__grille">' +
          '<div class="champ" style="margin:0">' +
            '<label for="rf-q">Rechercher</label>' +
            '<input type="search" id="rf-q" placeholder="Mot-clé : comptabilité, réseaux, marketing…" autocomplete="off">' +
          '</div>' +
          '<div class="champ" style="margin:0">' +
            '<label for="rf-niveau">Niveau</label>' +
            '<select id="rf-niveau"><option value="">Tous les niveaux</option></select>' +
          '</div>' +
          '<div class="champ" style="margin:0">' +
            '<label for="rf-domaine">Domaine</label>' +
            '<select id="rf-domaine"><option value="">Tous les domaines</option></select>' +
          '</div>' +
        '</div>' +
      '</form>' +
      '<p class="recherche__resultats-info" role="status" aria-live="polite" id="rf-info">Chargement des formations…</p>' +
      '<div class="grille grille--auto" id="rf-resultats"></div>';

    var champQ = hote.querySelector('#rf-q');
    var selNiveau = hote.querySelector('#rf-niveau');
    var selDomaine = hote.querySelector('#rf-domaine');
    var info = hote.querySelector('#rf-info');
    var resultats = hote.querySelector('#rf-resultats');
    var toutes = [];

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        toutes = (data.formations || []).filter(function (f) {
          if (polesAutorises.length && polesAutorises.indexOf(f.pole) === -1) return false;
          if (motsCles.length) {
            var foin = normaliser([f.domaine, f.intitule, f.mention].join(' '));
            if (!motsCles.some(function (m) { return foin.indexOf(m) !== -1; })) return false;
          }
          return true;
        });
        remplirFiltres(toutes);
        appliquerParametresURL();
        afficher();
      })
      .catch(function () {
        info.textContent = 'Le catalogue est momentanément indisponible. Réessayez plus tard ou consultez la page Contact.';
      });

    function remplirFiltres(liste) {
      var niveaux = [], domaines = [];
      liste.forEach(function (f) {
        if (niveaux.indexOf(f.niveau) === -1) niveaux.push(f.niveau);
        if (f.domaine && domaines.indexOf(f.domaine) === -1) domaines.push(f.domaine);
      });
      niveaux.forEach(function (n) { selNiveau.appendChild(option(n, n)); });
      domaines.sort().forEach(function (d) { selDomaine.appendChild(option(d, d)); });
    }

    function option(valeur, texte) {
      var o = document.createElement('option'); o.value = valeur; o.textContent = texte; return o;
    }

    // Pré-filtrage via l'URL : ?niveau=bts|licence|master, ?domaine=…, ?q=…
    // (permet de lier vers le catalogue déjà filtré, ex. « Découvrir le BTS »).
    function appliquerParametresURL() {
      var p = new URLSearchParams(location.search);
      var q = p.get('q'); if (q) champQ.value = q;
      choisirOption(selNiveau, p.get('niveau'));
      choisirOption(selDomaine, p.get('domaine'));
    }
    function choisirOption(select, valeur) {
      if (!valeur) return;
      var cible = valeur.toLowerCase();
      var opt = [].slice.call(select.options).filter(function (o) { return o.value.toLowerCase() === cible; })[0];
      if (opt) select.value = opt.value;
    }

    function normaliser(s) {
      // Minuscules + suppression des accents (plage des diacritiques combinants U+0300–U+036F)
      return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    }

    function afficher() {
      var q = normaliser(champQ.value);
      var niveau = selNiveau.value;
      var domaine = selDomaine.value;

      var filtrees = toutes.filter(function (f) {
        if (niveau && f.niveau !== niveau) return false;
        if (domaine && f.domaine !== domaine) return false;
        if (q) {
          var foin = normaliser([f.intitule, f.domaine, f.mention, f.resume, (f.debouches || []).join(' ')].join(' '));
          if (foin.indexOf(q) === -1) return false;
        }
        return true;
      });

      resultats.innerHTML = '';
      _rot = {};                                   // rotation des vignettes réinitialisée à chaque rendu
      filtrees.forEach(function (f) { resultats.appendChild(carte(f)); });
      info.textContent = filtrees.length === 0
        ? 'Aucune formation ne correspond à votre recherche.'
        : filtrees.length + (filtrees.length > 1 ? ' formations trouvées' : ' formation trouvée');
    }

    function carte(f) {
      var art = document.createElement('article');
      art.className = 'carte carte-formation';
      var badgePole = f.pole === 'continue' ? 'badge--continue' : 'badge--academique';

      var debouches = (f.debouches || []).slice(0, 3).map(function (d) {
        var li = document.createElement('li'); li.textContent = d; return li;
      });

      // Vignette : photo représentative du domaine + badges superposés
      var media = document.createElement('div');
      media.className = 'carte__media ratio-16-9';
      var img = imagePourFormation(f);
      media.innerHTML =
        '<picture><source srcset="' + img + '.webp" type="image/webp">' +
        '<img class="couvre" src="' + img + '.jpg" alt="" loading="lazy" width="640" height="360"></picture>' +
        '<span class="carte-formation__tags">' +
          '<span class="badge ' + badgePole + '">' + echapper(f.niveau) + '</span>' +
          (f.duree ? '<span class="badge badge--media">' + echapper(f.duree) + '</span>' : '') +
        '</span>';

      var corps = document.createElement('div');
      corps.className = 'carte__corps';

      var meta = document.createElement('div');
      meta.className = 'carte__meta';
      if (f.domaine) {
        var dom = document.createElement('span');
        dom.className = 'badge badge--contour';
        dom.textContent = f.domaine;
        meta.appendChild(dom);
      }

      var titre = document.createElement('h3');
      titre.className = 'carte__titre';
      var lienTitre = document.createElement('a');
      lienTitre.href = f.url;
      lienTitre.textContent = f.intitule;
      titre.appendChild(lienTitre);

      corps.appendChild(meta);
      corps.appendChild(titre);

      if (f.resume) {
        var p = document.createElement('p');
        p.className = 'carte__texte';
        p.textContent = tronquer(f.resume, 120);
        corps.appendChild(p);
      }

      if (debouches.length) {
        var ul = document.createElement('ul');
        ul.className = 'debouches';
        ul.setAttribute('aria-label', 'Exemples de débouchés');
        debouches.forEach(function (li) { ul.appendChild(li); });
        corps.appendChild(ul);
      }

      var pied = document.createElement('div');
      pied.className = 'carte__pied';
      var lien = document.createElement('a');
      lien.href = f.url;
      lien.className = 'btn btn--secondaire';
      lien.innerHTML = 'Découvrir la formation';
      lien.setAttribute('aria-label', 'Découvrir la formation ' + f.intitule);
      pied.appendChild(lien);
      corps.appendChild(pied);

      art.appendChild(media);
      art.appendChild(corps);
      return art;
    }

    // Vignettes : plusieurs photos RÉELLES par famille de métiers, tirées EN
    // ROTATION pour que deux cartes voisines ne répètent pas la même image.
    // Aucune image générée par IA, aucun emoji.
    var POOLS = {
      industrie: ['/medias/innovation/atelier-mecanique', '/medias/innovation/robotique', '/medias/innovation/panneaux-solaires', '/medias/innovation/topographie', '/medias/innovation/drone-projet'],
      numerique: ['/medias/vie-etudiante/etudiants-laptop', '/medias/campus/campus-03', '/medias/campus/campus-05', '/medias/campus/infra-esig-01', '/medias/campus/infra-esig-02'],
      gestion:   ['/medias/actualites/conference-debat', '/medias/campus/campus-09', '/medias/campus/campus-08', '/medias/campus/campus-06', '/medias/campus/infra-esig-04'],
      general:   ['/medias/campus/campus-01', '/medias/campus/campus-02', '/medias/campus/campus-07', '/medias/campus/campus-10', '/medias/campus/infra-esig-03']
    };
    var _rot = {};
    function familleDe(f) {
      var d = normaliser([f.domaine, f.intitule, f.mention].join(' '));
      if (/mecan|fabrication|usinage|cnc|solidworks|robot|automat|mecatron|scada|iot|energi|electro|solaire|photovolt|civil|topograph|\bbim\b|batiment|autocad|geometre|maintenance industr|productique|\bgenie\b|revit/.test(d)) return 'industrie';
      if (/informati|logiciel|developp|\bdata\b|intelligence artificielle|\bia\b|numerique|reseau|cyber|telecom|\bweb\b|mobile|devops|machine learning|python|power bi|virtualis/.test(d)) return 'numerique';
      if (/gestion|finance|comptab|banque|assurance|management|marketing|commerce|logistique|transport|entrepreneur|ressources humaines|\brh\b|audit|juridique|droit|administration|communication|journal|media|presse|tourisme|hotel|langue|fiscal|vente|douan|achat/.test(d)) return 'gestion';
      return 'general';
    }
    function imagePourFormation(f) {
      var fam = familleDe(f);
      var pool = POOLS[fam] || POOLS.general;
      var n = (_rot[fam] = (_rot[fam] || 0) + 1);
      return pool[(n - 1) % pool.length];
    }

    function tronquer(s, n) { s = s || ''; return s.length > n ? s.slice(0, n).trim() + '…' : s; }
    function echapper(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

    // Réactions aux filtres (léger anti-rebond sur la saisie)
    var minuteur;
    champQ.addEventListener('input', function () { clearTimeout(minuteur); minuteur = setTimeout(afficher, 180); });
    selNiveau.addEventListener('change', afficher);
    selDomaine.addEventListener('change', afficher);
  });
})();
