# Journal des versions — Écosystème numérique ESIG

Format : `MAJEUR.MINEUR.CORRECTIF`. La refonte en écosystème repart à **v2.0.0**.
Les versions `alpha` correspondent aux phases de construction (avant mise en ligne).

---

## v2.2.0 — 11 août 2026
### Réorganisé — portail à 8 espaces

Réorganisation de l'écosystème pour une navigation homogène et évolutive, autour de **8 espaces** :
Institution · Admissions · Formation continue · **Coopération & Relations internationales** ·
**Carrières & Insertion professionnelle** · **Alumni** · ESIG Tech · ESIG News.

- **Coopération & Relations internationales** (`cooperation.esig.tg`) — remplace et élargit
  « International » : partenaires & institutions, conventions, mobilité & doubles diplômes, page
  **Projets & coopération** et formulaire **« Devenir partenaire »** (nouvelles pages).
- **Carrières & Insertion professionnelle** (`carrieres.esig.tg`) — absorbe « Entreprises » et
  l'élargit : accueil-pont étudiants/diplômés/entreprises, **Offres** (liste filtrable éditable),
  **Accompagnement & employabilité**, **Entreprises partenaires**, **Espace recruteurs** (dépôt d'offre).
- **Alumni** (`alumni.esig.tg`) — nouveau : réseau des diplômés, **Portraits**, **Réseau & mentorat**,
  **Événements**, formulaire **« Rejoindre / mettre à jour mon profil »**.
- **Socle** : bandeau écosystème = **sélecteur des 8 espaces** (en-tête + pied de page mis à jour) ;
  assembleurs, service de formulaires (2 nouveaux types : `devenir-partenaire`, `rejoindre-alumni`) et
  relais NOVA étendus aux nouveaux sous-domaines.
- **Données** : `data/offres-carrieres.json`, `data/portraits-alumni.json` ; scripts
  `carrieres-offres.js`, `alumni-portraits.js`.
- **Redirections** : `international.esig.tg` → `cooperation.esig.tg` ; `entreprises.esig.tg` →
  `carrieres.esig.tg` (301, cf. dossier de déploiement §12.1).
- Audit : **206/206 pages conformes**, 0 lien interne cassé.

---

## v2.1.0 — 2 août 2026
### Ajouté — tech.esig.tg (ESIG TECH)

**Nouveau sous-domaine** : plateforme éditoriale de l'écosystème technologique de l'ESIG (12 pages),
intégrée au bandeau écosystème et à la charte, avec une couche visuelle « tech immersive »
(`shared/css/tech.css`).
- **Rubriques** : accueil, innovations &amp; projets (galerie filtrable + fiches riches — problématique,
  solution, technologies, équipe, encadreur, avancement, besoins/partenariat), filières technologiques
  (formations tech filtrées), Tech Club, actualités tech (reliées à ESIG News), émissions &amp; podcasts
  (vignette → YouTube, sans iframe), concours/hackathons/événements (agenda), laboratoires &amp; équipements,
  partenaires technologiques, proposer un projet (formulaire branché au service d'envoi).
- **Données administrables** : `data/projets-tech.json`, `actualites-tech.json`, `emissions-tech.json`,
  `evenements-tech.json`, `laboratoires-tech.json`, `partenaires-tech.json`.
- **Scripts** : `projets-tech.js` (galerie + fiche + partage social), `emissions-tech.js`, `tech-listes.js` ;
  réutilisation de `recherche-formations.js` (filtre `data-mots-cles`), `agenda.js`, `actualites.js`, `formulaires.js`.
- **SEO / socle** : `sitemap.xml` + `robots.txt` tech, bandeau écosystème + assembleurs (`dist/tech`) mis à jour.
- Audit : **196/196 pages conformes**, 0 lien interne cassé.

---

## v2.0.0 — 23 juillet 2026
### Phase 6 & livraison — écosystème complet

**Ajouté — entreprises.esig.tg**
- **Accueil** (`index.html`) : recruter des diplômés, stages, alternance, projets tutorés &amp;
  challenges, formation intra (lien executive), conventions de partenariat, incubateur &amp; entrepreneuriat.
- **Déposer une offre** (`deposer-offre.html`) : formulaire entreprise (stage/emploi/alternance).

**Finalisation de l'écosystème**
- **Revue d'ensemble** : `build/audit.js` contrôle les 6 sites — **180/180 pages conformes**
  (doctype, `lang="fr"`, un seul `<h1>`, `alt` sur les images, aucun jeton ni repère résiduel).
  Cohérence graphique et liens croisés assurés par le socle partagé (bandeau écosystème + pied de page).
- **Paquets de déploiement** : `build/assembler.js` produit `dist/<site>/` autonomes (pages + shared +
  data + medias) prêts à copier à la racine de chaque sous-domaine.
- **`docs/api-spec.md`** : spécification de l'API centrale (formations, actualités, préinscriptions,
  NOVA) pour l'interconnexion future avec ESIG Pilote 360, Mavor et Moodle.
- **`docs/DEPLOIEMENT_KALIPE.md`** : build, déploiement Nginx des 6 sous-domaines, SSL Let's Encrypt,
  en-têtes de sécurité (CSP, HSTS…), relais NOVA, redirections 301, tests post-déploiement.
- **`docs/SYNTHESE-DG.md`** : synthèse de livraison d'une page.

**Bilan v2.0.0** : 6 sites publics, **145 fiches formation** générées (66 + 79), média ESIG News
piloté par JSON, assistant NOVA sécurisé, design system à la marque (#2A4291 / or / Georgia+Calibri),
accessibilité et SEO sur l'ensemble. Contenus 100 % réels ; éléments non fournis signalés sans invention.

---

## v2.0.0-alpha.9 — 23 juillet 2026
### Phase 5 — international.esig.tg + news.esig.tg

**Ajouté — international.esig.tg**
- **Accueil** (`index.html`) : héros, universités partenaires, aiguillage (mobilité / étudiants
  internationaux / bourses), présence internationale (ARES, HELdB), témoignage.
- **Universités partenaires** (`partenaires.html`) : 6 universités + coopération ARES en images.
- **Mobilité** (`mobilite.html`) : démarches en 4 étapes, doubles diplômes, bourses &amp; appels,
  semaines internationales.
- **Étudiants internationaux** (`etudiants-internationaux.html`) : démarche + formulaire de candidature.

**Ajouté — news.esig.tg (« ESIG News »)**
- **Magazine** (`index.html`) piloté par `data/actualites.json` : vignettes triées par date, filtre
  par catégorie (avec liens directs `?cat=…`).
- **Gabarit d'article** (`article.html?slug=…`) : rendu dynamique + **Schema.org NewsArticle** injecté.
- Moteur partagé `shared/js/actualites.js` ; base `data/actualites.json` (3 actualités réelles).
- **Procédure pour non-développeur** (`sites/news/COMMENT-AJOUTER-UNE-ACTU.md`) : ajouter une actualité
  en éditant **uniquement le JSON**, sans reconstruction.

**Vérifié (navigateur)** : international (4 pages, liens 200, bandeau actif, 6 logos, formulaire) ;
news (magazine : 3 actus + filtre catégorie ; article : titre dynamique, 1 `<h1>`, NewsArticle, image) ;
0 image sans `alt`, aucune erreur console.

**4 sites publics sur 6 sont désormais complets** ; il reste entreprises.esig.tg (Phase 6).

---

## v2.0.0-alpha.8 — 22 juillet 2026
### Phase 4 (fin) — executive.esig.tg complet

**Ajouté** — les 6 pages dédiées :
- **Centre de langues** (`langues.html`) : tableau des 5 langues (certification + niveau CECRL) et fiches liées.
- **VAE / VAP** (`vae-vap.html`) : définitions VAE/VAP, les 4 étapes, publics et bénéfices.
- **Cisco Networking Academy** (`cisco.html`) : programme réseaux, préparation CCNA, lien vers la fiche.
- **Executive Education** (`executive-education.html`) : programmes cadres/dirigeants, sur mesure via devis.
- **Calendrier des sessions** (`calendrier.html`) : principe des sessions inter/intra ; dates précises sur demande.
- **Modalités d'inscription et de paiement** (`modalites.html`) : étapes d'inscription, tarifs sur devis,
  prise en charge entreprise.
- Accueil relié aux nouvelles pages (« en savoir plus » + section « Aller plus loin ») ; navigation
  Langues et VAE/VAP pointant désormais vers leurs pages. `sitemap.xml` : 88 URLs.

**Vérifié (navigateur)** : page Langues (5 langues, 5 fiches liées en 200, nav active), les 6 pages
accessibles (200) depuis l'accueil, 1 `<h1>` par page, 0 image sans `alt`, aucune erreur console.

**Le site executive.esig.tg est complet** : 9 pages + 79 fiches. Contenus réels ; les seuls éléments
« sur demande » (dates de sessions, tarifs) sont signalés comme tels, sans invention.

---

## v2.0.0-alpha.7 — 22 juillet 2026
### Phase 4 (cœur) — Site formation continue executive.esig.tg

**Ajouté**
- **Accueil executive** (`sites/executive/index.html`, ton corporate) : héros, recherche des 79 formations
  continues, les **13 académies**, le **centre de langues** (5 langues / CECRL), la **VAE/VAP** (4 étapes),
  l'appel au devis entreprise et les contacts formation continue.
- **Catalogue** (`catalogue.html`) : recherche/filtres sur les 79 formations (continue, modulaire, langues).
- **79 fiches formation** générées (`build/generer-fiches.js executive`) : continue (59), modulaire (15),
  langues (5), avec Schema.org Course. Les fiches de **langues** ont un rendu dédié (présentation,
  certification, niveau CECRL).
- **Formulaire de devis entreprise** (`devis.html`) — outil de conversion principal : identité entreprise,
  contact, besoin (type, thématique, participants, format, période), validation client + anti-spam.
- `robots.txt` + `sitemap.xml` (82 URLs).

**Amélioré (générateur de fiches)**
- Fiches désormais **adaptées au site** : le CTA est « Préinscription » sur admission et
  « Demander un devis » sur executive ; badge de pôle et infos (certification, CECRL) adaptés.

**Vérifié (navigateur)** : accueil (79 formations, 13 académies, 5 langues, 4 étapes VAE), fiche de langue
(sections dédiées + CTA devis), fiche continue (liens en 200, badge continu), formulaire de devis
fonctionnel, liens actifs corrects, 1 `<h1>` par page, aucune erreur console.

**Reste — Phase 4 (suite)** : pages dédiées Centre de langues, Cisco Networking Academy, Executive
Education (cadres/dirigeants), VAE/VAP (page complète), calendrier des sessions, modalités d'inscription/paiement.

---

## v2.0.0-alpha.6 — 22 juillet 2026
### Phase 3 (fin) — admission.esig.tg complet + documents officiels intégrés

**Ajouté (admission)**
- **Admission & inscription** (`admission.html`) : les 5 étapes réelles, le tableau des niveaux
  requis (BTS/Licence/Master), les 6 pièces à fournir, l'encart VAE/VAP, et un **formulaire de
  demande d'information**.
- **Comparateur de formations** (`comparateur.html` + `shared/js/comparateur.js`) : 2 à 3 formations
  côte à côte (niveau, domaine, mention, durée, compétences, débouchés + lien fiche), en vanilla JS.
- **Prise de rendez-vous** (`rendez-vous.html`) : formulaire dédié (date, créneau, canal) + contacts directs.
- Navigation admission enrichie : Nos formations · Admission · Comparer · Rendez-vous · Contact.

**Intégré (www) — documents fournis par la direction**
- **Agrément de l'ESIG** et **Certificat de qualité 2026** (PDF) déposés dans `medias/documents/`,
  désormais **téléchargeables** depuis les pages Documents officiels et Agréments.

**Vérifié (navigateur)** : comparateur fonctionnel (tableau 2-3 formations, liens fiches), page Admission
(5 étapes, niveaux, 6 pièces, formulaire), rendez-vous (formulaire), PDF téléchargeables (200),
liens actifs corrects, 1 `<h1>` par page, 0 image sans `alt`, aucune erreur console.

**Le site admission.esig.tg est complet** : accueil, catalogue, 66 fiches, admission, comparateur,
rendez-vous, préinscription + demande d'info + RDV.

---

## v2.0.0-alpha.5 — 22 juillet 2026
### Phase 3 (cœur) — Site commercial admission.esig.tg

**Ajouté**
- **Accueil candidat** (`sites/admission/index.html`) : héros, moteur de recherche des 66 formations
  académiques, « pourquoi l'ESIG », témoignages réels, **formulaire de préinscription** (validation
  client + anti-spam + message de succès), et contacts.
- **Catalogue** (`catalogue.html`) : recherche/filtres (niveau, domaine) sur les BTS, Licences et Masters.
- **66 fiches formation statiques** générées (`build/generer-fiches.js`) dans `formations/{bts,licence,master}/` :
  fil d'Ariane, sections Présentation / Compétences / Programme / Débouchés / Admission, encadré « En bref »,
  CTA permanent, et **données structurées Schema.org Course** (SEO).
- `robots.txt` + `sitemap.xml` (68 URLs : accueil + catalogue + 66 fiches).

**Infrastructure (socle)**
- **Jeton `{{BASE}}`** dans l'en-tête/pied de page : les liens partagés fonctionnent à toute profondeur
  (les fiches sont à 2 niveaux). `{{LEGAL}}` : les pages légales sont hébergées une seule fois sur esig.tg.
- `data/formations.json` : URLs de fiches passées en **relatif** + champ **présentation** ajouté.
- `commun.js` : le marquage du lien actif ignore désormais les ancres.

**Vérifié (navigateur)**
- Accueil : 66 formations, filtres BTS/Licence/Master, préinscription fonctionnelle, bandeau « Admission » actif.
- Fiche : Schema Course présent, 5 sections, **tous les liens internes en 200** (retour catalogue/accueil OK),
  1 `<h1>`, 0 image sans `alt`, aucune erreur console.

**Reste — Phase 3 (suite)** : page « Admission & inscription » (étapes, pièces, VAE/VAP),
comparateur de formations (2-3 côte à côte), formulaires dédiés (demande d'info, prise de rendez-vous).

---

## v2.0.0-alpha.4 — 22 juillet 2026
### Phase 2 (fin) — Site institutionnel www.esig.tg complet

**Ajouté** — les 5 dernières pages internes :
- **Identité, histoire et vision** (`identite.html`) : fondation 2008, vision, mission (4 engagements),
  essence, valeurs, signature et devise (Brand Bible).
- **Infrastructures et campus** (`campus.html`) : galerie des 10 photos légendées + localisation.
- **Partenariats institutionnels** (`partenariats.html`) : 6 universités partenaires + coopération ARES.
- **Documents officiels** (`documents.html`) : tableau des documents de référence (statuts réels,
  sans faux fichiers).
- **Contacts et accès** (`contact.html`) : coordonnées réelles par service, réseaux, et **formulaire
  de contact** (validation client + anti-spam ; traitement serveur à brancher au déploiement).

**Amélioré (maintenabilité)**
- **Navigation centralisée** : `build.js` charge un `site.config.json` par site (navigation, CTA…)
  — la nav n'est plus répétée dans chaque page. Les 8 pages existantes ont été allégées d'autant.
- **Lien de navigation actif** marqué automatiquement (`commun.js`), sans dupliquer d'attribut par page.
- Nav responsive ajustée pour 7 rubriques.

**Vérifié (navigateur)** : 13 pages, 1 `<h1>` chacune, tous les liens internes en 200 (aucune impasse),
lien actif correct (nav + bandeau écosystème), formulaire de contact fonctionnel, 0 image sans `alt`,
aucune erreur console. `sitemap.xml` complété (pages légales en noindex).

**Le site institutionnel www.esig.tg est complet** (10 rubriques + 4 pages légales).

---

## v2.0.0-alpha.3 — 22 juillet 2026
### Phase 2B — Site institutionnel www.esig.tg : pages internes (documents intégrés)

**Ajouté** — pages construites à partir des documents institutionnels réels (sans rien inventer) :
- **Gouvernance et organisation** (`gouvernance.html`) : instances (CA, Direction Générale,
  Secrétariat Général) et **les 7 directions** (DG, SG, DP, DFCL, DCP, DFC, DFS), d'après la
  cartographie des processus de l'ESIG.
- **Politique qualité et SMQ** (`qualite.html`) : démarche ISO 9001 et **cartographie des processus**
  (stratégiques, métiers, supports) reprise du document officiel.
- **Agréments, certifications et reconnaissances** (`agrements.html`) : agrément MESR, ISO 9001:2015,
  Cisco, Palme Internationale 2024, et **liste des Masters agréés** par domaine (document d'agrément).
- **Pages légales** (modèles à valider) : `mentions-legales.html` (éditeur ESIG, hébergeur Scaleway,
  propriété intellectuelle), `confidentialite.html`, `cookies.html`, `accessibilite.html`.

**Corrigé**
- Pied de page : liens légaux passés en relatif (plus d'impasse : les 4 pages renvoient désormais 200).
- Navigation harmonisée sur tout le site www (Accueil · Gouvernance · Qualité · Agréments · Contact).
- `sitemap.xml` enrichi ; pages légales en `noindex`.

**Vérifié (navigateur)** : 8 pages, 1 `<h1>` chacune, 0 image sans `alt`, tous les liens internes
en 200, aucune erreur console.

**Reste à faire (Phase 2 www)** : pages dédiées Identité, Campus, Partenariats, Documents officiels,
Contact (contenus partiellement disponibles ; voir `docs/CONTENU-A-FOURNIR-WWW.md`).

---

## v2.0.0-alpha.2 — 22 juillet 2026
### Phase 2A — Site institutionnel www.esig.tg : accueil + gabarit

**Ajouté**
- **Accueil institutionnel** `sites/www/index.html` (assemblé depuis `index.src.html`) :
  héros avec voile navy, bande d'agréments (MESR, ISO 9001:2015, Cisco, Palme Internationale 2024),
  chiffres clés, « qui sommes-nous » (essence, promesse et valeurs de la Brand Bible),
  **aiguillage des publics** vers les 6 sous-domaines, aperçu campus, partenaires (6 universités),
  présence internationale, contacts réels, appel à l'action, widget NOVA.
- **Nouveaux composants du socle** (`composants.css`) : `.hero` (bannière + voile), `.carte-lien`
  (carte cliquable), `.bande-labels` et `.grille-logos` (preuves et partenaires).
- **Dossier médias partagé** `medias/` : photos réelles (hero, campus, partenaires, international,
  témoignages) importées du site v1.5.0.
- **SEO** : Schema.org `CollegeOrUniversity`, métadonnées et Open Graph, `robots.txt`, `sitemap.xml`.
- `build.js` : les chemins relatifs sont désormais résolus depuis la racine du projet.
- **Contenus institutionnels manquants** listés dans `docs/CONTENU-A-FOURNIR-WWW.md`.

**Vérifié (navigateur)**
- Un seul `<h1>`, 0 image sans `alt`, 0 ID en double, 0 saut de niveau de titre, 0 lien vide,
  `lang="fr"`, données structurées présentes ; aucune erreur console ; médias servis en 200.
- Aiguillage : 6 cartes pointant vers admission/executive/international/news/entreprises/contact.

**À suivre — Phase 2B** : pages internes dédiées (identité, gouvernance, agréments, qualité/SMQ,
campus, partenariats, chiffres, documents, contact), en attente des contenus à fournir.

---

## v2.0.0-alpha.1 — 22 juillet 2026
### Phase 1 — Socle commun (design system + composants + données)

**Ajouté**
- **Design system** (`shared/css/`), aligné sur la Brand Bible et les décisions du 22/07/2026 :
  - `tokens.css` : couleurs de marque (Bleu Marine **#2A4291**, Or **#B0862B**), neutres,
    typographies **Georgia + Calibri** (polices système, aucun CDN), espacements, rayons,
    ombres, points de rupture 360/768/1024/1440.
  - `base.css` : réinitialisation légère, styles des éléments, focus visible, lien d'évitement.
  - `layout.css` : conteneurs, grille responsive mobile-first, sections, utilitaires.
  - `composants.css` : boutons, badges, cartes, formulaires (avec états d'erreur et pot de
    miel anti-spam), tableaux, alertes, fil d'Ariane, en-tête, **bandeau écosystème**,
    pied de page, bloc d'appel à l'action, moteur de recherche, bouton WhatsApp flottant.
  - `esig.css` : point d'entrée unique.
- **Composants partagés** (`shared/components/`) : `header.html` (avec navigation
  inter-sites vers les 6 sous-domaines) et `footer.html` institutionnel.
- **Base de données unique** `data/formations.json` : **145 formations** (66 académiques,
  79 continues), source de vérité unique, générée depuis le site v1.5.0 par
  `build/convertir-formations.js`. Structure directement transposable en API.
- **JavaScript partagé** (`shared/js/`) : `commun.js` (menu mobile accessible, année
  automatique, bouton WhatsApp) et `recherche-formations.js` (recherche/filtres côté client).
- **ESIG NOVA refondu** (`shared/components/nova/`) : widget renommé, icône filaire (plus
  d'emoji), **piège de focus clavier**, relais serveur multi-origines (les 6 sous-domaines),
  clé API strictement côté serveur, base documentaire, prompt anti-invention, README de
  déploiement.
- **Script d'assemblage** `build/build.js` : injecte les fragments partagés dans les pages
  (`<!--#inclure:header-->`) — aucune duplication de code entre sites.
- **Page de démonstration** `styleguide.html` : présente tous les composants + une recherche
  en direct sur les 145 formations.

**Vérifié**
- Recherche : 145 formations chargées, filtres niveau (6) et domaine (25) fonctionnels.
- Accessibilité : un seul `<h1>`, images avec `alt`, champs avec `label`, pas d'ID en double,
  hiérarchie de titres sans saut, `lang="fr"`.
- Contrastes WCAG AA : corps 14,8:1 · liens/boutons 9,2:1 · bouton or 5,1:1 · kickers 5,0:1.
- Typographies : Georgia (titres) + Calibri (texte) effectivement appliquées.
- NOVA : aller-retour widget → relais → recherche documentaire → réponse (statut 200),
  clé API absente = repli sécurisé vers un conseiller (aucune invention).
- Aucune erreur console.

**Décisions appliquées** (voir `docs/DECISIONS.md`)
- Bleu #2A4291 · Signature « BUILD YOUR FUTURE » · 145 formations · Georgia+Calibri.

---

## v2.0.0-alpha.0 — 22 juillet 2026
### Phase 0 — Audit de démarrage
- Audit complet du matériel fourni (`docs/AUDIT.md`).
- Mise en place de l'arborescence du monorepo et import des sources (`site-existant/`,
  `assets-sources/`).
- Registre des décisions de marque (`docs/DECISIONS.md`).
