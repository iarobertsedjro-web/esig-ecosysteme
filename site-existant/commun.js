// =========================================================================
//  commun.js — Comportements transversaux du site (toutes pages)
//  Accessibilité (menu, modale, onglets), UTM, WhatsApp, consentement.
//  Aucun gestionnaire inline : compatible Content-Security-Policy stricte.
// =========================================================================
(function () {
  'use strict';

  var reduitAnimations = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Injection immédiate des cartes de parcours (remplace les anciens
     scripts inline ; exécutée dès le chargement — avant DOMContentLoaded —
     pour que les scripts existants retrouvent les cartes déjà en place) ----- */
  if (document.getElementById('poleAcademique') && typeof window.injectTwoPoles === 'function') {
    window.injectTwoPoles('poleAcademique', 'poleContinue');
  }
  var poleCardsInit = document.getElementById('poleCards');
  if (poleCardsInit && typeof window.injectPoleCards === 'function') {
    window.injectPoleCards('poleCards', poleCardsInit.getAttribute('data-pole'));
  }

  document.addEventListener('DOMContentLoaded', function () {

    /* ----- Menu mobile accessible ----- */
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('navLinks');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var ouvert = nav.classList.toggle('mobile-open');
        toggle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
        toggle.setAttribute('aria-label', ouvert ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation');
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('mobile-open')) {
          nav.classList.remove('mobile-open');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.focus();
        }
      });
    }

    /* ----- Onglets des catalogues et des actualités ----- */
    document.querySelectorAll('[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof window.showTab === 'function') window.showTab(btn.getAttribute('data-tab'), btn);
      });
    });
    document.querySelectorAll('[data-actu-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof window.switchActuTab === 'function') window.switchActuTab(btn.getAttribute('data-actu-tab'), btn);
      });
    });

    /* ----- Modale de pré-inscription (index uniquement) ----- */
    var modal = document.getElementById('modal');
    if (modal) {
      var dernierFocus = null;

      var ouvrirModale = function () {
        dernierFocus = document.activeElement;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        var premier = modal.querySelector('select, input, button');
        if (premier) premier.focus();
      };
      var fermerModale = function () {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        if (dernierFocus) dernierFocus.focus();
      };
      window.openModal = function (e) { if (e && e.preventDefault) e.preventDefault(); ouvrirModale(); };
      window.closeModal = fermerModale;

      document.querySelectorAll('.js-preinscription').forEach(function (btn) {
        btn.addEventListener('click', function () {
          suivreEvenement('cta_preinscription', { emplacement: btn.closest('section, div[class]') ? (btn.closest('section, div[class]').className || 'inconnu') : 'inconnu' });
          ouvrirModale();
        });
      });
      var fermer = document.getElementById('modalClose');
      if (fermer) fermer.addEventListener('click', fermerModale);
      modal.addEventListener('click', function (e) { if (e.target === modal) fermerModale(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) fermerModale();
        /* Piège de focus dans la modale */
        if (e.key === 'Tab' && modal.classList.contains('open')) {
          var focusables = modal.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea');
          if (!focusables.length) return;
          var premier = focusables[0], dernier = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
          else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
        }
      });

      var categorie = document.getElementById('categorie');
      if (categorie && typeof window.updateNiveaux === 'function') {
        categorie.addEventListener('change', window.updateNiveaux);
      }
      var form = document.getElementById('preinscriptionForm');
      if (form && typeof window.submitForm === 'function') {
        form.addEventListener('submit', window.submitForm);
      }
      /* Ouverture automatique via ?preinscription=1 */
      if (window.location.search.indexOf('preinscription=1') !== -1) {
        setTimeout(ouvrirModale, reduitAnimations ? 0 : 400);
      }
    }

    /* ----- Formulaire de contact ----- */
    var formContact = document.getElementById('contactForm');
    if (formContact && typeof window.submitContact === 'function') {
      formContact.addEventListener('submit', window.submitContact);
    }

    /* ----- Capture et conservation des paramètres UTM ----- */
    try {
      var params = new URLSearchParams(window.location.search);
      var utm = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
        if (params.get(k)) utm[k] = params.get(k);
      });
      if (Object.keys(utm).length) sessionStorage.setItem('esig_utm', JSON.stringify(utm));
      var memo = JSON.parse(sessionStorage.getItem('esig_utm') || '{}');
      document.querySelectorAll('form').forEach(function (f) {
        Object.keys(memo).forEach(function (k) {
          var champ = f.querySelector('input[name="' + k + '"]');
          if (champ) champ.value = memo[k];
        });
        var origine = f.querySelector('input[name="page_origine"]');
        if (origine) origine.value = window.location.pathname + window.location.search;
      });
    } catch (e) { /* stockage indisponible : sans impact */ }

    /* ----- Bouton WhatsApp flottant (configurable) ----- */
    if (typeof WHATSAPP_NUMERO !== 'undefined' && WHATSAPP_NUMERO && !document.querySelector('.whatsapp-flottant')) {
      var wa = document.createElement('a');
      wa.className = 'whatsapp-flottant';
      wa.href = 'https://wa.me/' + WHATSAPP_NUMERO.replace(/\D/g, '') +
        '?text=' + encodeURIComponent('Bonjour ESIG Global Success, je souhaite des informations sur vos formations.');
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.setAttribute('aria-label', 'Nous écrire sur WhatsApp (nouvelle fenêtre)');
      wa.innerHTML = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.9C8.8 2.9 3 8.7 3 15.9c0 2.3.6 4.5 1.7 6.5L3 29.1l6.9-1.8c1.9 1 4 1.6 6.1 1.6 7.2 0 13-5.8 13-13S23.2 2.9 16 2.9zm0 23.7c-1.9 0-3.8-.5-5.4-1.5l-.4-.2-4.1 1.1 1.1-4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7 0-5.9 4.9-10.8 10.8-10.8s10.8 4.9 10.8 10.8-4.9 10.7-10.8 10.7zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.8-1-2.4-.3-.6-.5-.5-.7-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.2 1.3 3.4c.2.2 2.3 3.5 5.5 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.6-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>';
      wa.addEventListener('click', function () { suivreEvenement('clic_whatsapp', { page: window.location.pathname }); });
      document.body.appendChild(wa);
    }

    /* ----- Bannière de consentement + chargement conditionnel GA4 ----- */
    gererConsentement();
  });

  /* ----- Suivi des conversions (n'envoie rien sans consentement + GA4 configuré) ----- */
  function suivreEvenement(nom, donnees) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', nom, donnees || {});
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: nom }, donnees || {}));
    } catch (e) { /* silencieux */ }
  }
  window.suivreEvenement = suivreEvenement;

  function gererConsentement() {
    var ga4 = (typeof ANALYTICS_CONFIG !== 'undefined' && ANALYTICS_CONFIG.ga4_id) ? ANALYTICS_CONFIG.ga4_id : '';
    if (!ga4) return; // aucun traceur configuré : pas de bannière nécessaire

    var choix = null;
    try { choix = localStorage.getItem('esig_consentement'); } catch (e) {}

    if (choix === 'accepte') { chargerGA4(ga4); return; }
    if (choix === 'refuse') return;

    var banniere = document.createElement('div');
    banniere.className = 'consent-banner';
    banniere.setAttribute('role', 'dialog');
    banniere.setAttribute('aria-label', 'Gestion des cookies');
    banniere.innerHTML =
      '<p>Nous utilisons des cookies de mesure d\'audience pour améliorer ce site. ' +
      'Vous pouvez accepter ou refuser : le site fonctionne dans les deux cas. ' +
      '<a href="cookies.html">En savoir plus</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="consent-accepter">Accepter</button>' +
      '<button type="button" class="consent-refuser">Refuser</button>' +
      '</div>';
    document.body.appendChild(banniere);
    banniere.querySelector('.consent-accepter').addEventListener('click', function () {
      try { localStorage.setItem('esig_consentement', 'accepte'); } catch (e) {}
      banniere.remove();
      chargerGA4(ga4);
    });
    banniere.querySelector('.consent-refuser').addEventListener('click', function () {
      try { localStorage.setItem('esig_consentement', 'refuse'); } catch (e) {}
      banniere.remove();
    });
  }

  function chargerGA4(id) {
    if (document.getElementById('ga4-script')) return;
    var s = document.createElement('script');
    s.id = 'ga4-script';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }
})();
