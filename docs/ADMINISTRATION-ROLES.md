# Profils d'administration — Écosystème ESIG

/ Document de cadrage — à valider avant toute mise en œuvre. /

## 1. Le constat

Les 6 sites livrés sont **statiques** : aucune connexion, aucune base d'utilisateurs, aucun
panneau d'administration n'existe aujourd'hui. **On ne peut donc pas « créer des comptes » en
l'état** — il n'y a pas encore de système qui gère des comptes.

C'est **faisable**, mais cela suppose d'**ajouter une couche d'administration** (un nouveau
composant, hébergé sur le serveur), distincte des sites publics.

## 2. Deux natures d'« administrateurs » (à ne pas confondre)

Vos 4 profils relèvent en réalité de **deux couches différentes** :

| Couche | De quoi il s'agit | Qui | Où ça se gère |
|---|---|---|---|
| **CONTENU** (site) | Publier/mettre à jour le site : articles, infos, planning, médias | Administrateur général, Administrateur éditorial | Dans une **application d'administration / CMS** (à ajouter) |
| **INFRASTRUCTURE** (serveur) | Sécurité, réseau, déploiement, NPM, SSL, sauvegardes | Admin dev (Digital Hub), Admin réseau senior (M. Kalipé) | Au niveau **serveur & Nginx Proxy Manager** (accès système, pas des comptes du site) |

> Autrement dit : 2 profils sur 4 (les deux « sécurité/réseau ») ne sont **pas** des comptes du
> site web — ce sont des **accès techniques au serveur** (clés SSH, comptes NPM, comptes système),
> qui se créent au niveau de l'infrastructure, pas dans le site.

## 3. Les 4 profils et leurs droits (matrice)

Codes : **AG** = Administrateur général (vous) · **DEV** = Admin technique/sécurité (Digital Hub) ·
**NET** = Admin réseau senior (M. Kalipé) · **ÉDI** = Admin éditorial (Dir. Marketing & Com).

| Capacité | AG | DEV | NET | ÉDI |
|---|:--:|:--:|:--:|:--:|
| Créer / désactiver des comptes administrateurs | ✅ | — | — | — |
| Endosser tous les rôles (super-admin) | ✅ | — | — | — |
| Publier / éditer **actualités & articles** | ✅ | — | — | ✅ |
| Publier **informations & communiqués** | ✅ | — | — | ✅ |
| Gérer le **planning / agenda** | ✅ | — | — | ✅ |
| Gérer la **médiathèque** (photos / vidéos) | ✅ | — | — | ✅ |
| Modifier le **contenu des pages** institutionnelles | ✅ | — | — | ✅¹ |
| Déploiement / mise en production | ✅ | ✅ | ✅ | — |
| Config **serveur / NPM / SSL / pare-feu** | ✅ | ✅ | ✅ | — |
| **Sécurité applicative**, relais NOVA, clés API | ✅ | ✅ | ✅ | — |
| Sauvegardes, journaux, supervision | ✅ | ✅ | ✅ | — |
| Accès aux **données personnelles** (formulaires/leads) | ✅ | —² | —² | ✅³ |

¹ Selon périmètre défini. ² Accès technique aux systèmes, mais consultation des données personnelles
réservée et journalisée. ³ Uniquement pour le suivi des demandes, dans le respect du RGPD.

**Principe de moindre privilège** : chacun n'a que les droits nécessaires à sa mission. L'accès
maître reste à l'Administrateur général (cohérent avec la Brand Bible : « la DMC détient l'accès
maître exclusif, sous double authentification »).

## 4. Comment mettre en place la couche CONTENU (3 options)

> **Décision (23/07/2026) : option A retenue.** La spécification détaillée du CMS (outil,
> architecture, modèle de contenu, rôles, sécurité, mise en place) est dans **`docs/CMS-SPEC.md`**.

Pour que l'Administrateur général et l'Administrateur éditorial publient **via une connexion**
(sans toucher au code), il faut ajouter une administration. Options :

- **A. CMS léger auto-hébergé, connecté au site statique** *(retenue)*. Une interface web où
  l'on rédige articles/infos/planning et où l'on téléverse photos/vidéos ; le contenu alimente les
  fichiers `data/*.json` et `medias/`, puis le site se régénère. Gère nativement **utilisateurs +
  rôles**. Cadre parfaitement l'écosystème actuel.
- **B. Administration sur mesure** (application Node + base de données + authentification). Plus
  souple, mais plus longue à construire et à maintenir.
- **C. Comptes unifiés avec l'écosystème ESIG** (SSO). Si **ESIG Pilote 360 / le CRM** gèrent déjà
  des comptes, on peut y adosser l'authentification — un seul identifiant pour tout l'écosystème
  (cohérent avec l'ambition « ESIG OS »).

Pour la couche INFRASTRUCTURE (DEV, NET) : rien à créer dans le site — ce sont des **accès serveur
et NPM** (clés SSH, comptes NPM), à provisionner par M. Kalipé au déploiement.

## 5. Sécurité des comptes — règle importante

- **Je ne crée jamais de mots de passe et ne les manipule pas.** Une fois le système en place,
  **chaque personne définit elle-même son mot de passe** dans l'interface, via une invitation
  sécurisée. C'est la règle de sécurité (aucun mot de passe ne transite par un tiers).
- **Double authentification (2FA)** recommandée pour tous les comptes admin.
- Journalisation des actions sensibles ; révocation immédiate possible d'un compte.

## 6. Ce que je peux faire — et ce qui demande votre décision

- **Maintenant, sans risque** : ce cadrage (fait), et préparer la spécification technique de la
  couche d'administration selon l'option choisie.
- **Après votre choix (A / B / C)** : mettre en place le système, y **configurer les 4 rôles**, et
  **inviter** les 4 personnes (chacune créant ensuite son mot de passe).
- **Ce que je ne fais pas** : fabriquer des comptes/mots de passe « en dur » dans le site — ce
  serait à la fois **impossible** (site statique) et **dangereux** (un faux login côté page est
  contournable en un clic ; aucun secret ne doit vivre dans le code).
