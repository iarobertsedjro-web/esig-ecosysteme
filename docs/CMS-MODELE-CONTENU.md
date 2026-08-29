# Modèle de contenu du CMS (collections & champs)

Ce document décrit **les collections à créer dans le CMS** (Directus recommandé, voir
`docs/CMS-SPEC.md`) et **la correspondance exacte** avec les fichiers du site et le script
`build/sync-cms.js`. Objectif : que l'équipe technique recrée le modèle en quelques minutes,
sans ambiguïté.

Règle d'or : **les noms de champs ci-dessous doivent correspondre** à ceux attendus par le site
(colonne « Champ »). Si vous les nommez autrement dans le CMS, adaptez les « mapper » de
`build/sync-cms.js` en conséquence.

Chaque collection possède un champ **`statut`** (brouillon / publié) : seul « publié » est
synchronisé vers le site (`filter[statut][_eq]=publie`).

---

## Collection `actualites` → `data/actualites.json`

Alimente le média ESIG News (liste + page article). Tri : `date` décroissant.

| Champ | Type (Directus) | Obligatoire | Notes |
|---|---|:--:|---|
| `slug` | Input (slug) | ✅ | minuscules, tirets, sans accents, **unique** — sert d'URL `article.html?slug=…` |
| `date` | Date (AAAA-MM-JJ) | ✅ | sert au tri |
| `date_texte` | Input | ✅ | date affichée (« 15 septembre 2026 ») |
| `categorie` | Dropdown | ✅ | valeurs : Événement, Annonce, Partenariat, Vie étudiante, Conférence, Communiqué |
| `titre` | Input | ✅ | |
| `resume` | Textarea | ✅ | 1 à 3 phrases (vignette + description SEO) |
| `contenu` | Textarea (ou repeater) | — | corps de l'article. En textarea : **un paragraphe par bloc séparé d'une ligne vide** |
| `image` | File (image) | — | rapatriée dans `medias/actualites/` par la synchro (option `--medias`) |
| `lieu` | Input | — | facultatif |
| `statut` | Dropdown (brouillon/publié) | ✅ | seul « publié » part sur le site |

---

## Collection `evenements` → `data/agenda.json`

Alimente la page **Agenda** d'ESIG News. Tri : `date` croissant. Un événement bascule tout seul
dans les « archives » quand sa date est passée (logique côté site, rien à supprimer).

| Champ | Type (Directus) | Obligatoire | Notes |
|---|---|:--:|---|
| `slug` | Input (slug) | recommandé | identifiant unique |
| `date` | Date (AAAA-MM-JJ) | ✅ | date de début, sert au tri et au « à venir / passé » |
| `date_fin` | Date | — | pour un événement sur plusieurs jours |
| `heure` | Input | — | ex. « 09:00 – 12:00 » |
| `date_texte` | Input | recommandé | date affichée |
| `categorie` | Dropdown | recommandé | valeurs : Rentrée, Portes ouvertes, Admission, Conférence, Formation continue, Cérémonie, Vie étudiante, Examens |
| `titre` | Input | ✅ | |
| `resume` | Textarea | recommandé | description courte |
| `lieu` | Input | — | |
| `lien` | Input (URL) | — | bouton d'action (inscription, page liée) ; commence par `https://`, `/`, `mailto:` ou `tel:` |
| `lien_libelle` | Input | — | texte du bouton (défaut « En savoir plus ») |
| `image` | File (image) | — | facultatif |
| `statut` | Dropdown (brouillon/publié) | ✅ | |

---

## Médiathèque (photos / vidéos)

- **Photos** : la bibliothèque de fichiers intégrée du CMS. À la synchro, les images liées aux
  actualités/événements sont rapatriées dans `medias/actualites/`. Idéalement, conserver
  l'optimisation déjà en place (redimensionnement + WebP, cf. pipeline Pillow du projet).
- **Vidéos** : **ne pas stocker les fichiers lourds dans le CMS**. Héberger la vidéo sur
  YouTube/Vimeo et coller le lien (champ `lien`), ou prévoir un champ `video_url` dédié.
  Cela préserve la légèreté et la robustesse du site statique.

---

## Rappel du flux

```
CMS (statut = publié)  ──▶  build/sync-cms.js  ──▶  data/actualites.json + data/agenda.json
                                                     └─▶ build.js + assembler.js ─▶ dist/ ─▶ mise en ligne
```

Le champ `meta` (catégories, note) de chaque fichier JSON est **préservé** par la synchro :
la liste des catégories reste maîtrisée côté site. Voir `build/sync-cms.js` pour les détails
techniques (mapping champ par champ, écriture atomique, sécurité du jeton).
