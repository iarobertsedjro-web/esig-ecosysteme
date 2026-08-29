// =========================================================================
//  actualites-data.js  —  DONNÉES DES ACTUALITÉS ET ÉVÉNEMENTS
// =========================================================================
//  COMMENT AJOUTER UNE ACTUALITÉ :
//  Copiez un bloc { ... } ci-dessous, collez-le en HAUT de la liste
//  (juste après « const ACTUALITES = [ »), et modifiez les valeurs.
//
//  CHAMPS :
//   - date        : "AAAA-MM-JJ" (ex. "2026-09-15"). Sert au tri automatique.
//   - date_texte  : la date affichée (ex. "15 septembre 2026")
//   - categorie   : "Événement" | "Annonce" | "Vie étudiante" | "Partenariat"
//   - titre       : le titre de l'actualité
//   - resume      : 1 à 3 phrases de description
//   - image       : chemin de la photo (ex. "images/actualites/rentree.jpg")
//                   → déposez d'abord la photo dans le dossier images/actualites/
//                   → laissez "" (vide) si pas de photo
//   - lieu        : lieu de l'événement (facultatif, ex. "Campus ESIG, Lomé")
//   - video       : identifiant YouTube (facultatif) — voir galerie-data.js
//
//  ⚠ Chaque bloc se termine par une virgule. Ne touchez pas au reste du code.
// =========================================================================

const ACTUALITES = [

  {
    "date": "2026-09-15",
    "date_texte": "15 septembre 2026",
    "categorie": "Événement",
    "titre": "Rentrée académique 2026-2027",
    "resume": "La rentrée solennelle de l'année académique 2026-2027 se tiendra sur le campus. Accueil des nouveaux étudiants, présentation des équipes pédagogiques et lancement officiel des cours.",
    "image": "images/campus/campus-01.jpg",
    "lieu": "Campus ESIG, Bè Kpota, Lomé",
    "video": ""
  },

  {
    "date": "2026-07-10",
    "date_texte": "10 juillet 2026",
    "categorie": "Annonce",
    "titre": "Ouverture des pré-inscriptions",
    "resume": "Les pré-inscriptions pour l'année académique 2026-2027 sont officiellement ouvertes. BTS, Licence, Master et formation continue : déposez votre dossier en ligne dès maintenant.",
    "image": "images/campus/campus-04.jpg",
    "lieu": "",
    "video": ""
  },

  {
    "date": "2026-06-20",
    "date_texte": "20 juin 2026",
    "categorie": "Partenariat",
    "titre": "Nouveau partenariat de mobilité internationale",
    "resume": "L'ESIG Global Success renforce son réseau de partenaires universitaires pour offrir de nouvelles opportunités de mobilité à ses étudiants en France, au Canada et en Belgique.",
    "image": "images/campus/campus-06.jpg",
    "lieu": "",
    "video": ""
  }

];
