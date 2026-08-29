// =========================================================================
// contact.js — Logique de la page Contact
// Le formulaire de contact route la demande vers la bonne boîte email selon
// le MOTIF choisi, en réutilisant les mêmes points de terminaison Formspree
// que la pré-inscription du site.
//
//   Admission / Inscription / Orientation -> admissions@esig.tg
//   Formation continue / Entreprises / VAE -> Formation@esig.tg
//   Partenariat / Institutionnel / Autre   -> admissions@esig.tg (par défaut)
//
// Si vous obtenez un point de terminaison Formspree dédié à contact@esig.tg
// (Direction générale), remplacez la valeur "direction" ci-dessous.
// =========================================================================

const FORMSPREE_CONTACT = {
  admission: "https://formspree.io/f/xvzjapzj", // -> admissions@esig.tg (déjà configuré)
  formation: "https://formspree.io/f/mkolrwja", // -> Formation@esig.tg  (déjà configuré)
  direction: "https://formspree.io/f/xvzjapzj"  // -> à remplacer par l'endpoint contact@esig.tg si disponible
};

// Associe chaque motif du menu déroulant au bon point de terminaison
const MOTIF_ROUTAGE = {
  "Admission, inscription, orientation": "admission",
  "Formation continue, entreprises, VAE/VAP": "formation",
  "Partenariat / relation institutionnelle": "direction",
  "Autre demande": "direction"
};

function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

function goToPreinscription() {
  window.location.href = 'index.html?preinscription=1';
}

function erreurContact(message) {
  const zone = document.getElementById('contactError');
  if (zone) { zone.textContent = message; zone.hidden = false; }
}

async function submitContact(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('contactSubmit');
  const zoneErreur = document.getElementById('contactError');
  if (zoneErreur) zoneErreur.hidden = true;

  // Antispam : champ piège rempli -> succès simulé, aucun envoi
  const piege = form.querySelector('input[name="_gotcha"]');
  if (piege && piege.value) {
    form.style.display = 'none';
    document.getElementById('contactSuccess').classList.add('show');
    return;
  }

  const motif = document.getElementById('motif').value;
  const cle = MOTIF_ROUTAGE[motif] || "direction";
  const endpoint = FORMSPREE_CONTACT[cle];

  // Mode démonstration si le point de terminaison n'est pas configuré
  if (!endpoint || endpoint.includes("VOTRE_CODE")) {
    form.style.display = 'none';
    document.getElementById('contactSuccess').classList.add('show');
    return;
  }

  btn.textContent = "Envoi en cours...";
  btn.disabled = true;

  const data = new FormData(form);
  const nom = document.getElementById('cNom').value;
  data.append('_subject', `Contact site — ${motif} — ${nom}`);
  data.append('_replyto', document.getElementById('cEmail').value);
  data.append('motif_demande', motif);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      form.style.display = 'none';
      const succes = document.getElementById('contactSuccess');
      succes.classList.add('show');
      succes.setAttribute('role', 'status');
      if (typeof suivreEvenement === 'function') suivreEvenement('envoi_contact', { motif: motif });
    } else {
      erreurContact("Une erreur est survenue. Merci de réessayer ou de nous écrire directement à contact@esig.tg.");
      btn.textContent = "Envoyer mon message";
      btn.disabled = false;
    }
  } catch (err) {
    erreurContact("Connexion impossible. Vérifiez votre connexion internet et réessayez.");
    btn.textContent = "Envoyer mon message";
    btn.disabled = false;
  }
}
