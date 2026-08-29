# Ajouter un événement à l'agenda

**Vous n'avez pas besoin d'être développeur.** Tout se passe dans **un seul fichier** :
`data/agenda.json`. La page **Agenda** se met à jour automatiquement : les événements à venir
s'affichent du plus proche au plus lointain, et les événements passés partent dans les archives.

> Plus tard, une fois le CMS en place (voir `docs/CMS-SPEC.md`), vous ferez la même chose
> depuis une interface web, sans toucher au fichier. La structure des informations sera identique.

## En 3 étapes

1. **Préparez la photo (facultatif).** Pour un événement, l'image n'est pas obligatoire.

2. **Ouvrez** `data/agenda.json` avec un éditeur de texte.
   Juste après `"evenements": [`, **copiez-collez** ce bloc et modifiez les valeurs :

   ```json
   {
     "slug": "titre-court-sans-accents-ni-espaces",
     "date": "2026-11-14",
     "date_texte": "14 novembre 2026",
     "heure": "09:00 – 12:00",
     "categorie": "Conférence",
     "titre": "Le titre de votre événement",
     "resume": "Une à trois phrases qui décrivent l'événement.",
     "lieu": "Campus ESIG, Bè Kpota, Lomé",
     "lien": "https://admission.esig.tg",
     "lien_libelle": "S'inscrire"
   },
   ```

   **N'oubliez pas la virgule** à la fin du bloc si d'autres événements suivent.

3. **Enregistrez** le fichier. C'est terminé.

## Les champs, expliqués

| Champ | À quoi ça sert | Obligatoire ? |
|---|---|---|
| `slug` | Identifiant court, unique. Lettres minuscules, tirets, **sans accents ni espaces**. | Recommandé |
| `date` | Format `AAAA-MM-JJ`. Sert au **tri** et à savoir si l'événement est à venir ou passé. | **Oui** |
| `date_fin` | Date de fin, même format, pour un événement sur plusieurs jours. | Non |
| `date_texte` | La date **affichée** (ex. « 14 novembre 2026 »). | Recommandé |
| `heure` | Horaire affiché (ex. « 09:00 – 12:00 »). | Non |
| `categorie` | Une catégorie parmi celles listées en haut du fichier (Rentrée, Portes ouvertes, Conférence…). | Recommandé |
| `titre` | Le titre de l'événement. | **Oui** |
| `resume` | Court texte de description. | Recommandé |
| `lieu` | Lieu de l'événement. | Non |
| `lien` | Adresse d'un bouton (inscription, page liée…). Doit commencer par `https://`, `/`, `mailto:` ou `tel:`. | Non |
| `lien_libelle` | Texte du bouton (ex. « S'inscrire »). Par défaut : « En savoir plus ». | Non |
| `image` | Chemin d'une photo (ex. `/medias/actualites/ma-photo.jpg`), ou à omettre. | Non |

## Bon à savoir
- **Une virgule sépare deux blocs**, mais **le dernier bloc n'a pas de virgule** après lui.
- Un événement **disparaît des « à venir »** automatiquement une fois sa date passée : il rejoint
  la section « Événements passés » (repliée) — vous n'avez rien à supprimer.
- Pour ajouter une **catégorie**, ajoutez-la aussi dans la liste `"categories"` en haut du fichier.
- Les guillemets `"` sont obligatoires autour des textes.
