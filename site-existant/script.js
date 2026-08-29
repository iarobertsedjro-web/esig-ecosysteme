// =========================================================================
//  script.js — Page d'accueil : formulaire de pré-inscription et chiffres clés
//  Les liaisons d'événements (clics, soumission, clavier) sont dans commun.js.
// =========================================================================

// ===== CONFIGURATION DES DESTINATAIRES =====
// Chaque code correspond à un formulaire Formspree relié à une de vos adresses email.
//   classique -> admissions@esig.tg (BTS, Licence, Master)        — CONFIGURÉ
//   continue  -> Formation@esig.tg  (continue, modulaire, langues) — CONFIGURÉ
const FORMSPREE = {
  classique: "https://formspree.io/f/xvzjapzj",
  continue:  "https://formspree.io/f/mkolrwja"
};

// Programmes proposés selon le type de formation choisi
const PROGRAMMES = {
  classique: ["BTS (Bac+2)", "Licence (Bac+3)", "Master / MBA (Bac+5)", "Je ne sais pas encore"],
  continue:  ["Formation continue (professionnels)", "Formation modulaire", "Formation en langues", "Je ne sais pas encore"]
};

function updateNiveaux() {
  const cat = document.getElementById('categorie').value;
  const field = document.getElementById('niveauField');
  const select = document.getElementById('niveau');
  if (!cat) { field.style.display = 'none'; select.required = false; return; }
  select.innerHTML = '<option value="">Sélectionner...</option>';
  PROGRAMMES[cat].forEach(p => {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    select.appendChild(opt);
  });
  field.style.display = 'block';
  select.required = true;
}

function afficherErreurFormulaire(message) {
  const zone = document.getElementById('formError');
  if (zone) { zone.textContent = message; zone.hidden = false; }
}
function masquerErreurFormulaire() {
  const zone = document.getElementById('formError');
  if (zone) zone.hidden = true;
}

async function submitForm(e) {
  e.preventDefault();
  masquerErreurFormulaire();
  const form = document.getElementById('preinscriptionForm');

  // Antispam : si le champ piège est rempli, on simule un succès sans envoyer.
  const piege = form.querySelector('input[name="_gotcha"]');
  if (piege && piege.value) {
    form.style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');
    return;
  }

  const cat = document.getElementById('categorie').value;
  const endpoint = FORMSPREE[cat];
  const btn = document.getElementById('submitBtn');

  if (!endpoint || endpoint.includes("VOTRE_CODE")) {
    form.style.display = 'none';
    document.getElementById('formSuccess').classList.add('show');
    return;
  }

  btn.textContent = "Envoi en cours...";
  btn.disabled = true;
  const data = new FormData(form);
  const typeLisible = cat === 'classique' ? 'Formation classique (BTS/Licence/Master)' : 'Formation continue/modulaire/langues';
  const nomCandidat = document.getElementById('nom').value;
  const programme = document.getElementById('niveau').value;
  data.append('type_formation', typeLisible);
  data.append('_subject', `Pré-inscription ${programme || typeLisible} — ${nomCandidat}`);
  data.append('_replyto', document.getElementById('email').value);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      form.style.display = 'none';
      const succes = document.getElementById('formSuccess');
      succes.classList.add('show');
      succes.setAttribute('role', 'status');
      if (typeof suivreEvenement === 'function') {
        suivreEvenement('envoi_preinscription', { programme: programme || typeLisible });
      }
    } else {
      afficherErreurFormulaire("Une erreur est survenue lors de l'envoi. Merci de réessayer ou de nous contacter au (+228) 93 03 33 51.");
      btn.textContent = "Envoyer ma demande";
      btn.disabled = false;
    }
  } catch (err) {
    afficherErreurFormulaire("Connexion impossible. Vérifiez votre connexion internet et réessayez.");
    btn.textContent = "Envoyer ma demande";
    btn.disabled = false;
  }
}

// ===== CHIFFRES CLÉS =====
// Les valeurs réelles sont écrites dans le HTML (visibles sans JavaScript).
// Ce code ne fait qu'ajuster automatiquement certaines valeurs, puis animer.
function actualiserChiffresCles() {
  // Nombre de formations : calculé automatiquement depuis le catalogue
  const compteurFormations = document.querySelector('[data-stat="formations"]');
  if (compteurFormations && typeof FORMATIONS_DATA !== 'undefined') {
    let total = 0;
    Object.keys(FORMATIONS_DATA).forEach(niv => {
      (FORMATIONS_DATA[niv].domaines || []).forEach(d => { total += (d.specialites || []).length; });
    });
    if (typeof LANGUES_DATA !== 'undefined' && LANGUES_DATA.items) total += LANGUES_DATA.items.length;
    if (total > 0) {
      compteurFormations.setAttribute('data-target', total);
      compteurFormations.textContent = total;
    }
  }
  // Années d'existence : calculées depuis l'année de création
  const compteurAnnees = document.querySelector('[data-stat="annees"]');
  if (compteurAnnees && compteurAnnees.getAttribute('data-depuis')) {
    const annees = new Date().getFullYear() - parseInt(compteurAnnees.getAttribute('data-depuis'), 10);
    compteurAnnees.setAttribute('data-target', annees);
    compteurAnnees.textContent = annees;
  }
}

function animateCounters() {
  // Pas d'animation si l'utilisateur préfère limiter les mouvements
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.stat-num').forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const suffix = counter.getAttribute('data-suffix') || '';
    let count = 0;
    const step = target / 50;
    const tick = () => {
      count += step;
      if (count < target) {
        counter.textContent = Math.ceil(count) + suffix;
        requestAnimationFrame(tick);
      } else {
        counter.textContent = target + suffix;
      }
    };
    tick();
  });
}

document.addEventListener('DOMContentLoaded', actualiserChiffresCles);

let countersStarted = false;
const statsSection = document.querySelector('.stats');
if (statsSection && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsSection);
}
