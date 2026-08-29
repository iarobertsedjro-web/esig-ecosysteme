// =========================================================================
//  recherche-formations.js — Recherche et filtres du catalogue
//  S'active sur les pages qui contiennent le bloc #rechercheFormations.
//  Filtre les cartes de formation (.fcard / .lang-card) sur tous les onglets.
// =========================================================================
(function () {
  'use strict';

  function normaliser(t) {
    return String(t || '').toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bloc = document.getElementById('rechercheFormations');
    if (!bloc) return;

    var champ = document.getElementById('champRecherche');
    var selectNiveau = document.getElementById('filtreNiveau');
    var compteur = document.getElementById('compteurResultats');

    function filtrer() {
      var q = normaliser(champ.value.trim());
      var niveau = selectNiveau ? selectNiveau.value : '';
      var visibles = 0;

      document.querySelectorAll('.fcard, .lang-card').forEach(function (carte) {
        var texte = normaliser(carte.textContent);
        var panneau = carte.closest('.tab-panel');
        var okTexte = !q || texte.indexOf(q) !== -1;
        var okNiveau = !niveau || (panneau && panneau.id === niveau);
        var ok = okTexte && okNiveau;
        carte.style.display = ok ? '' : 'none';
        if (ok) visibles++;
      });

      // En mode recherche, montrer tous les panneaux pour parcourir les résultats
      var enRecherche = q.length > 0 || (niveau && niveau.length > 0);
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        if (enRecherche) p.classList.add('recherche-active');
        else p.classList.remove('recherche-active');
      });
      // Masquer les domaines dont toutes les cartes sont cachées
      document.querySelectorAll('.domain').forEach(function (dom) {
        var resteVisible = Array.prototype.some.call(
          dom.querySelectorAll('.fcard, .lang-card'),
          function (c) { return c.style.display !== 'none'; }
        );
        dom.style.display = (enRecherche && !resteVisible) ? 'none' : '';
      });

      if (compteur) {
        compteur.textContent = enRecherche
          ? visibles + ' formation' + (visibles > 1 ? 's' : '') + ' correspond' + (visibles > 1 ? 'ent' : '') + ' à votre recherche'
          : '';
      }
    }

    var minuteur = null;
    champ.addEventListener('input', function () {
      clearTimeout(minuteur);
      minuteur = setTimeout(filtrer, 150);
    });
    if (selectNiveau) selectNiveau.addEventListener('change', filtrer);
  });
})();
