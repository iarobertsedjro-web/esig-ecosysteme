# Ajouter une actualité sur ESIG News

**Vous n'avez pas besoin d'être développeur.** Tout se passe dans **un seul fichier** :
`data/actualites.json`. Aucune autre manipulation n'est nécessaire — la nouvelle
actualité apparaît automatiquement sur le site.

## En 3 étapes

1. **Préparez la photo (facultatif).** Déposez-la dans `medias/actualites/`
   (ou réutilisez une photo existante de `medias/`). Notez son chemin, par exemple
   `/medias/actualites/ma-photo.jpg`.

2. **Ouvrez** `data/actualites.json` avec un éditeur de texte.
   Juste après `"actualites": [`, **copiez-collez** ce bloc et modifiez les valeurs :

   ```json
   {
     "slug": "titre-court-sans-accents-ni-espaces",
     "date": "2026-10-05",
     "date_texte": "5 octobre 2026",
     "categorie": "Événement",
     "titre": "Le titre de votre actualité",
     "resume": "Une à trois phrases qui résument l'actualité.",
     "contenu": [
       "Premier paragraphe de l'article.",
       "Deuxième paragraphe (ajoutez-en autant que nécessaire)."
     ],
     "image": "/medias/actualites/ma-photo.jpg",
     "lieu": "Campus ESIG, Lomé"
   },
   ```

   **N'oubliez pas la virgule** à la fin du bloc si d'autres actualités suivent.

3. **Enregistrez** le fichier. C'est terminé : l'actualité s'affiche, triée par date
   (la plus récente en premier), et sa page article est accessible automatiquement.

## Les champs, expliqués

| Champ | À quoi ça sert |
|---|---|
| `slug` | L'adresse de l'article (`article.html?slug=…`). Lettres minuscules, tirets, **sans accents ni espaces**, unique. |
| `date` | Format `AAAA-MM-JJ`. Sert au **tri automatique**. |
| `date_texte` | La date **affichée** (ex. « 5 octobre 2026 »). |
| `categorie` | Une catégorie parmi celles listées en haut du fichier (Événement, Annonce, Partenariat…). |
| `titre` | Le titre de l'actualité. |
| `resume` | Le court texte affiché sur les vignettes. |
| `contenu` | La liste des paragraphes de l'article (entre crochets `[ ]`, chaque paragraphe entre guillemets, séparés par des virgules). |
| `image` | Chemin de la photo, ou `""` (vide) si aucune. |
| `lieu` | Lieu de l'événement (facultatif). |

## Bon à savoir
- **Une virgule sépare deux blocs**, mais **le dernier bloc n'a pas de virgule** après lui.
- En cas de doute, copiez un bloc existant : gardez la même structure, changez seulement les textes.
- Les guillemets `"` sont obligatoires autour des textes.
- Pour ajouter une **catégorie**, ajoutez-la aussi dans la liste `"categories"` en haut du fichier.
