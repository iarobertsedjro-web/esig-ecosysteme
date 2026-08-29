# AUDIT — Écosystème numérique ESIG Global Success

| | |
|---|---|
| **Projet** | Refonte de la présence web de l'ESIG en écosystème de sous-domaines |
| **Document** | Audit de démarrage (Phase 0) — état des lieux, manques, plan |
| **Auteur** | Claude Code, pour la Direction Marketing & Communication (Kokou) |
| **Date** | 22 juillet 2026 |
| **Statut** | À lire et valider avant de lancer la Phase 1 |
| **Règle d'or** | Ce document **ne modifie rien** au matériel fourni. Aucun code de site n'a été écrit. |

> **Comment lire ce document.** Il est écrit pour être compris sans être développeur.
> Les termes techniques sont expliqués à leur première apparition. Si vous êtes pressé,
> lisez la **Partie 1 (synthèse)** et la **Partie 5 (décisions attendues de vous)** :
> elles suffisent pour décider de la suite.

---

## 0. Confirmation : le CLAUDE.md est intégré

J'ai lu et intégré le fichier `CLAUDE.md`. J'en retiens et je respecterai :

- **L'identité verrouillée** : nom *ESIG GLOBAL SUCCESS*, devise *Vestigatio Excellentiae*,
  essence « Construire des trajectoires crédibles », valeurs Compétence / Innovation / Durabilité,
  bleu **#2A4291**, secondaire or.
- **L'architecture cible** : un « monorepo » (un seul dossier-projet) avec un **socle
  partagé unique** (`shared/`) et **un dossier par site** (`sites/www`, `admission`,
  `executive`, `international`, `news`, `entreprises`).
- **Les contraintes techniques** : HTML/CSS/JavaScript « vanilla » (sans framework, sans
  dépendance externe au chargement), mobile-first, performance (Lighthouse ≥ 90),
  conformité W3C, accessibilité WCAG 2.1 AA, sécurité (en-têtes, formulaires durcis,
  aucune clé API dans le code), SEO complet, langue française.
- **La méthode** : une phase à la fois, validation à chaque fin de phase, tout expliqué
  en langage clair, journal des versions (`CHANGELOG.md`), dossier de déploiement pour
  M. Kalipé.

J'ai déposé une copie du `CLAUDE.md` à la racine du projet (`esig-ecosysteme/CLAUDE.md`) :
c'est désormais le **contrat de référence**. Je ne le modifierai jamais sans votre accord.

> ⚠️ **Un point important, traité en détail en Partie 5.** En croisant le `CLAUDE.md`
> avec la **Brand Bible** et le **logo réel**, j'ai trouvé **quelques désaccords** entre
> ces documents (par exemple sur la nuance exacte du bleu, ou l'orthographe de la
> signature). Je ne tranche rien tout seul sur l'identité de marque : je vous présente
> les faits et une recommandation, et **vous décidez**.

---

## 1. Synthèse pour la direction

### 1.1 La bonne nouvelle : vous partez de bien plus loin que prévu

Le `CLAUDE.md` décrit le site actuel comme « **une seule page dense, version 1.4.0** ».
**Ce n'est pas ce que j'ai trouvé.** Le matériel fourni (`site-esig-global-success-v1.5.0`)
est en réalité un **site multi-pages mûr, en version 1.5.0**, déjà très avancé :

- **145 fiches de formation** déjà rédigées, en pages web indexables par Google ;
- **des pages structurées** : accueil, parcours académique, formation continue, admission,
  actualités, contact, plus les pages légales ;
- **un assistant conversationnel « ESIG NOVA » déjà fonctionnel** (et bien construit) ;
- **un module Actualités & Galerie** que votre équipe peut mettre à jour seule ;
- **des outils** de génération automatique (fiches, plan de site) et une configuration
  centralisée pensée pour les non-développeurs ;
- de la **sécurité** (en-têtes, formulaires anti-spam, bannière cookies) déjà en place.

**Conséquence concrète :** la refonte demandée n'est pas une reconstruction à partir de
zéro. C'est essentiellement une **réorganisation** (répartir ce contenu entre 6 sites
reliés) **+ une remise aux normes de la marque** (couleurs, typographies, logo). C'est
**plus rapide, moins risqué et moins coûteux** qu'un chantier vierge. Nous **réutilisons**
le contenu existant au lieu de le réécrire.

