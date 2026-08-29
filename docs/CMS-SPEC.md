# Espace d'administration du contenu (CMS) — Spécification

**Décision (23/07/2026) : Option A — CMS léger auto-hébergé.** Ce document spécifie ce composant.
Il complète `docs/ADMINISTRATION-ROLES.md` (les 4 profils et la matrice de droits).

> Statut : **spécification à valider par l'équipe technique** (Responsable ESIG Digital Hub + M. Kalipé),
> qui exploitera et sécurisera l'outil. La mise en service se fait **sur le serveur**, au déploiement.

## 1. Objectif

Permettre à l'**Administrateur général** et à l'**Administrateur éditorial** (Dir. Marketing & Com)
de **publier sans toucher au code** : actualités/articles, informations, planning/agenda, et médias
(photos, vidéos), avec **connexion, comptes et rôles**.

Les deux profils « sécurité/réseau » (Digital Hub, M. Kalipé) ne sont **pas** des comptes du CMS :
ce sont des accès serveur/NPM (voir `ADMINISTRATION-ROLES.md`, couche Infrastructure).

## 2. Outil recommandé

**Recommandation : Directus** (CMS « headless » open-source, auto-hébergeable).
- Interface d'édition **soignée et adaptée aux non-développeurs** (idéal pour le Dir. Marketing).
- **Rôles & permissions granulaires** intégrés (aucun développement d'authentification à faire).
- **Médiathèque** intégrée (upload, recadrage, formats) pour les photos.
- Fonctionne sur **SQLite** (léger) et derrière un reverse proxy (compatible NPM).
- **API** pour alimenter le site statique.

**Alternative ultra-légère : PocketBase** (binaire unique + SQLite, auth + rôles intégrés).
Plus léger encore, mais son interface est orientée développeur → l'écran d'édition « grand public »
serait à construire. À privilégier si l'équipe technique préfère un binaire unique.

*Le choix final revient à l'équipe technique* ; la suite du document vaut pour l'un comme l'autre.

## 3. Architecture

```
Rédaction (navigateur) ─▶ [ CMS sur serveur B, derrière NPM, /admin protégé ]
                                         │  (contenu en base + médias)
                                         ▼
                          [ build/sync + build.js + assembler.js ]  ─▶  sites statiques publics
```
- Le CMS **ne sert pas** les pages publiques : il stocke le contenu. Un **script de synchronisation**
  récupère le contenu du CMS → écrit `data/actualites.json` (et le planning, les médias) → le site
  est régénéré (`build.js` + `assembler.js`) et publié.
- Les sites publics restent **statiques** (rapides, robustes, sûrs) : le CMS reste **privé**,
  accessible uniquement aux administrateurs.
- Publication : soit **manuelle** (bouton « Publier » → régénération), soit **automatique** (webhook
  du CMS déclenchant la régénération). À définir avec l'équipe technique.

## 4. Contenu géré par le CMS

| Type | Alimente | Notes |
|---|---|---|
| **Actualités / articles** | `data/actualites.json` → ESIG News | Structure déjà définie (titre, date, catégorie, résumé, contenu, image…) |
| **Planning / agenda** | nouvelle collection → page agenda | Dates d'événements, sessions |
| **Médiathèque photos** | `medias/…` | Upload + optimisation automatique (WebP) |
| **Vidéos** | lien YouTube/Vimeo intégré | **Recommandé** : héberger les vidéos sur YouTube/Vimeo et intégrer le lien (évite le poids et la bande passante) plutôt que stocker des fichiers vidéo lourds |
| **Blocs éditables** (option) | chiffres clés, communiqués | Pour mettre à jour certains encarts sans code |

## 5. Les 4 rôles dans le CMS

Reprise de la matrice de `ADMINISTRATION-ROLES.md`, appliquée au CMS :

| Rôle | Dans le CMS |
|---|---|
| **Administrateur général** (vous) | Super-administrateur : gère les comptes et les rôles, tous les contenus, tous les réglages. |
| **Administrateur éditorial** (Dir. Marketing) | Peut **créer/modifier/publier** actualités, informations, planning, médias. **Pas** d'accès aux réglages système ni à la gestion des comptes. |
| **Admin technique (Digital Hub)** | Accès **technique** au serveur/CMS (maintenance, sauvegardes, sécurité) — pas un rôle d'édition. |
| **Admin réseau senior (M. Kalipé)** | Accès **infrastructure** (serveur, NPM, SSL) — pas un compte d'édition. |

## 6. Sécurité

- **Mots de passe** : jamais créés par un tiers. Chaque personne reçoit une **invitation** et définit
  **elle-même** son mot de passe. **Double authentification (2FA)** activée pour tous.
- **Admin protégé** : l'accès au CMS (`/admin`) passe par NPM ; restriction possible par IP/VPN,
  en plus du HTTPS. Le CMS n'est **pas** exposé publiquement au même titre que les sites.
- **Moindre privilège** : l'éditorial n'a que l'édition ; la technique n'a pas besoin d'éditer.
- **Sauvegardes** régulières de la base et des médias ; **journalisation** des actions.
- Aucun secret dans le code des sites publics (inchangé).

## 7. Mise en place (équipe technique, au déploiement)

1. Installer le CMS sur le serveur B (Directus via Node+SQLite, ou PocketBase binaire).
2. L'exposer derrière NPM sur un sous-domaine privé (ex. `admin.esig.tg` ou `cms.esig.tg`),
   **SSL + accès restreint**.
3. Créer le **super-administrateur** (vous), activer la **2FA**.
4. Créer les **rôles** (éditorial, technique) et **inviter** les personnes (chacune définit son mot
   de passe).
5. Brancher le **script de synchronisation** (à développer) + la régénération du site.

## 8. Ce que je peux préparer ensuite (côté code, sans serveur)

- Le **script de synchronisation** `build/sync-cms.js` (récupère le contenu du CMS → `data/*.json`),
  une fois l'outil confirmé et une instance de test disponible.
- Le **modèle de collections** (schéma actualités/planning/médias) prêt à importer dans le CMS.
- Une **page Agenda/Planning** sur le site news, alimentée comme les actualités.

**Ce qui nécessite le serveur + l'équipe technique** : l'installation du CMS, la création réelle des
comptes et l'envoi des invitations. Je ne fabrique aucun compte ni mot de passe.
