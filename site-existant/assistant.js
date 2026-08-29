// =========================================================================
//  assistant.js — ESIG Success Assistant (widget conversationnel)
//  -------------------------------------------------------------------------
//  Ne s'affiche que si ASSISTANT_CONFIG.endpoint est renseigné dans
//  config-site.js. La clé d'API du modèle reste côté serveur : ce widget
//  n'appelle que l'API de l'ESIG, jamais un fournisseur d'IA directement.
//  Voir assistant/README-ASSISTANT.md pour l'architecture complète.
// =========================================================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof ASSISTANT_CONFIG === 'undefined' || !ASSISTANT_CONFIG.endpoint) return;

    var conf = ASSISTANT_CONFIG;
    var historique = [];

    /* ----- Interface ----- */
    var lanceur = document.createElement('button');
    lanceur.type = 'button';
    lanceur.className = 'assistant-lanceur';
    lanceur.setAttribute('aria-label', 'Ouvrir ' + conf.nom);
    lanceur.setAttribute('aria-expanded', 'false');
    lanceur.innerHTML = '💬';

    var panneau = document.createElement('div');
    panneau.className = 'assistant-panneau';
    panneau.setAttribute('role', 'dialog');
    panneau.setAttribute('aria-label', conf.nom);
    panneau.hidden = true;
    panneau.innerHTML =
      '<div class="assistant-entete">' +
        '<strong>' + conf.nom + '</strong>' +
        '<button type="button" class="assistant-fermer" aria-label="Fermer l\'assistant">&times;</button>' +
      '</div>' +
      '<div class="assistant-messages" aria-live="polite"></div>' +
      '<form class="assistant-form">' +
        '<label class="hp-field" for="assistantQuestion">Votre question</label>' +
        '<input id="assistantQuestion" type="text" placeholder="Posez votre question…" autocomplete="off" maxlength="500">' +
        '<button type="submit">Envoyer</button>' +
      '</form>' +
      '<p class="assistant-note">Assistant automatique : ses réponses sont indicatives. ' +
      'Pour toute confirmation officielle (tarifs, admission, dates), un conseiller vous répond ' +
      '<a href="https://wa.me/' + String(conf.whatsapp_conseiller || '').replace(/\D/g, '') + '" target="_blank" rel="noopener">sur WhatsApp</a>.</p>';

    document.body.appendChild(lanceur);
    document.body.appendChild(panneau);

    var zoneMessages = panneau.querySelector('.assistant-messages');
    var form = panneau.querySelector('.assistant-form');
    var champ = panneau.querySelector('#assistantQuestion');

    function ajouterMessage(role, texte) {
      var div = document.createElement('div');
      div.className = 'assistant-msg assistant-msg-' + role;
      div.textContent = texte;
      zoneMessages.appendChild(div);
      zoneMessages.scrollTop = zoneMessages.scrollHeight;
      return div;
    }

    function basculer(ouvrir) {
      panneau.hidden = !ouvrir;
      lanceur.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
      if (ouvrir) {
        if (!zoneMessages.children.length) ajouterMessage('bot', conf.accroche);
        champ.focus();
        if (typeof suivreEvenement === 'function') suivreEvenement('assistant_ouvert', {});
      }
    }
    lanceur.addEventListener('click', function () { basculer(panneau.hidden); });
    panneau.querySelector('.assistant-fermer').addEventListener('click', function () { basculer(false); lanceur.focus(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panneau.hidden) basculer(false); });

    /* ----- Envoi d'une question à l'API ESIG ----- */
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var question = champ.value.trim();
      if (!question) return;
      champ.value = '';
      ajouterMessage('utilisateur', question);
      historique.push({ role: 'user', content: question });
      var attente = ajouterMessage('bot', '…');

      try {
        var reponse = await fetch(conf.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: historique.slice(-10),           // fenêtre de contexte limitée
            page: window.location.pathname             // contexte de navigation
          })
        });
        if (!reponse.ok) throw new Error('HTTP ' + reponse.status);
        var data = await reponse.json();
        attente.textContent = data.reponse || 'Je n\'ai pas pu générer de réponse.';
        historique.push({ role: 'assistant', content: attente.textContent });
        if (data.transfert_humain) {
          var t = ajouterMessage('bot', 'Je vous invite à poursuivre avec un conseiller : ');
          var lien = document.createElement('a');
          lien.href = 'https://wa.me/' + String(conf.whatsapp_conseiller || '').replace(/\D/g, '');
          lien.target = '_blank'; lien.rel = 'noopener';
          lien.textContent = 'ouvrir WhatsApp';
          t.appendChild(lien);
        }
      } catch (err) {
        attente.textContent = 'L\'assistant est momentanément indisponible. ' +
          'Contactez un conseiller au (+228) 93 03 33 51 (WhatsApp) ou via la page Contact.';
      }
    });
  });
})();