### 1.2 Les 4 éléments audités, en une ligne chacun

| Élément | Verdict |
|---|---|
| **Site existant v1.5.0** | ✅ Solide et riche. Bonne matière première. À réorganiser en 6 sites et à remettre aux couleurs de la marque. |
| **Catalogue des formations** | ⚠️ **145** formations exploitables et bien structurées — mais la marque annonce **154**. Écart de **9** à clarifier. Deux fichiers de données à fusionner en un seul. |
| **Widget ESIG NOVA** | ✅ **Bien conçu et sûr** (meilleur que prévu). Corrections légères avant intégration. La clé secrète n'est pas exposée. |
| **Ressources de marque** | ⚠️ J'ai le bleu, l'or, les typographies et la Brand Bible. **Il manque le logo au format vectoriel** (fichier « source » de haute précision). |

### 1.3 Ce qui bloque le démarrage : 5 décisions vous appartiennent

Avant de construire, **5 points de marque doivent être tranchés par vous** (détaillés en
Partie 5). En résumé :

1. **La nuance exacte du bleu** — `#2A4291` (CLAUDE.md) vs `#14284B` (Brand Bible).
   *→ J'ai la preuve que #2A4291 est le bon. Confirmation simple attendue.*
2. **L'orthographe de la signature** — `BUILD YOUR FUTUR` (CLAUDE.md) vs `BUILD YOUR FUTURE`
   (Brand Bible, 16 fois). *→ Recommandation : FUTURE. Confirmation attendue.*
3. **145 ou 154 formations ?** — quel est le chiffre officiel, et faut-il créer les 9
   manquantes ?
4. **Les typographies** — la marque impose *Georgia + Calibri* ; le site actuel utilise
   *Sora + Inter*. *→ Recommandation : appliquer la marque (Georgia + Calibri).*
