/* =========================================================================
   ESIG NOVA — Assistant conversationnel (composant partagé)
   -------------------------------------------------------------------------
   Refonte sécurisée du widget hérité (site v1.5.0). Corrections apportées :
     · Renommage « ESIG NOVA »
     · Icône filaire (plus d'emoji — conforme Brand Bible)
     · Piège de focus clavier (accessibilité WCAG 2.1 AA)
     · Configuration via window.NOVA_CONFIG

   PRINCIPE DE SÉCURITÉ (inchangé, validé à l'audit) :
     - La clé API du modèle NE FIGURE JAMAIS ici. Le widget n'appelle QUE
       le relais de l'ESIG (NOVA_CONFIG.endpoint), jamais un fournisseur d'IA.
     - Les messages sont insérés en texte pur (textContent) : aucune injection.
     - Le widget reste INVISIBLE tant que NOVA_CONFIG.endpoint est vide.
   ========================================================================= */
(function () {
  'use strict';

  var ICONE_LANCEUR =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/><path d="M12.5 8.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9.9-2.4z"/></svg>';
  var ICONE_ENVOI =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z"/></svg>';

  document.addEventListener('DOMContentLoaded', function () {
    var conf = window.NOVA_CONFIG || {};
    if (!conf.endpoint) return;                       // masqué tant que non configuré

    var nom = conf.nom || 'ESIG NOVA';
    var wa = String(conf.whatsapp || '').replace(/\D/g, '');
    var historique = [];

    /* ---- Lanceur ---- */
    var lanceur = document.createElement('button');
    lanceur.type = 'button';
    lanceur.className = 'nova-lanceur';
    lanceur.setAttribute('aria-haspopup', 'dialog');
    lanceur.setAttribute('aria-expanded', 'false');
    lanceur.setAttribute('aria-label', 'Ouvrir l\'assistant ' + nom);
    lanceur.innerHTML = ICONE_LANCEUR + '<span class="nova-lanceur__texte">' + echapper(nom) + '</span>';

    /* ---- Panneau ---- */
    var panneau = document.createElement('div');
    panneau.className = 'nova-panneau';
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-modal', 'false');
    panneau.setAttribute('aria-label', 'Assistant ' + nom);
    panneau.hidden = true;

    var entete = document.createElement('div');
    entete.className = 'nova-entete';
    entete.innerHTML =
      '<span>' +
        '<span class="nova-entete__titre">' + echapper(nom) + '</span><br>' +
        '<span class="nova-entete__sous">Assistant d\'orientation</span>' +
      '</span>' +
      '<button type="button" class="nova-fermer" aria-label="Fermer l\'assistant">&times;</button>';

    var zoneMessages = document.createElement('div');
    zoneMessages.className = 'nova-messages';
    zoneMessages.setAttribute('aria-live', 'polite');
    zoneMessages.setAttribute('aria-atomic', 'false');

    var form = document.createElement('form');
    form.className = 'nova-form';
    form.innerHTML =
      '<label class="visuellement-cache" for="nova-question">Votre question</label>' +
      '<input id="nova-question" type="text" placeholder="Posez votre question…" autocomplete="off" maxlength="500">' +
      '<button type="submit" aria-label="Envoyer">' + ICONE_ENVOI + '</button>';

    var note = document.createElement('p');
    note.className = 'nova-note';
    note.innerHTML = 'Réponses indicatives. Pour toute confirmation officielle, ' +
      (wa ? '<a href="https://wa.me/' + wa + '" target="_blank" rel="noopener">un conseiller vous répond sur WhatsApp</a>.'
          : 'contactez un conseiller via la page Contact.');

    panneau.appendChild(entete);
    panneau.appendChild(zoneMessages);
    panneau.appendChild(form);
    panneau.appendChild(note);

    document.body.appendChild(lanceur);
    document.body.appendChild(panneau);

    var champ = form.querySelector('#nova-question');
    var boutonFermer = entete.querySelector('.nova-fermer');

    /* ---- Ouverture / fermeture + piège de focus ---- */
    function focusables() {
      return Array.prototype.slice.call(
        panneau.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])')
      ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
    }
    function basculer(ouvrir) {
      panneau.hidden = !ouvrir;
      lanceur.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
      if (ouvrir) {
        if (!zoneMessages.children.length && conf.accroche) ajouter('bot', conf.accroche);
        champ.focus();
      }
    }
    lanceur.addEventListener('click', function () { basculer(panneau.hidden); });
    boutonFermer.addEventListener('click', function () { basculer(false); lanceur.focus(); });

    document.addEventListener('keydown', function (e) {
      if (panneau.hidden) return;
      if (e.key === 'Escape') { basculer(false); lanceur.focus(); return; }
      if (e.key === 'Tab') {                                   // piège de focus
        var f = focusables();
        if (!f.length) return;
        var premier = f[0], dernier = f[f.length - 1];
        if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
        else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
      }
    });

    /* ---- Messages ---- */
    function ajouter(role, texte) {
      var div = document.createElement('div');
      div.className = 'nova-msg nova-msg-' + role;
      div.textContent = texte;                                 // texte pur : anti-injection
      zoneMessages.appendChild(div);
      zoneMessages.scrollTop = zoneMessages.scrollHeight;
      return div;
    }

    /* ---- Envoi au relais ESIG ---- */
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var question = champ.value.trim();
      if (!question) return;
      champ.value = '';
      ajouter('utilisateur', question);
      historique.push({ role: 'user', content: question });
      var attente = ajouter('bot', '…');

      try {
        var reponse = await fetch(conf.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historique.slice(-10), page: window.location.pathname })
        });
        if (!reponse.ok) throw new Error('HTTP ' + reponse.status);
        var data = await reponse.json();
        attente.textContent = data.reponse || 'Je n\'ai pas pu générer de réponse.';
        historique.push({ role: 'assistant', content: attente.textContent });
        if (data.transfert_humain && wa) {
          var t = ajouter('bot', 'Je vous oriente vers un conseiller : ');
          var lien = document.createElement('a');
          lien.href = 'https://wa.me/' + wa;
          lien.target = '_blank'; lien.rel = 'noopener';
          lien.textContent = 'ouvrir WhatsApp';
          t.appendChild(lien);
        }
      } catch (err) {
        attente.textContent = 'L\'assistant est momentanément indisponible. ' +
          'Contactez un conseiller via la page Contact' + (wa ? ' ou sur WhatsApp.' : '.');
      }
    });

    function echapper(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  });
})();
