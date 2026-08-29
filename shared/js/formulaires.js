/* =========================================================================
   shared/js/formulaires.js — Envoi des formulaires vers le service ESIG
   -------------------------------------------------------------------------
   Branche automatiquement tout formulaire portant l'attribut
   `data-formulaire="<type>"` :
     · validation des champs (messages d'erreur accessibles) ;
     · anti-spam par pot de miel (champ caché `_gotcha`) ;
     · envoi POST JSON vers le service de traitement (voir
       shared/components/formulaires/serveur-formulaires.js) ;
     · message de confirmation (personnalisable via `data-confirmation`) ;
     · en cas d'échec réseau : réactive le bouton et invite aux canaux directs.

   Endpoint : window.FORM_CONFIG.endpoint (défini par page en développement),
   sinon `/api/formulaire` (même origine, proxifié par Nginx en production).
   ========================================================================= */
(function () {
  'use strict';
  // Endpoint : window.FORM_CONFIG.endpoint s'il est défini (même une chaîne vide,
  // qui signifie « pas de backend » → confirmation directe, utile en prévisualisation),
  // sinon /api/formulaire (défaut de production, même origine).
  var ENDPOINT = (window.FORM_CONFIG && typeof window.FORM_CONFIG.endpoint === 'string')
    ? window.FORM_CONFIG.endpoint
    : '/api/formulaire';

  document.addEventListener('DOMContentLoaded', function () {
    var formulaires = document.querySelectorAll('form[data-formulaire]');
    Array.prototype.forEach.call(formulaires, function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = f.querySelector('.message-erreur');
        if (!f.checkValidity()) {
          if (err) err.hidden = false;
          var inv = f.querySelector(':invalid'); if (inv && inv.focus) inv.focus();
          return;
        }
        if (err) err.hidden = true;
        var hp = f.querySelector('[name="_gotcha"]');
        if (hp && hp.value) return;              // robot : on ignore silencieusement
        if (!ENDPOINT) { confirmer(f); return; } // pas de backend (prévisualisation) : confirmation directe
        envoyer(f);
      });
    });
  });

  function envoyer(f) {
    var btn = f.querySelector('[type="submit"]');
    var libelle = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }

    var donnees = {};
    var fd = new FormData(f);
    fd.forEach(function (v, k) { if (k !== '_gotcha') donnees[k] = v; });
    donnees._formulaire = f.getAttribute('data-formulaire') || 'inconnu';
    donnees._page = location.pathname;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donnees)
    })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
      .then(function () { confirmer(f); })
      .catch(function () { echec(f, btn, libelle); });
  }

  function confirmer(f) {
    var msg = f.getAttribute('data-confirmation') ||
      'Votre demande a bien été envoyée. Nous revenons vers vous rapidement.';
    f.innerHTML = '<div class="carte__corps"><p><strong>Merci !</strong> ' + msg + '</p></div>';
  }

  function echec(f, btn, libelle) {
    if (btn) { btn.disabled = false; btn.textContent = libelle; }
    var err = f.querySelector('.message-erreur');
    if (err) {
      err.hidden = false;
      err.textContent = "L'envoi a échoué. Merci de réessayer, ou de nous joindre directement (téléphone, WhatsApp ou e-mail).";
    }
  }
})();