5. **Les chiffres clés** (894 étudiants, 82 % d'insertion, création 2008) — non sourcés,
   à confirmer avant publication.

Aucune de ces décisions ne demande de compétence technique : ce sont des choix
**éditoriaux et de marque** qui vous reviennent.

---

## 2. Audit détaillé des 4 éléments

### 2.1 Le site existant (version 1.5.0)

**Ce que c'est.** Un site web statique (des pages HTML classiques, rapides et robustes),
hébergé temporairement sur `news.esig.tg`, prêt pour une migration vers `esig.tg`. Poids
total : **5,5 Mo** (dont 2,8 Mo d'images) — c'est léger, donc rapide.

**Inventaire des pages et de leur contenu :**

| Page actuelle | Contenu principal | Destination dans l'écosystème |
|---|---|---|
| `index.html` (Accueil) | Les 2 pôles, orientation par profil, teaser VAE, campus, international, témoignages, appels à l'action | **www** (institutionnel + aiguillage) |
| `parcours-academique.html` | Présentation BTS / Licence / Master, recherche de formations | **admission** (+ aperçu sur www) |
| `formation-continue.html` | Formation Continue & Modulaire | **executive** |
| `admission.html` | 5 étapes, niveaux d'entrée, pièces à fournir, **VAE/VAP**, candidature | **admission** (VAE/VAP → aussi **executive**) |
| `actualites.html` + galerie | Actualités par catégories (Événement, Annonce, Partenariat), galerie photos | **news** |
| `contact.html` | Formulaires « écrire au service concerné », candidatures spontanées | **www** + réparti sur chaque site |
| `fiche.html` (gabarit) | Modèle de fiche formation détaillée (onglets Présentation, Compétences, Programme, Débouchés, Admission) | **admission** / **executive** |
| `formations/…` (145 fichiers) | Les fiches détaillées, une par formation | **admission** (académique) / **executive** (continue) |
| Pages légales (mentions, confidentialité, cookies, accessibilité, CGU) | Modèles juridiques « à valider par la direction » | **Toutes** (pied de page partagé) |

**Points forts à conserver :**
- Fiches formation avec **données structurées** (le site « explique » chaque formation à
  Google → meilleur référencement).
- **Configuration centralisée** (`config-site.js`) : votre équipe peut changer le numéro
  WhatsApp, les réseaux sociaux, les photos du carrousel **sans développeur**.
- **Outils de génération** : un script fabrique les 145 fiches à partir d'un seul fichier
  de données → on ne code jamais une fiche à la main.
- Sécurité déjà pensée (`.htaccess` : HTTPS forcé, compression, redirections).

**Points à corriger (traités en Phase 1) :**
- 🎨 **Hors marque visuellement.** Le site utilise les polices *Sora* et *Inter* et un
  accent **turquoise (#0ea5a4)**. La marque impose *Georgia + Calibri* et un accent **or**.
  Il faut réaligner.
- 🧩 **Tout est dans un seul site.** Il faut le découper proprement en 6 sites reliés,
  autour d'un socle commun, sans dupliquer le code.
- 📦 Deux fichiers de formations coexistent (voir 2.2) : à unifier.

### 2.2 Le catalogue des formations

**Ce que j'ai vérifié.** Les formations sont **exploitables et de bonne qualité** :
chacune a un intitulé, un niveau, un domaine, des compétences visées, des débouchés, un
programme et des conditions d'admission. C'est une base sérieuse.

**Le compte exact, aujourd'hui, sur le site :**

| Pôle | Catégorie | Nombre |
|---|---|---:|
| **Parcours académique** | BTS | 16 |
| | Licence | 25 |
| | Master / MBA | 25 |
| **Formation continue & modulaire** | Formation continue (13 académies) | 59 |
| | Formation modulaire (4 pôles) | 15 |
| | Langues (5 langues certifiantes) | 5 |
| **TOTAL SITE** | | **145** |

**Le désaccord à régler.** La **Brand Bible** et le `CLAUDE.md` annoncent **154 programmes**.
Le site en contient **145**. Il manque donc **9 formations**, ou bien le chiffre « 154 »
doit être ajusté. Les 6 documents-catalogues que vous avez fournis (BTS, Licence, Masters,
Formation continue, Modulaire, Langues) sont la **source officielle** : il faut décider si
l'on **crée les 9 fiches manquantes** ou si l'on **communique le chiffre réel confirmé**.

**Deux fichiers de données à fusionner.** Aujourd'hui, les formations existent en double :
- `formations-data.js` → la base **riche** (tout le détail), qui sert à fabriquer les fiches ;
- `assistant/base-documentaire/formations.json` → une base **légère** (juste titre + niveau
  + lien), qui sert à l'assistant NOVA.

**Recommandation : une seule source de vérité.** Je propose de créer **un unique fichier
`data/formations.json`**, complet, dont **tout le reste découle** (les fiches, la recherche,
l'assistant, et demain l'API). Structure proposée (simplifiée) :

```
Chaque formation =
  id                → identifiant unique et stable (ex. "bts-finance-banque")
  pole              → "academique" | "continue"
  niveau            → "BTS" | "Licence" | "Master" | "Continue" | "Modulaire" | "Langue"
  domaine           → ex. "Sciences économiques et de Gestion"
  mention           → ex. "Sciences de Gestion"
  intitule          → nom affiché de la formation
  slug / url        → adresse web propre de la fiche
  duree             → ex. "2 ans"
  academie / pole_modulaire → regroupement (continue/modulaire)
  admission         → conditions d'entrée
  competences       → liste des compétences visées
  programme         → liste des blocs / modules
  debouches         → liste des métiers visés
  poursuite         → suites d'études possibles
  frais             → si fournis (sinon : "sur devis")
  certification     → ex. certification de langue (CECRL), Cisco…
```

Cette structure a un avantage : elle est **directement transposable en API** (voir la
Phase 6), pour connecter plus tard le site à *ESIG Pilote 360*, *Mavor* et *Moodle*.

### 2.3 Le widget conversationnel ESIG NOVA

**Bonne surprise : il est bien fait.** Contrairement à ce que laissait craindre le brief,
le widget existant (dans le dossier `assistant/` du site) est **propre, léger et sûr**.

> Le dossier `IA Conversationnel ESIG NOVA` du Bureau est **vide**, et le fichier
> `Wide ESIG NOVA.docx` ne contient qu'un lien vers une démo générée précédemment.
> **Le vrai widget à auditer est donc le code du dossier `assistant/`** du site v1.5.0.
> C'est celui que j'ai analysé.

**Audit sécurité — ✅ satisfaisant :**
- 🔐 **La clé secrète du modèle d'IA n'est jamais dans le code du site.** Le widget
  n'appelle **que** l'API de l'ESIG (un « relais » sur votre serveur), jamais directement
  un fournisseur d'IA. C'est exactement la bonne architecture, exigée par le CLAUDE.md.
- 🛡️ **Pas de faille d'injection** : les messages sont affichés en « texte pur » (jamais
  interprétés comme du code), ce qui protège contre les attaques classiques.
- Le relais d'exemple fourni (`serveur-exemple.js`) est prudent : clé en variable
  d'environnement, **limite de 10 questions/minute par visiteur**, taille des requêtes
  plafonnée, questions tronquées à 500 caractères.
- Le modèle utilisé est **Claude Haiku 4.5** — récent, rapide et économique.

**Audit « anti-invention » — ✅ excellent.** Le prompt système interdit formellement à
l'assistant d'inventer une formation, un tarif, une date, une accréditation ou une
garantie de visa. En l'absence d'information validée, il **passe la main à un conseiller
humain** (WhatsApp). C'est responsable et conforme à la doctrine « AI OS » de la Brand Bible.

**Audit poids — ✅ très léger.** ~5 Ko de code, sans aucune dépendance externe. Aucun
impact sur la vitesse du site.

**Audit accessibilité — 🟡 bon, à parfaire.** Le widget gère déjà le clavier (touche
*Échap* pour fermer), les rôles ARIA (`dialog`, `aria-live`) et le focus. Il manque un
**« piège de focus »** (empêcher le clavier de sortir de la fenêtre de discussion) pour
être pleinement conforme WCAG 2.1 AA.

**Corrections à apporter avant intégration (Phase 1) :**

| # | Correction | Pourquoi |
|---|---|---|
| 1 | **Renommer** « ESIG Success Assistant » → **« ESIG NOVA »** partout | Cohérence de marque (nom voulu par le projet) |
| 2 | Remplacer l'icône emoji 💬 par une **icône filaire** officielle | La Brand Bible proscrit les emojis dans le registre corporate |
| 3 | Ajouter le **piège de focus** clavier | Accessibilité WCAG 2.1 AA complète |
| 4 | Faire accepter au relais **les 6 sous-domaines** (aujourd'hui : un seul) | Le widget doit fonctionner sur tous les sites |
| 5 | Documenter la **conservation des journaux** (RGPD) | Les questions des visiteurs peuvent contenir des données personnelles |
| 6 | Déplacer le widget dans `shared/components/nova/` (composant partagé) | Une seule version, réutilisée par tous les sites |

**À prévoir avec M. Kalipé :** mettre le relais en production (adresse `https://esig.tg/api/assistant`),
y placer la **clé API côté serveur**, puis renseigner l'`endpoint` dans la configuration.
Tant que l'`endpoint` est vide, **le widget reste invisible** — c'est volontaire et sans risque.

### 2.4 Les ressources de marque

| Ressource | Disponible ? | Détail |
|---|---|---|
| **Logo (PNG)** | ✅ Oui | 3 versions : couleur, bleu, blanc (haute définition, fond transparent) + une version dans le site |
| **Logo (vectoriel .svg/.ai)** | ❌ **Non trouvé** | Aucun fichier vectoriel ESIG. **C'est le manque n°1** (voir ci-dessous) |
| **Bleu officiel** | ✅ Confirmé | **#2A4291** — *vérifié sur le logo réel* (voir Partie 5) |
| **Or secondaire** | ✅ Oui | **#B0862B** (Brand Bible) |
| **Typographies** | ✅ Définies | **Georgia** (titres) + **Calibri** (texte) — polices système, aucun chargement externe |
| **Brand Bible** | ✅ Complète | Livres I à VII (stratégie, système, identité visuelle, etc.), en Word et PDF |
| **Neutres** | ✅ Oui | Gris clair #EEF1F6, texte #1F2933, gris légende #5A6472, blanc #FFFFFF |

**Pourquoi le logo vectoriel manque et pourquoi c'est important.** La Brand Bible impose
elle-même (règle 12.3) que les **couleurs définitives soient extraites du logo vectoriel
maître**. Sans ce fichier, on ne peut pas produire proprement les **favicons** (petite
icône d'onglet), les versions « négatives » (blanc sur fond bleu) et les déclinaisons de
haute précision. **En attendant, les PNG suffisent pour démarrer** — mais il faudra
récupérer le vectoriel auprès du créateur du logo.

---

## 3. Répartition des contenus par sous-domaine

Voici **où va chaque contenu** dans le futur écosystème, et si la matière **existe déjà**
ou **reste à créer**. C'est la carte qui guidera les Phases 2 à 6.

### 🏛️ www.esig.tg — Institutionnel (« rassurer, prouver la crédibilité »)
| Contenu | État |
|---|---|
| Identité, histoire, vision | 🟡 Partiel (sur l'accueil actuel) — à étoffer |
| Gouvernance et organisation (organigramme) | 🔴 À créer *(vous avez un organigramme sur le Bureau)* |
| Agréments, certifications, reconnaissances | 🔴 À créer *(le PDF « AGREMENT ESIG » existe)* |
| Politique qualité et SMQ (rubrique Qualité, ici pour l'instant) | 🔴 À créer *(dossier « SMQ Fiches procédures » à fournir)* |
| Infrastructures et campus | 🟢 Existe (section + 20 photos campus) |
| Partenariats institutionnels | 🟡 Partiel (12 logos partenaires) |
| Chiffres clés | 🟡 Existe mais **à valider** (voir Partie 5) |
| Documents officiels (téléchargements) | 🔴 À créer |
| Contacts et accès | 🟢 Existe |

### 🎓 admission.esig.tg — Commercial & recrutement (« convertir »)
| Contenu | État |
|---|---|
| Accueil candidat + moteur de recherche des formations | 🟢 Existe |
| Catalogue BTS / Licence / Master (filtrable) | 🟢 Existe (66 fiches) |
| Fiche détaillée par formation | 🟢 Existe |
| Comparateur de formations (2-3 côte à côte) | 🔴 À créer |
| Témoignages étudiants / diplômés | 🟢 Existe (10 photos témoignages) |
| Formulaires demande d'info + préinscription | 🟢 Existe (durcis anti-spam) |
| Prise de rendez-vous conseiller | 🟡 À finaliser |

### 💼 executive.esig.tg — Formation continue (« devis entreprise »)
| Contenu | État |
|---|---|
| Formations continues & certifiantes (59 modules, 13 académies) | 🟢 Existe |
| Formation modulaire (15 filières, 4 pôles) | 🟢 Existe |
| Centre de langues (5 langues, CECRL) | 🟢 Existe |
| Cisco Networking Academy | 🟡 Fiche existe, page dédiée à créer |
| Executive Education / cadres | 🔴 À créer |
| **Formulaire de devis intra-entreprise** (outil de conversion n°1) | 🔴 À créer |
| Calendrier des sessions | 🔴 À créer |
| VAE / VAP | 🟢 Existe (section complète) |

### 🌍 international.esig.tg — Mobilité & partenariats
| Contenu | État |
|---|---|
| Universités partenaires (France, Belgique, Canada…) | 🟡 Partiel (12 images) — **liste à fournir** |
| Programmes de mobilité et démarches | 🔴 À créer |
| Poursuites d'études et doubles diplômes | 🔴 À créer |
| Admission des étudiants internationaux | 🔴 À créer |
| Bourses | 🔴 À créer |
| Témoignages de mobilité | 🟡 Partiel |
| Espace partenaires universitaires | 🔴 À créer |

### 📰 news.esig.tg — Média « ESIG News »
| Contenu | État |
|---|---|
| Accueil magazine par catégories | 🟡 Base existe (à re-mettre en forme) |
| Fil d'actualités (piloté par un simple fichier) | 🟢 Existe (3 actualités de démo) |
| Gabarit d'article (référencement presse) | 🟡 À finaliser |
| Galerie photos | 🟡 Structure existe — **dossiers photos vides** |
| Procédure « ajouter une actu » pour non-développeur | 🟢 Concept existe, à documenter |

### 🏢 entreprises.esig.tg — Stages, emplois, partenariats
| Contenu | État |
|---|---|
| Offres de stages et d'emplois | 🔴 À créer |
| Dépôt d'offres par les entreprises (formulaire) | 🔴 À créer |
| Recrutement de diplômés | 🔴 À créer |
| Projets tutorés et challenges | 🔴 À créer |
| Alternance | 🔴 À créer |
| Conventions de partenariat | 🔴 À créer |
| Incubateur et entrepreneuriat | 🔴 À créer |

> 🔵 **Lecture rapide :** 🟢 prêt · 🟡 partiel · 🔴 à créer. Le site **www**, **admission**
> et **executive** sont largement alimentés. **international** et surtout **entreprises**
> sont les sites qui demandent **le plus de contenu neuf de votre part**.

---

## 4. Les manques à combler (ce que je dois recevoir de vous)

Rien n'empêche de **démarrer la Phase 1** dès maintenant : le socle et la mise aux normes
n'ont pas besoin de ces éléments. Mais pour aller au bout des Phases 2 à 6, il me faudra :

**Priorité haute (bloquant pour certaines phases) :**
1. 🎨 **Le logo au format vectoriel** (`.svg` ou `.ai`) — auprès du créateur du logo. *(favicons + versions officielles)*
2. 📋 **La décision 145 vs 154 formations** + la liste définitive si l'on crée les 9 manquantes.
3. 🔢 **Les chiffres clés confirmés** (nombre d'étudiants, taux d'insertion + méthode,
   année de création, nombre d'entreprises partenaires, réseau alumni).
4. 🏛️ **Contenus institutionnels** pour www : organigramme, agréments, politique qualité/SMQ,
   documents officiels à mettre en téléchargement. *(Plusieurs existent déjà sur votre Bureau :
   AGREMENT, Dossier institutionnel, SMQ — à me confirmer et me transmettre.)*

**Priorité moyenne (par phase) :**
5. 🌍 **International** : liste officielle des universités partenaires (pays, logos,
   type d'accord), programmes de mobilité, bourses, doubles diplômes.
6. 🏢 **Entreprises** : ce que l'ESIG propose (stages, alternance, recrutement, incubateur),
   champs souhaités pour le formulaire de dépôt d'offre, modèle de convention.
7. 💼 **Executive** : champs souhaités pour le **formulaire de devis entreprise**,
   calendrier des sessions, descriptif Executive Education et Cisco.
8. 📸 **Photos réelles** pour la galerie et les actualités (les dossiers sont **vides**).
   *La Brand Bible impose de vraies photos ESIG, jamais d'images génériques.*

**Priorité de validation (avant mise en ligne) :**
9. ⚖️ **Validation juridique** des pages légales (mentions, confidentialité, cookies, CGU)
   par la direction / un juriste.
10. 🤖 **Mise en production du relais NOVA** par M. Kalipé (adresse + clé API serveur).

---

## 5. Points de canon à trancher — décisions attendues de vous

> Le `CLAUDE.md` est le contrat, et il verrouille l'identité de marque. Mais j'ai constaté
> que **le contrat, la Brand Bible et le logo réel ne disent pas tout à fait la même chose**
> sur certains points. **Je ne modifie jamais l'identité de marque de ma propre initiative.**
> Voici les faits et mes recommandations. **Un mot de votre part suffit pour chaque point.**

### Décision 1 — La nuance exacte du bleu

- Le `CLAUDE.md` fixe **#2A4291** (« extrait du logo maître — ne jamais approximer »).
- La Brand Bible (Livre III, ch. 12) indique **#14284B**, mais précise que cette valeur est
  **« provisoire »** et **« à figer par extraction depuis le logo vectoriel maître »**.
- **J'ai tranché par la preuve** : j'ai échantillonné les pixels du fichier
  `Logo ESIG png bleu.png`. Le bleu dominant du logo est **rgb(40, 64, 144) ≈ #284090**,
  c'est-à-dire **quasiment identique à #2A4291** (rgb 42, 66, 145) et **très différent du
  #14284B** (rgb 20, 40, 75, beaucoup plus sombre).

> ✅ **Recommandation : retenir #2A4291 comme bleu primaire** (conforme au CLAUDE.md **et**
> au logo réel). Le #14284B de la Brand Bible était une valeur d'attente. Idéalement, faites
> **acter #2A4291 par la DMC** dans une révision mineure de la Brand Bible (v1.1), pour que
> les deux documents concordent. **Décision attendue : « OK #2A4291 ».**

### Décision 2 — L'orthographe de la signature

- Le `CLAUDE.md` écrit **« BUILD YOUR FUTUR »** (sans E).
- La Brand Bible écrit **« BUILD YOUR FUTURE »** (avec E) — **16 fois**, et précise qu'elle
  ne doit **« jamais être altérée »**.

> ✅ **Recommandation : « BUILD YOUR FUTURE »** (avec E). Le « FUTUR » du CLAUDE.md est très
> probablement une coquille. **À confirmer d'un coup d'œil sur le logo/signature officiels
> détenus par la DMC.** Décision attendue : « FUTURE » ou « FUTUR ».

### Décision 3 — 145 ou 154 formations ?

- Le site : **145**. La marque : **154**. Écart : **9**.

> ✅ **Recommandation :** confirmer le **chiffre officiel**. Deux options : (a) **créer les
> 9 fiches manquantes** à partir des catalogues (je peux le faire en Phase 1), ou (b)
> **communiquer 145** et corriger « 154 » dans la Brand Bible. Décision attendue : (a) ou (b),
> et si (a), la liste des 9.

### Décision 4 — Les typographies

- La marque impose **Georgia (titres) + Calibri (texte)** — polices système, donc **aucun
  chargement externe** (ce qui colle parfaitement au CLAUDE.md « aucune dépendance CDN »).
- Le site actuel utilise **Sora + Inter** (polices web à charger).

> ✅ **Recommandation : appliquer Georgia + Calibri** (conforme à la marque **et** meilleur
> pour la performance et la conformité). Décision attendue : « OK marque » ou « garder Sora/Inter ».

### Décision 5 — Les chiffres clés

- La configuration affiche **894 étudiants** et **82 % d'insertion**, explicitement marqués
  **« À VALIDER — source non documentée »**. L'année de création est notée **2008**, mais un
  visuel du campus affiche **« 10 ans »**.

> ✅ **Recommandation :** ne **rien publier de non sourcé**. Fournissez les valeurs officielles
> (et la méthode de calcul du taux d'insertion). En attendant, je peux **masquer** les chiffres
> non confirmés. Décision attendue : valeurs officielles, ou « masquer pour l'instant ».

---

## 6. Plan de développement, phase par phase

> **Principe (rappel du CLAUDE.md) :** une phase à la fois. À la fin de chaque phase, je
> lance un **aperçu local** (une adresse de test à ouvrir dans votre navigateur), je vous
> liste **précisément quoi vérifier**, et **j'attends votre validation** avant de continuer.
> Les durées ci-dessous sont des ordres de grandeur en séances de travail, pas des engagements
> contractuels.

### Phase 1 — Le socle commun *(fondations)*
**Ce que je construis :** le « design system » (la boîte à outils graphique partagée :
couleurs #2A4291 + or, Georgia/Calibri, boutons, cartes, formulaires, grille responsive) ;
les composants réutilisables (en-tête avec navigation entre les 6 sites, pied de page,
carte formation, fil d'Ariane, moteur de recherche) ; **le fichier unique
`data/formations.json`** ; le **script d'assemblage** (pour ne jamais dupliquer le code) ;
et le **widget NOVA** refondu en composant partagé et sécurisé.
**Ce que vous verrez :** une page de démonstration (`styleguide.html`) montrant tous les
éléments visuels à la marque, à valider avant tout site.
**Dépend de :** décisions 1, 2, 4 (couleurs, signature, polices).
**Produit livré :** le socle réutilisable + la base de données unifiée + la démo visuelle.
**Ordre de grandeur :** 2–3 séances.

### Phase 2 — www.esig.tg *(institutionnel)*
**Ce que je construis :** le site vitrine sobre et crédible : accueil qui **aiguille chaque
public** vers le bon sous-domaine, identité/histoire/vision, gouvernance, agréments,
politique qualité/SMQ, campus, partenariats, chiffres clés, documents officiels, contacts.
**Ce que vous verrez :** le site institutionnel complet en aperçu local.
**Dépend de :** contenus institutionnels (manque n°4), chiffres clés (décision 5).
**Produit livré :** le premier des 6 sites, aux normes marque, SEO et accessibilité.
**Ordre de grandeur :** 2–3 séances.

### Phase 3 — admission.esig.tg *(commercial)*
**Ce que je construis :** le site de recrutement orienté conversion : catalogue filtrable,
fiches détaillées, **comparateur** de formations, témoignages, **formulaires** (demande
d'info, préinscription, rendez-vous conseiller) avec validation rigoureuse.
**Ce que vous verrez :** le parcours complet « découvrir → comparer → se préinscrire ».
**Dépend de :** `data/formations.json` (Phase 1), décision 3 (nombre de formations).
**Produit livré :** le moteur commercial de l'école. **Ordre de grandeur :** 3–4 séances.

### Phase 4 — executive.esig.tg *(formation continue)*
**Ce que je construis :** le site pro/corporate : modules certifiants, modulaire, langues,
Cisco, Executive Education, VAE/VAP, calendrier, et surtout le **formulaire de devis
entreprise** (outil de conversion principal, particulièrement soigné).
**Dépend de :** champs du devis, calendrier, descriptifs (manque n°7).
**Produit livré :** le site B2B / professionnels. **Ordre de grandeur :** 2–3 séances.

### Phase 5 — international.esig.tg + news.esig.tg
**Ce que je construis :** (A) le site international (partenaires, mobilité, doubles diplômes,
bourses, espace partenaires) ; (B) le média « ESIG News » en format magazine par catégories,
avec un **gabarit d'article** et une **procédure simple pour ajouter une actu** (éditer un
seul fichier, sans développeur).
**Dépend de :** contenus international (manque n°5) et photos (manque n°8).
**Produit livré :** 2 sites d'un coup. **Ordre de grandeur :** 3–4 séances.

### Phase 6 — entreprises.esig.tg + finalisation + déploiement
**Ce que je construis :** (1) le site entreprises (stages/emplois, dépôt d'offres,
alternance, incubateur…) ; (2) une **revue d'ensemble** des 6 sites (cohérence graphique,
liens croisés, aucune impasse, W3C, accessibilité, performance page par page) ; (3) la
**spécification de l'API** future (pour Pilote 360, Mavor, Moodle) ; (4) le **dossier de
déploiement complet pour M. Kalipé** (arborescence, sous-domaines, SSL, en-têtes de
sécurité, redirections depuis l'ancien site, relais NOVA, sitemaps) ; (5) une **synthèse
d'une page pour la Direction Générale**.
**Dépend de :** contenus entreprises (manque n°6), validations juridiques (manque n°9).
**Produit livré :** l'écosystème complet, prêt à mettre en ligne. **Ordre de grandeur :** 3–4 séances.

> 🔀 **Souplesse.** Si un contenu tarde (ex. l'international), on peut **réordonner** les
> phases sans bloquer le reste. Les sites les mieux alimentés (www, admission, executive)
> peuvent avancer en premier.

---

## 7. Prochaine étape

1. **Vous lisez ce document** (surtout Parties 1 et 5).
2. **Vous tranchez les 5 décisions** de la Partie 5 (un mot par point suffit).
3. **Vous me confirmez** ce que vous pouvez fournir tout de suite parmi les manques (Partie 4).
4. Dès votre feu vert, **je lance la Phase 1** (le socle commun) et je reviens vers vous
   avec la page de démonstration à valider.

Rien n'est mis en ligne, rien n'est modifié chez vous sans votre accord. Ce projet avance
**à votre rythme, une étape validée à la fois**.

---

*Fin de l'audit — Phase 0. Aucun code de site n'a été produit à ce stade, conformément à la consigne.*
