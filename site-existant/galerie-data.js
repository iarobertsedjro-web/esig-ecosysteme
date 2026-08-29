// =========================================================================
//  galerie-data.js  —  DONNÉES DE LA GALERIE PHOTOS & VIDÉOS
// =========================================================================
//  La galerie est organisée en ALBUMS. Chaque album a un titre et une liste
//  de médias (photos ou vidéos).
//
//  AJOUTER UNE PHOTO à un album existant :
//   1. Déposez la photo dans le dossier  images/galerie/
//   2. Ajoutez une ligne dans le tableau "medias" de l'album :
//        { "type": "photo", "src": "images/galerie/ma-photo.jpg", "legende": "..." },
//
//  AJOUTER UNE VIDÉO YOUTUBE :
//   1. Sur YouTube, ouvrez la vidéo. L'adresse ressemble à :
//        https://www.youtube.com/watch?v=ABC123xyz
//      L'identifiant est la partie APRÈS « v= » (ici : ABC123xyz)
//   2. Ajoutez une ligne dans "medias" :
//        { "type": "video", "youtube": "ABC123xyz", "legende": "..." },
//   → La vidéo n'est PAS stockée sur le serveur : elle reste sur YouTube,
//     ce qui préserve la vitesse du site et la bande passante.
//
//  CRÉER UN NOUVEL ALBUM :
//   Copiez un bloc album complet { "titre": ..., "medias": [...] }
//   et collez-le dans la liste ALBUMS.
//
//  ⚠ Respectez les virgules. Chaque média et chaque album se terminent par une virgule.
// =========================================================================

const ALBUMS = [

  {
    "titre": "Vie sur le campus",
    "description": "Le quotidien de nos étudiants et la vie de notre campus à Lomé.",
    "medias": [
      { "type": "photo", "src": "images/campus/campus-01.jpg", "legende": "Espace d'étude" },
      { "type": "photo", "src": "images/campus/campus-02.jpg", "legende": "Travaux pratiques" },
      { "type": "photo", "src": "images/campus/campus-03.jpg", "legende": "Salle informatique" },
      { "type": "photo", "src": "images/campus/campus-05.jpg", "legende": "Espaces communs" }
    ]
  },

  {
    "titre": "Cérémonies & événements",
    "description": "Les grands moments de la vie institutionnelle de l'ESIG Global Success.",
    "medias": [
      { "type": "photo", "src": "images/campus/campus-06.jpg", "legende": "Remise de diplômes" },
      { "type": "photo", "src": "images/campus/campus-07.jpg", "legende": "Conférence" },
      { "type": "photo", "src": "images/campus/campus-08.jpg", "legende": "Événement étudiant" }
    ]
  }

  // Pour ajouter un album vidéo, décommentez et adaptez le modèle ci-dessous :
  // ,{
  //   "titre": "Nos vidéos",
  //   "description": "Présentation de l'école et témoignages.",
  //   "medias": [
  //     { "type": "video", "youtube": "REMPLACER_PAR_ID", "legende": "Présentation de l'ESIG" }
  //   ]
  // }

];
