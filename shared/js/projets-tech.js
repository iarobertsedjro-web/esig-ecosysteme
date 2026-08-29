/* =========================================================================
   shared/js/projets-tech.js — Innovations & projets (ESIG TECH)
   -------------------------------------------------------------------------
   Piloté par data/projets-tech.json. Trois usages :
     · Galerie filtrable : <div data-projets-liste data-source="…"></div>
     · Aperçu (accueil)  : <div data-projets-liste data-limite="3" data-source="…"></div>
     · Fiche riche       : <div data-projet-fiche data-source="…"></div>  (?slug=…)
   ========================================================================= */
(function () {
  'use strict';

  function ech(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function webp(jpg) { return (jpg || '').replace(/\.jpe?g$/i, '.webp'); }
  function norm(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function statutBadge(s) { if (/en cours/i.test(s || '')) return 'badge--or'; if (/venir/i.test(s || '')) return 'badge--contour'; return 'badge--academique'; }

  document.addEventListener('DOMContentLoaded', function () {
    var liste = document.querySelector('[data-projets-liste]');
    var fiche = document.querySelector('[data-projet-fiche]');
    if (!liste && !fiche) return;
    var source = (liste || fiche).getAttribute('data-source') || '/data/projets-tech.json';

    fetch(source)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        var projets = data.projets || [];
        if (liste) rendreListe(liste, projets);
        if (fiche) rendreFiche(fiche, projets);
      })
      .catch(function () { (liste || fiche).innerHTML = '<p class="texte-doux">Les projets sont momentanément indisponibles.</p>'; });
  });

  function carte(p) {
    var a = document.createElement('a');
    a.className = 'carte carte-formation carte-projet';
    a.href = 'projet.html?slug=' + encodeURIComponent(p.slug);
    var media = p.image
      ? '<div class="carte__media ratio-16-9"><picture><source srcset="' + ech(webp(p.image)) + '" type="image/webp">' +
          '<img class="couvre" src="' + ech(p.image) + '" alt="' + ech(p.titre) + '" loading="lazy" width="640" height="360"></picture>' +
          '<span class="carte-formation__tags"><span class="badge ' + statutBadge(p.statut) + '">' + ech(p.statut) + '</span></span></div>'
      : '';
    a.innerHTML = media +
      '<div class="carte__corps"><div class="carte__meta"><span class="badge badge--contour">' + ech(p.domaine || p.filiere) + '</span>' +
        (p.annee ? '<span class="texte-doux" style="font-size:var(--fs-xs)">' + ech(p.annee) + '</span>' : '') + '</div>' +
        '<h3 class="carte__titre">' + ech(p.titre) + '</h3><p class="carte__texte">' + ech(p.resume) + '</p></div>';
    return a;
  }

  /* ----- Galerie (avec filtres) ou aperçu (data-limite) ----- */
  function rendreListe(hote, projets) {
    var limite = parseInt(hote.getAttribute('data-limite') || '0', 10);
    if (limite > 0) {
      var g0 = document.createElement('div'); g0.className = 'grille grille--3';
      projets.slice(0, limite).forEach(function (p) { g0.appendChild(carte(p)); });
      hote.innerHTML = ''; hote.appendChild(g0);
      return;
    }

    var domaines = [], statuts = [];
    projets.forEach(function (p) {
      if (p.domaine && domaines.indexOf(p.domaine) === -1) domaines.push(p.domaine);
      if (p.statut && statuts.indexOf(p.statut) === -1) statuts.push(p.statut);
    });
    function opts(list) { return '<option value="">Tous</option>' + list.map(function (v) { return '<option>' + ech(v) + '</option>'; }).join(''); }

    hote.innerHTML =
      '<form class="recherche" role="search" aria-label="Filtrer les projets"><div class="recherche__grille">' +
        '<div class="champ" style="margin:0"><label for="pj-q">Rechercher</label><input type="search" id="pj-q" placeholder="Mot-clé : drone, IA, solaire…" autocomplete="off"></div>' +
        '<div class="champ" style="margin:0"><label for="pj-dom">Domaine</label><select id="pj-dom">' + opts(domaines) + '</select></div>' +
        '<div class="champ" style="margin:0"><label for="pj-stat">Statut</label><select id="pj-stat">' + opts(statuts) + '</select></div>' +
      '</div></form>' +
      '<p class="recherche__resultats-info" role="status" aria-live="polite" id="pj-info"></p>' +
      '<div class="grille grille--3" id="pj-res"></div>';

    var q = hote.querySelector('#pj-q'), dom = hote.querySelector('#pj-dom'), stat = hote.querySelector('#pj-stat');
    var info = hote.querySelector('#pj-info'), res = hote.querySelector('#pj-res');

    function afficher() {
      var mq = norm(q.value), md = dom.value, ms = stat.value;
      var f = projets.filter(function (p) {
        if (md && p.domaine !== md) return false;
        if (ms && p.statut !== ms) return false;
        if (mq && norm([p.titre, p.resume, p.filiere, p.domaine, (p.technologies || []).join(' ')].join(' ')).indexOf(mq) === -1) return false;
        return true;
      });
      res.innerHTML = '';
      f.forEach(function (p) { res.appendChild(carte(p)); });
      info.textContent = f.length ? (f.length + (f.length > 1 ? ' projets' : ' projet')) : 'Aucun projet ne correspond.';
    }
    var t; q.addEventListener('input', function () { clearTimeout(t); t = setTimeout(afficher, 160); });
    dom.addEventListener('change', afficher); stat.addEventListener('change', afficher);
    afficher();
  }

  /* ----- Fiche projet riche ----- */
  function bloc(titre, contenuHtml) { return contenuHtml ? '<h2>' + ech(titre) + '</h2>' + contenuHtml : ''; }

  function partage(titre) {
    var u = encodeURIComponent(location.href), t = encodeURIComponent(titre);
    var wa = '<a href="https://wa.me/?text=' + t + '%20' + u + '" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.3L2 22l4.8-1.5A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.8.9.9-2.7-.2-.3A8 8 0 0 1 12 4zm4.4 9.9c-.2-.1-1.3-.7-1.5-.7-.2-.1-.3-.1-.5.1s-.6.7-.7.8-.3.2-.5 0a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5s-.5-1.3-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3a3 3 0 0 0-1 2.3c0 1.3 1 2.6 1.1 2.8s1.9 3 4.7 4.2c1.7.7 2.3.8 3.1.7.5-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1s-.3-.2-.5-.3z"/></svg></a>';
    var li = '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/></svg></a>';
    var fb = '<a href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener" aria-label="Partager sur Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 22v-8h2.7l.4-3H13V9c0-.9.3-1.5 1.6-1.5H16V4.9c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H7.5v3H10v8z"/></svg></a>';
    return '<div class="partage" style="margin-top:var(--e-6)"><span class="partage__lbl">Partager&nbsp;:</span>' + wa + li + fb + '</div>';
  }

  function rendreFiche(hote, projets) {
    var slug = new URLSearchParams(location.search).get('slug');
    var p = projets.filter(function (x) { return x.slug === slug; })[0];
    if (!p) { hote.innerHTML = '<div class="section-entete"><h1>Projet introuvable</h1><hr class="filet-or"><p><a href="innovations.html">Retour aux innovations</a>.</p></div>'; return; }
    document.title = p.titre + ' — ESIG TECH';

    var media = p.image ? '<figure class="ratio-16-9" style="margin:var(--e-5) 0"><picture><source srcset="' + ech(webp(p.image)) + '" type="image/webp"><img class="couvre" src="' + ech(p.image) + '" alt="' + ech(p.titre) + '" width="1200" height="675"></picture></figure>' : '';
    var avanc = (typeof p.avancement === 'number') ? '<p class="texte-doux" style="margin:var(--e-4) 0 .3em;font-size:var(--fs-sm)">Niveau d\'avancement : <strong>' + p.avancement + '%</strong></p><div class="avancement"><span style="width:' + Math.max(0, Math.min(100, p.avancement)) + '%"></span></div>' : '';
    var problematique = p.problematique ? bloc('Problématique', '<div class="mesure"><p>' + ech(p.problematique) + '</p></div>') : '';
    var solution = (p.solution && p.solution.length) ? bloc('Solution développée', '<div class="mesure">' + p.solution.map(function (x) { return '<p>' + ech(x) + '</p>'; }).join('') + '</div>') : '';
    var technos = (p.technologies && p.technologies.length) ? bloc('Technologies utilisées', '<ul class="tech-tags">' + p.technologies.map(function (t) { return '<li>' + ech(t) + '</li>'; }).join('') + '</ul>') : '';
    var galerie = (p.photos && p.photos.length > 1) ? bloc('En images', '<div class="grille grille--3">' + p.photos.map(function (ph) { return '<figure class="carte" style="margin:0"><div class="carte__media ratio-4-3"><picture><source srcset="' + ech(webp(ph)) + '" type="image/webp"><img class="couvre" src="' + ech(ph) + '" alt="' + ech(p.titre) + '" loading="lazy" width="640" height="480"></picture></div></figure>'; }).join('') + '</div>') : '';
    var video = (p.video && /^https?:/.test(p.video)) ? '<p style="margin-top:var(--e-4)"><a class="btn btn--secondaire" href="' + ech(p.video) + '" target="_blank" rel="noopener">Voir la vidéo du projet</a></p>' : '';
    var besoins = (p.besoins && p.besoins.length) ? '<div class="encadre-besoin" style="margin-top:var(--e-6)"><h2 style="font-size:var(--fs-md);margin-top:0">Besoins &amp; partenariat</h2><ul class="pile-s">' + p.besoins.map(function (b) { return '<li>' + ech(b) + '</li>'; }).join('') + '</ul><p style="margin-top:var(--e-3)"><a class="btn btn--accent" href="proposer.html">Soutenir ce projet</a></p></div>' : '';

    var fiche =
      '<div>' +
        '<p><strong>' + ech(p.filiere || '') + '</strong></p>' +
        (p.equipe ? '<p class="texte-doux" style="margin:.2em 0">Équipe : ' + ech(p.equipe) + '</p>' : '') +
        (p.encadreur ? '<p class="texte-doux" style="margin:.2em 0">' + ech(p.encadreur) + '</p>' : '') +
      '</div>';

    hote.innerHTML =
      '<nav class="fil-ariane" aria-label="Fil d\'Ariane"><ol><li><a href="index.html">ESIG TECH</a></li><li><a href="innovations.html">Innovations</a></li><li><span aria-current="page">' + ech(p.titre) + '</span></li></ol></nav>' +
      '<div class="carte__meta" style="margin-bottom:var(--e-2)"><span class="badge ' + statutBadge(p.statut) + '">' + ech(p.statut) + '</span>' +
        (p.domaine ? '<span class="badge badge--contour">' + ech(p.domaine) + '</span>' : '') + (p.annee ? '<span class="texte-doux">· ' + ech(p.annee) + '</span>' : '') + '</div>' +
      '<h1>' + ech(p.titre) + '</h1><hr class="filet-or">' +
      '<p class="chapo">' + ech(p.resume) + '</p>' +
      media + avanc + fiche +
      problematique + solution + technos + video + galerie + besoins +
      partage(p.titre) +
      '<p style="margin-top:var(--e-6)"><a class="btn btn--secondaire" href="innovations.html">← Tous les projets</a></p>';
  }
})();
