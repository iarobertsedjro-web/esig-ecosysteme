/* =========================================================================
   shared/js/commun.js — Interactions communes à tous les sites ESIG
   -------------------------------------------------------------------------
   JavaScript « vanilla », sans dépendance. Progressif : le site reste
   utilisable même si ce script ne se charge pas.
     · Menu mobile (ouverture/fermeture accessible)
     · Année automatique dans le pied de page
     · Bouton WhatsApp flottant (si un numéro est fourni)
   ========================================================================= */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {

    /* ---- 1. Menu mobile ------------------------------------------- */
    var bascule = document.querySelector('.menu-bascule');
    var nav = document.getElementById('navigation-principale');

    if (bascule && nav) {
      var ouvrir = function (etat) {
        bascule.setAttribute('aria-expanded', etat ? 'true' : 'false');
        nav.setAttribute('data-ouvert', etat ? 'true' : 'false');
        document.body.style.overflow = etat && window.innerWidth < 1024 ? 'hidden' : '';
      };
      bascule.addEventListener('click', function () {
        ouvrir(bascule.getAttribute('aria-expanded') !== 'true');
      });
      // Fermer avec Échap
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bascule.getAttribute('aria-expanded') === 'true') {
          ouvrir(false); bascule.focus();
        }
      });
      // Fermer en cliquant un lien du menu (navigation)
      nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) ouvrir(false);
      });
      // Réinitialiser en passant au format bureau
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) { ouvrir(false); document.body.style.overflow = ''; }
      });
    }

    /* ---- 1b. Marquage du lien de navigation actif ----------------- */
    // La navigation est identique sur toutes les pages (site.config.json) ;
    // on marque ici le lien correspondant à la page courante.
    var pageCourante = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') !== -1) return;              // ignorer les ancres
      var cible = href.split('/').pop();
      if (cible && cible === pageCourante) a.setAttribute('aria-current', 'page');
    });

    /* ---- 2. Année automatique (pied de page) ---------------------- */
    document.querySelectorAll('[data-annee]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* ---- 3. Bouton WhatsApp flottant ------------------------------ */
    // Activé si window.ESIG_CONFIG.whatsapp est renseigné (config du site).
    var cfg = window.ESIG_CONFIG || {};
    if (cfg.whatsapp) {
      var num = String(cfg.whatsapp).replace(/\D/g, '');
      var lien = document.createElement('a');
      lien.href = 'https://wa.me/' + num;
      lien.className = 'whatsapp-flottant';
      lien.target = '_blank';
      lien.rel = 'noopener';
      lien.setAttribute('aria-label', 'Contacter un conseiller sur WhatsApp');
      lien.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.02s.75-2.14 1.02-2.44c.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.09.19-.14.31-.28.47-.14.16-.29.37-.42.49-.14.14-.28.29-.12.57.16.28.72 1.18 1.54 1.92 1.06.94 1.95 1.24 2.23 1.38.28.14.44.12.6-.07.16-.19.69-.8.87-1.08.18-.28.36-.23.61-.14.24.09 1.55.73 1.82.86.27.14.44.2.51.32.07.12.07.68-.17 1.36z"/></svg>';
      document.body.appendChild(lien);
    }
  });
})();
