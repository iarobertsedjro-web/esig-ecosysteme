/* =========================================================================
   shared/js/actualites.js — Média « ESIG News »
   -------------------------------------------------------------------------
   Piloté par data/actualites.json (aucune base de données). Deux usages :
     · Page magazine :  <div data-actualites-liste data-source="/data/actualites.json"></div>
     · Page article  :  <div data-actualite-article data-source="/data/actualites.json"></div>
                        (l'article affiché dépend du paramètre ?slug=… de l'URL)
   ========================================================================= */
(function () {
  'use strict';

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function parDate(a, b) { return (b.date || '').localeCompare(a.date || ''); }

  document.addEventListener('DOMContentLoaded', function () {
    var liste = document.querySelector('[data-actualites-liste]');
    var article = document.querySelector('[data-actualite-article]');
    if (!liste && !article) return;
    var source = (liste || article).getAttribute('data-source') || '/data/actualites.json';

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var actus = (data.actualites || []).slice().sort(parDate);
        if (liste) rendreMagazine(liste, actus);
        if (article) rendreArticle(article, actus);
      })
      .catch(function () {
        var h = liste || article;
        h.innerHTML = '<p class="texte-doux">Les actualités sont momentanément indisponibles.</p>';
      });
  });

  /* ----- Carte d'actualité ----- */
  function carte(a, aLaUne) {
    var art = document.createElement('article');
    art.className = 'carte carte-actualite';
    var media = a.image
      ? '<a class="carte__media ratio-16-9" href="article.html?slug=' + encodeURIComponent(a.slug) + '">' +
          '<img class="couvre" src="' + ech(a.image) + '" alt="' + ech(a.titre) + '" loading="lazy" width="640" height="360"></a>'
      : '';
    art.innerHTML = media +
      '<div class="carte__corps">' +
        '<div class="carte__meta"><span class="badge badge--continue">' + ech(a.categorie) + '</span>' +
        '<time datetime="' + ech(a.date) + '">' + ech(a.date_texte || a.date) + '</time></div>' +
        '<h3 class="carte__titre' + (aLaUne ? '' : '') + '"><a href="article.html?slug=' + encodeURIComponent(a.slug) + '">' + ech(a.titre) + '</a></h3>' +
        '<p class="carte__texte">' + ech(a.resume) + '</p>' +
        '<div class="carte__pied"><a class="btn btn--secondaire" href="article.html?slug=' + encodeURIComponent(a.slug) + '">Lire l\'article</a></div>' +
      '</div>';
    return art;
  }

  /* ----- Page magazine : filtre par catégorie + grille ----- */
  function rendreMagazine(hote, actus) {
    var categories = [];
    actus.forEach(function (a) { if (a.categorie && categories.indexOf(a.categorie) === -1) categories.push(a.categorie); });

    var barre = document.createElement('div');
    barre.className = 'flex flex--enroule flex--centre';
    barre.setAttribute('role', 'group');
    barre.setAttribute('aria-label', 'Filtrer par catégorie');
    barre.style.marginBottom = 'var(--e-6)';
    barre.innerHTML = '<button type="button" class="btn btn--secondaire" data-cat="">Toutes</button>' +
      categories.map(function (c) { return '<button type="button" class="btn btn--secondaire" data-cat="' + ech(c) + '">' + ech(c) + '</button>'; }).join('');

    var grille = document.createElement('div');
    grille.className = 'grille grille--auto';

    function afficher(cat) {
      grille.innerHTML = '';
      var filtres = cat ? actus.filter(function (a) { return a.categorie === cat; }) : actus;
      if (!filtres.length) { grille.innerHTML = '<p class="texte-doux">Aucune actualité dans cette catégorie.</p>'; return; }
      filtres.forEach(function (a, i) { grille.appendChild(carte(a, i === 0)); });
      barre.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === (cat || '') ? 'true' : 'false'); });
    }
    barre.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]'); if (b) afficher(b.getAttribute('data-cat'));
    });

    hote.appendChild(barre);
    hote.appendChild(grille);
    var catInit = new URLSearchParams(location.search).get('cat') || '';
    if (catInit && categories.indexOf(catInit) === -1) catInit = '';
    afficher(catInit);
  }

  /* ----- Page article : rendu + Schema.org NewsArticle ----- */
  function rendreArticle(hote, actus) {
    var slug = new URLSearchParams(location.search).get('slug');
    var a = actus.filter(function (x) { return x.slug === slug; })[0];
    if (!a) {
      hote.innerHTML = '<div class="section-entete"><h1>Article introuvable</h1><hr class="filet-or">' +
        '<p>Cette actualité n\'existe pas ou a été retirée. <a href="index.html">Retour aux actualités</a>.</p></div>';
      return;
    }

    document.title = a.titre + ' — ESIG News';
    var contenu = (a.contenu && a.contenu.length ? a.contenu : [a.resume])
      .map(function (p) { return '<p>' + ech(p) + '</p>'; }).join('');
    var media = a.image ? '<figure class="ratio-16-9" style="margin:var(--e-5) 0"><img class="couvre" src="' + ech(a.image) + '" alt="' + ech(a.titre) + '" width="1200" height="675"></figure>' : '';

    hote.innerHTML =
      '<nav class="fil-ariane" aria-label="Fil d\'Ariane"><ol><li><a href="index.html">ESIG News</a></li>' +
        '<li><span aria-current="page">' + ech(a.titre) + '</span></li></ol></nav>' +
      '<div class="carte__meta" style="margin-bottom:var(--e-2)"><span class="badge badge--continue">' + ech(a.categorie) + '</span>' +
        '<time datetime="' + ech(a.date) + '">' + ech(a.date_texte || a.date) + '</time>' +
        (a.lieu ? '<span class="texte-doux">· ' + ech(a.lieu) + '</span>' : '') + '</div>' +
      '<h1>' + ech(a.titre) + '</h1><hr class="filet-or">' +
      media +
      '<div class="mesure">' + contenu + '</div>' +
      '<p style="margin-top:var(--e-6)"><a class="btn btn--secondaire" href="index.html">← Toutes les actualités</a></p>';

    // Données structurées NewsArticle (SEO)
    var schema = {
      '@context': 'https://schema.org', '@type': 'NewsArticle',
      headline: a.titre,
      datePublished: a.date,
      articleBody: (a.contenu && a.contenu.length ? a.contenu.join('\n\n') : a.resume),
      publisher: { '@type': 'Organization', name: 'ESIG Global Success', logo: { '@type': 'ImageObject', url: 'https://esig.tg/shared/img/logo/logo-esig.png' } }
    };
    if (a.image) schema.image = 'https://news.esig.tg' + a.image;
    var s = document.createElement('script'); s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema); document.head.appendChild(s);
  }
})();
