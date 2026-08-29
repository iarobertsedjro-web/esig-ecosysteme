# CLAUDE.md — Écosystème numérique ESIG Global Success

## Contexte du projet

Refonte complète de la présence web de l'ESIG Global Success, établissement privé
d'enseignement supérieur à Lomé (Togo), sous forme d'un écosystème de sites reliés
par sous-domaines. Le site actuel (une seule page dense, hébergé temporairement sur
news.esig.tg, version v1.4.0) est fourni dans `site-existant/` : il constitue la
source de contenu de référence, mais son architecture monopage est abandonnée.

Le chef de projet (Kokou, Direction Marketing & Communication) n'est pas développeur.
Le déploiement en production est assuré par M. Kalipé sur un serveur dédié Scaleway.
Toute livraison doit donc être accompagnée d'instructions de déploiement claires.

## Identité de marque — CANON VERROUILLÉ (ne jamais modifier)

- Nom officiel : **ESIG GLOBAL SUCCESS**
- Signature : **BUILD YOUR FUTUR** → utiliser exactement la graphie du logo maître fourni
- Devise : *Vestigatio Excellentiae*
- Essence de marque : « Construire des trajectoires crédibles »
- Valeurs : Compétence, Innovation, Durabilité
- Bleu officiel : **#2A4291** (extrait du logo maître — ne jamais approximer)
- Couleur secondaire : or/doré institutionnel (voir Brand Bible dans `assets-sources/`)
- Référence complète : Brand Bible ESIG OS v1.0 fournie dans `assets-sources/`
- Interdit : reproduire l'identité visuelle des sites de référence analysés
  (EPHEC, ALU, Ashesi, USIU, Harvard, INSEAD, HEC, Bristol)

## Architecture cible

Monorepo. Un dossier par site public, un socle partagé unique.

```
esig-ecosysteme/
├── shared/                  # SOCLE COMMUN — source unique de vérité
│   ├── css/                 #   design system (tokens, composants, grille)
│   ├── js/                  #   scripts communs (menu, recherche, analytics)
│   ├── components/          #   fragments HTML réutilisables (header, footer,
│   │                        #   cartes formation, CTA, widget NOVA)
│   └── img/                 #   logo, favicons, icônes
├── data/
│   ├── formations.json      # base centrale des 154 formations (2 pôles)
│   └── actualites.json      # base centrale des actualités
├── sites/
│   ├── www/                 # esig.tg — institutionnel
│   ├── admission/           # admission.esig.tg — commercial & recrutement
│   ├── executive/           # executive.esig.tg — formation continue, VAE/VAP
│   ├── international/       # international.esig.tg — mobilité & partenariats
│   ├── news/                # news.esig.tg — média « ESIG News »
│   └── entreprises/         # entreprises.esig.tg — stages, emplois, partenariats
├── docs/                    # cahier des charges, dossier de déploiement
└── build/                   # scripts d'assemblage (injection des composants
                             # partagés dans chaque site)
```

Phase ultérieure (ne pas développer sans instruction explicite) : campus.esig.tg
(portail authentifié), alumni.esig.tg, innovation.esig.tg, qualite.esig.tg
(qualite reste une rubrique de esig.tg au lancement).

## Pile technique — contraintes impératives

- **HTML statique + CSS + JavaScript vanilla.** Aucun framework front (pas de
  React/Vue), aucune dépendance CDN externe au rendu critique. Les composants
  partagés sont injectés au build (script Node.js simple ou includes générés),
  jamais dupliqués manuellement entre sites.
- **Mobile-first**, breakpoints : 360 / 768 / 1024 / 1440 px.
- **Performance** : objectif Lighthouse ≥ 90 sur les quatre axes pour chaque page
  d'accueil. Images en WebP avec fallback, `loading="lazy"`, aucune vidéo en
  lecture automatique, aucune animation décorative coûteuse.
- **Conformité W3C** : chaque page livrée doit passer le validateur HTML et CSS
  sans erreur. Vérifier avant chaque fin de phase.
- **Accessibilité WCAG 2.1 AA** : contrastes, navigation clavier, attributs ARIA,
  textes alternatifs, hiérarchie de titres stricte (un seul h1 par page).
- **Sécurité** : en-têtes CSP, X-Content-Type-Options, X-Frame-Options,
  Referrer-Policy, HSTS documentés dans le dossier de déploiement ; formulaires
  avec validation côté client ET consignes de validation serveur ; aucun secret
  ni clé API dans le code livré.
- **SEO** : balises title/description uniques par page, données structurées
  Schema.org (EducationalOrganization, Course pour les fiches formation,
  NewsArticle pour news), sitemap.xml et robots.txt par sous-domaine, URLs
  propres en français, canoniques, Open Graph.
- **Langue** : français (lang="fr"), contenu anglais uniquement si demandé.

## Base de données des formations

`data/formations.json` est l'unique source des 154 formations, structurée en
deux pôles : Pôle Parcours Académique (BTS, Licences, Masters) et Pôle Formation
Continue (modulaire, certifications, langues, Cisco Networking Academy).
Chaque formation : id, pôle, filière, niveau, durée, conditions d'admission,
compétences visées, débouchés, frais (si fournis). Les sites www, admission et
executive consomment ce fichier ; aucune fiche formation ne doit être codée en dur.

## Agent conversationnel ESIG NOVA

Le widget existant est fourni dans `widget-nova/`. L'auditer (sécurité, poids,
accessibilité), le refactorer en composant partagé (`shared/components/nova/`),
et l'intégrer sur les sites publics. La clé API ne doit JAMAIS être exposée côté
client : prévoir un point de relais serveur documenté pour M. Kalipé.

## Architecture API (préparation, pas d'implémentation serveur en phase 1)

Prévoir dans `docs/api-spec.md` la spécification d'une API centrale (formations,
actualités, préinscriptions) destinée à communiquer à terme avec ESIG Pilote 360,
Mavor et Moodle. En phase 1, les sites consomment les fichiers JSON statiques ;
la structure des JSON doit être directement transposable en réponses d'API.

## Méthode de travail

1. Travailler UNE phase à la fois, dans l'ordre défini par le chef de projet.
2. En fin de phase : lancer un serveur local, indiquer l'URL de test, lister
   précisément ce qui doit être vérifié visuellement.
3. Attendre la validation du chef de projet avant la phase suivante.
4. Expliquer chaque décision technique en termes non techniques.
5. Tenir un fichier `docs/CHANGELOG.md` (versionnage sémantique, on repart à
   v2.0.0 pour cette refonte).
6. Toute livraison pour la production = mise à jour de
   `docs/DEPLOIEMENT_KALIPE.md` : arborescence à copier, configuration des
   sous-domaines (vhosts), redirections depuis l'ancien site, en-têtes de
   sécurité, certificats SSL, tests post-déploiement.

## Ce qu'il ne faut jamais faire

- Dupliquer du code entre sites au lieu d'utiliser le socle `shared/`.
- Ajouter une bibliothèque JavaScript sans justification écrite préalable.
- Modifier le canon de marque (nom, signature, devise, #2A4291).
- Copier la structure, les textes ou le design des sites universitaires de
  référence.
- Livrer une page non validée W3C ou inaccessible au clavier.
- Exposer une clé API ou un identifiant dans le code.

