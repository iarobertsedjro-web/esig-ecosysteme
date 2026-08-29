# Spécification de l'API centrale — Écosystème ESIG

**Statut :** spécification cible (phase 1 = fichiers JSON statiques). Ce document décrit
l'API vers laquelle les fichiers `data/*.json` sont conçus pour évoluer, afin d'interconnecter
le site avec **ESIG Pilote 360**, **Mavor** et **Moodle**.

## 1. Principe

Aujourd'hui, les sites consomment des **fichiers JSON statiques** (`data/formations.json`,
`data/actualites.json`). Leur structure est **directement transposable** en réponses d'API :
il suffira, à terme, de remplacer l'URL du fichier par celle d'un point de terminaison, sans
changer le code des sites.

- **Format** : JSON (`application/json; charset=utf-8`).
- **Base URL cible** : `https://api.esig.tg/v1`.
- **Lecture** : publique (formations, actualités). **Écriture** : authentifiée (voir §6).
- **Versionnage** : préfixe d'URL (`/v1`).

## 2. Formations

### `GET /v1/formations`
Liste des formations. Filtres (query) : `pole` (`academique|continue`), `niveau`
(`BTS|Licence|Master|Continue|Modulaire|Langue`), `domaine`, `q` (recherche plein texte).

Réponse : `{ "meta": { "total": 145, ... }, "formations": [ Formation ] }`

### `GET /v1/formations/{id}`
Une formation par son identifiant (ex. `bts-finance-banque`). Réponse : `Formation`.

**Objet `Formation`** (déjà produit par `data/formations.json`) :
```
id, pole, niveau, niveau_label, domaine, mention, intitule, slug, url,
duree, resume, presentation, competences[], programme[{titre, modules[]}],
debouches[], poursuite, admission,
// spécifique langues : certification, niveau_cecrl, tag, description
// spécifique continue : academie ; modulaire : pole_modulaire
```

## 3. Actualités

### `GET /v1/actualites`
Liste triée par date décroissante. Filtre : `categorie`.
Réponse : `{ "meta": {...}, "actualites": [ Actualite ] }`

### `GET /v1/actualites/{slug}`
Un article. Réponse : `Actualite` (`slug, date, date_texte, categorie, titre, resume, contenu[], image, lieu`).

## 4. Préinscriptions & formulaires (écriture)

### `POST /v1/preinscriptions`
Corps : `{ type, niveau?, nom, email, telephone, message?, utm?, consentement:true }`
Réponse : `201 { id, statut: "recue" }`. Anti-spam (honeypot) + validation serveur obligatoires.

### `POST /v1/contacts` · `POST /v1/devis` · `POST /v1/offres`
Mêmes principes (contact général, devis entreprise, dépôt d'offre entreprise). Chaque soumission
est horodatée, journalisée sans données superflues, et notifiée au service concerné.

## 5. Assistant NOVA

### `POST /v1/assistant`  (voir `shared/components/nova/README-NOVA.md`)
Corps : `{ messages:[{role, content}], page }` → `{ reponse, transfert_humain, sources[] }`.
La clé du modèle reste **côté serveur**.

## 6. Sécurité & authentification (écriture)

- Lecture : ouverte, cache CDN possible.
- Écriture : jeton de service (en-tête `Authorization: Bearer …`) ou clé d'API interne ;
  limitation de débit ; validation stricte des entrées ; CORS restreint aux 6 sous-domaines.
- Aucune donnée personnelle dans les URLs ; conservation limitée (cf. politique de confidentialité).

## 7. Interconnexion (cible)

| Système | Sens | Usage |
|---|---|---|
| **ESIG Pilote 360** | ↔ | Les préinscriptions alimentent le CRM/pilotage ; le catalogue partage la même source `formations`. |
| **Mavor** | → | Reprise des données de formation / inscription selon le périmètre défini. |
| **Moodle** | → | Création des espaces de cours à partir des formations et des inscrits. |

**Principe directeur** : `formations` est la **source de vérité unique** du catalogue ; les autres
systèmes la consomment plutôt que de la dupliquer.

## 8. Erreurs
Codes HTTP standard : `200/201`, `400` (entrée invalide), `401/403` (auth), `404`, `429` (débit), `5xx`.
Corps d'erreur : `{ "erreur": "message lisible", "code": "slug_optionnel" }`.
