// =========================================================================
//  config-site.js  —  CONFIGURATION CENTRALE DU SITE
// =========================================================================
//  Ce fichier centralise ce que l'équipe ESIG peut modifier sans développeur :
//  version, domaine, réseaux sociaux, carrousel, WhatsApp, mesure d'audience,
//  chiffres clés et assistant IA.
// =========================================================================

// =========================================================================
//  VERSION DU SITE
// =========================================================================
//  À chaque nouvelle livraison, mettez à jour le numéro et la date.
//  La version s'affiche automatiquement, en petit, dans le pied de page.
//
//  RÈGLE DE NUMÉROTATION (numero = MAJEUR.MINEUR.CORRECTIF) :
//   - CORRECTIF (ex. 1.0.0 -> 1.0.1) : correction, petit ajustement
//   - MINEUR   (ex. 1.0.0 -> 1.1.0) : ajout de contenu ou de fonctionnalité
//   - MAJEUR   (ex. 1.0.0 -> 2.0.0) : refonte importante
// =========================================================================

const VERSION_SITE = {
  "numero": "1.5.0",
  "date": "2026-07-14"
};


// =========================================================================
//  DOMAINE OFFICIEL DU SITE
// =========================================================================
//  Adresse canonique du site. À la mise en production sur esig.tg,
//  cette valeur est déjà correcte. Pour la modifier partout (HTML compris),
//  exécutez :  node tools/changer-domaine.js https://nouveau-domaine.tg
// =========================================================================

const SITE_URL = "https://esig.tg";


// =========================================================================
//  WHATSAPP — bouton flottant sur tout le site
// =========================================================================
//  Numéro au format international sans espaces. Laissez "" pour masquer
//  le bouton WhatsApp flottant.
// =========================================================================

const WHATSAPP_NUMERO = "+22893033351";


// =========================================================================
//  MESURE D'AUDIENCE (Google Analytics 4)
// =========================================================================
//  Renseignez votre identifiant GA4 (format "G-XXXXXXXXXX") pour activer
//  la mesure d'audience. Tant qu'il est vide, AUCUN traceur n'est chargé
//  et aucune bannière de cookies ne s'affiche.
//  Le chargement ne se fait qu'après consentement du visiteur.
// =========================================================================

const ANALYTICS_CONFIG = {
  "ga4_id": ""   // ex. "G-XXXXXXXXXX" — à créer dans Google Analytics
};


// =========================================================================
//  ESIG SUCCESS ASSISTANT (agent conversationnel)
// =========================================================================
//  Le widget de discussion ne s'affiche que lorsqu'un point de terminaison
//  (endpoint) d'API est renseigné. La clé d'API du modèle NE DOIT JAMAIS
//  figurer ici : elle reste côté serveur (voir assistant/README-ASSISTANT.md).
// =========================================================================

const ASSISTANT_CONFIG = {
  "endpoint": "",                 // ex. "https://esig.tg/api/assistant" — vide = widget masqué
  "nom": "ESIG Success Assistant",
  "accroche": "Une question sur nos formations, l'admission ou la VAE ? Je vous oriente.",
  "whatsapp_conseiller": "+22893033351"   // transfert vers un conseiller humain
};


// =========================================================================
//  CHIFFRES CLÉS DE LA PAGE D'ACCUEIL
// =========================================================================
//  ⚠ À VALIDER PAR LA DIRECTION : « etudiants » et « insertion_pct »
//  proviennent de l'ancienne version du site et n'ont pas de source
//  officielle documentée. Mettez à jour ces valeurs ici ET dans le bloc
//  « stats » de index.html (les valeurs y sont écrites en dur pour rester
//  visibles sans JavaScript et pour les moteurs de recherche).
//  Le nombre de formations et les années d'existence sont calculés
//  automatiquement (catalogue + année de création 2008).
// =========================================================================

const CHIFFRES_CLES = {
  "etudiants": 894,        // À VALIDER — source interne à documenter
  "insertion_pct": 82,     // À VALIDER — méthodologie d'enquête à préciser
  "annee_creation": 2008
};


// =========================================================================
//  CARROUSEL DE LA PAGE D'ACCUEIL
// =========================================================================
//  Les photos qui défilent en fond de la page d'accueil.
//  Pour AJOUTER une photo : déposez-la dans images/hero/ ou images/campus/,
//  puis ajoutez une ligne "..." ci-dessous (avec la virgule).
//  Pour RETIRER une photo : supprimez sa ligne.
//  Ordre d'affichage = ordre des lignes. Minimum 1 photo.
// =========================================================================

const CARROUSEL_ACCUEIL = [
  "images/hero/hero-diplomes.webp",
  "images/campus/campus-01.webp",
  "images/campus/campus-06.webp",
  "images/campus/campus-08.webp",
  "images/campus/campus-03.webp"
];


// =========================================================================
//  RÉSEAUX SOCIAUX
// =========================================================================
//  POUR METTRE À JOUR UN LIEN :
//   1. Ouvrez la page sociale dans votre navigateur.
//   2. Copiez l'adresse complète depuis la barre d'adresse.
//   3. Collez-la entre les guillemets du réseau concerné ci-dessous.
//
//  POUR MASQUER UN RÉSEAU (si vous n'en avez pas / plus) :
//   Laissez son adresse vide : "url": ""
//   L'icône correspondante ne s'affichera pas.
//
//  ⚠ Conservez les guillemets et la virgule à la fin de chaque ligne "url".
// =========================================================================

const RESEAUX_SOCIAUX = [
  {
    "reseau": "Facebook",
    "url": "https://www.facebook.com/share/1EjS8JdN2g"
  },
  {
    "reseau": "LinkedIn",
    "url": "https://www.linkedin.com/company/esig-tg"
  },
  {
    "reseau": "Instagram",
    "url": "https://www.instagram.com/esigglobal_success"
  },
  {
    "reseau": "YouTube",
    "url": ""
  },
  {
    "reseau": "TikTok",
    "url": "https://www.tiktok.com/@esigglobalsuccess"
  }
];
