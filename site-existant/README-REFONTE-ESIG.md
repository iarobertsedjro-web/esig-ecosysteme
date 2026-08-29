# README — Refonte du site ESIG Global Success (v1.5.0)

Site institutionnel de l'ESIG Global Success — préparé pour la migration
`news.esig.tg` → `esig.tg`. Ce document décrit l'architecture, la
configuration, les procédures et ce qui reste à valider.

---

## 1. Architecture

**Choix retenu : site statique HTML/CSS/JavaScript, sans framework ni build.**
Justification : hébergement mutualisé simple, coût nul, sécurité maximale
(pas de base de données exposée), et autonomie de l'équipe ESIG qui édite des
fichiers de données commentés. La complexité d'un CMS ou d'un framework
(Next.js…) n'est pas justifiée à ce stade ; la migration reste possible plus
tard, les contenus étant déjà structurés en données (`formations-data.js`,
`actualites-data.js`).

```
/                         Pages principales (index, admission, contact…)
/formations/              145 fiches HTML STATIQUES générées + index catalogue
/images/                  Photos (JPEG + variantes WebP générées)
/tools/                   Générateurs (fiches, sitemap, changement de domaine)
/assistant/               Agent IA : docs, prompt, base documentaire, API exemple
/docs/                    Documentation interne (CRM, prospects)
.htaccess                 Sécurité, cache, compression, redirections, 404
```

**Fichiers de données (modifiables sans développeur)**
- `config-site.js` — version, domaine, réseaux sociaux, carrousel, WhatsApp,
  GA4, chiffres clés, assistant IA.
- `formations-data.js` — les 145 formations (contenu du catalogue).
- `actualites-data.js` / `galerie-data.js` — actualités, événements, médias.

**Scripts transversaux**
- `commun.js` — accessibilité (menu, modale, focus), UTM, WhatsApp flottant,
  bannière de consentement, chargement conditionnel GA4, suivi des conversions.
- `base-commun.css` — styles transversaux (skip-link, focus, formulaires,
  consentement, assistant, recherche, profils).

## 2. Règle d'or : régénérer après modification du catalogue

Après toute modification de `formations-data.js` :

```bash
node tools/generer-fiches.js     # régénère les 145 fiches statiques
node tools/generer-sitemap.js    # régénère sitemap.xml
```

Sans cette étape, les fiches statiques et le sitemap ne reflètent plus le
catalogue. (Node.js >= 18 requis sur le poste qui exécute ces commandes.)

## 3. SEO

- Fiches formations **statiques et indexables** (`/formations/<niveau>/<nom>.html`),
  avec `title`, meta description, canonical, Open Graph, données structurées
  `Course` + `BreadcrumbList` ; index de catalogue `/formations/` (`ItemList`).
- Domaine canonique : `https://esig.tg` (partout : canonicals, sitemap,
  robots.txt, Schema.org). Pour changer :
  `node tools/changer-domaine.js https://autre-domaine.tg`.
- `sitemap.xml` : 157 URLs. `robots.txt` : ouvert, IA autorisées.
- Redirections 301 dans `.htaccess` : `index.html→/`, HTTPS forcé, anciennes
  URLs `fiche.html?f=slug` → pages statiques.
- Données structurées : `CollegeOrUniversity` (accueil, avec `sameAs` réseaux
  sociaux), `FAQPage` (admission), `ContactPage` (contact), `Course`,
  `BreadcrumbList`, `ItemList` (formations).

## 4. Accessibilité (WCAG 2.2 AA)

Lien d'évitement, `<main>` sur toutes les pages, navigation clavier complète
(menu `aria-expanded`, modale avec piège de focus + Échap + retour du focus),
carrousel avec bouton pause et respect de `prefers-reduced-motion`, focus
visible, `figure/figcaption` pour les galeries, formulaires étiquetés avec
erreurs `role="alert"`, cibles tactiles >= 44 px, `aria-current` sur les
points du carrousel, fil d'Ariane sur les fiches. Zéro gestionnaire
d'événement inline (compatibilité CSP stricte).

## 5. Performance

Valeurs réelles des chiffres clés dans le HTML (plus de « 0 » avant JS),
première image du hero rendue en HTML + `preload fetchpriority=high` (LCP),
variantes WebP générées (−27 %) avec `<picture>` + repli JPEG,
`width/height` sur les images (anti-CLS), lazy loading sous la ligne de
flottaison, cache navigateur + compression Brotli/Gzip via `.htaccess`.

## 6. Sécurité

- En-têtes `.htaccess` : CSP (sans `unsafe-inline` script), HSTS,
  `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`.
- Formulaires : honeypot antispam (`_gotcha`), consentement RGPD obligatoire,
  `autocomplete`, validation client + validation Formspree côté serveur,
  messages d'erreur accessibles. YouTube en mode `nocookie`.
- Aucun secret dans le dépôt ; `.env.example` fourni (clé API de l'assistant
  côté serveur uniquement). Fichiers internes (`.md`, CHANGELOG…) non servis.

## 7. Conversion et CRM

CTA traçables (événements `cta_preinscription`, `envoi_preinscription`,
`envoi_contact`, `clic_whatsapp`), UTM conservés et transmis dans les
formulaires (`utm_source/medium/campaign` + `page_origine`), bouton WhatsApp
flottant configurable, entrées par profil sur l'accueil (8 profils),
recherche + filtres du catalogue. Structure de fiche prospect et options de
connexion CRM : voir `docs/CRM-PROSPECTS.md`.

## 8. Mesure d'audience (GA4)

Renseigner `ANALYTICS_CONFIG.ga4_id` dans `config-site.js`. Tant qu'il est
vide : aucun traceur, aucune bannière. Une fois renseigné : bannière de
consentement (accepter/refuser), chargement de GA4 uniquement après accord,
IP anonymisées. Déclarer ensuite les 4 événements comme conversions dans GA4
et relier Google Search Console (envoyer `https://esig.tg/sitemap.xml`).

## 9. ESIG Success Assistant (agent IA)

Widget intégré sur toutes les pages, **masqué tant que
`ASSISTANT_CONFIG.endpoint` est vide** dans `config-site.js`.
Dossier `assistant/` : architecture et règles (`README-ASSISTANT.md`),
prompt système anti-invention (`prompt-systeme.md`), base documentaire
validée (`base-documentaire/`, dont `formations.json` généré automatiquement),
API de référence (`serveur-exemple.js` — Node 18, RAG simple, limitation de
débit, journalisation, transfert humain vers WhatsApp).
Règle absolue : l'assistant n'invente ni formation, ni tarif, ni date, ni
partenariat, ni garantie de visa ; à défaut d'information validée, il
propose un conseiller.

## 10. Installation et déploiement

**Local** : ouvrir `index.html` dans un navigateur (ou `npx serve .`).
**Production (Apache/cPanel)** :
1. Téléverser tout le dossier à la racine du domaine (y compris `.htaccess`
   et `/formations/`).
2. Vérifier que HTTPS est actif (certificat) — le `.htaccess` force HTTPS.
3. Tester : page d'accueil, une fiche formation, formulaire, page 404.

**Variables d'environnement** (serveur de l'assistant uniquement — voir
`.env.example`) : `CLE_API_MODELE`, `PORT`, `ORIGINE_AUTORISEE`.

## 11. Procédure de migration news.esig.tg → esig.tg

1. Déployer cette version sur l'hébergement d'`esig.tg` (les canonicals
   pointent déjà vers `https://esig.tg`).
2. Dans `.htaccess`, **décommenter le bloc « MIGRATION VERS esig.tg »** :
   redirections 301 de `www.esig.tg` et `news.esig.tg` vers `esig.tg`
   (chemins conservés).
3. Dans Google Search Console : ajouter la propriété `esig.tg`, soumettre le
   sitemap, utiliser l'outil de changement d'adresse depuis l'ancienne
   propriété.
4. Vérifier les redirections des anciennes URLs (`fiche.html?f=…`).
5. Plus tard, réserver `news.esig.tg` au futur média d'actualités : la
   section Actualités actuelle (`actualites.html` + `actualites-data.js` +
   `galerie-data.js`) est autonome et transférable telle quelle.

**Sous-domaines futurs (recommandation)** : rester en sections du site
principal tant que le besoin est éditorial (`/formations/`, `/actualites/`) ;
réserver les sous-domaines aux applications distinctes (admission.esig.tg
pour le suivi de dossiers, online.esig.tg pour l'e-learning,
support.esig.tg pour l'assistance). Éviter la multiplication : chaque
sous-domaine fragmente le référencement et la maintenance.

## 12. Checklist de recette avant mise en production

- [ ] Accueil : chiffres clés corrects, carrousel, pause, modale de
      pré-inscription (ouverture, Échap, envoi, erreur réseau).
- [ ] Envoi réel des 2 formulaires (vérifier réception sur admissions@ et
      formation@) avec consentement coché.
- [ ] 5 fiches formations au hasard (contenu, fil d'Ariane, CTA).
- [ ] Recherche du catalogue (mot-clé + filtre niveau).
- [ ] Page 404 (URL inexistante) et redirection `fiche.html?f=bts-assurance`.
- [ ] Navigation complète au clavier (Tab depuis le lien d'évitement).
- [ ] Mobile : menu, formulaires, fiches, WhatsApp.
- [ ] Lighthouse >= 90 performance, >= 95 accessibilité/SEO/bonnes pratiques.
- [ ] validator.w3.org (Nu) sur accueil + une fiche.
- [ ] Search Console : sitemap accepté, aucune erreur de couverture.
- [ ] Pages légales relues et validées par la direction.

## 13. Reste à valider par l'ESIG (aucune invention n'a été introduite)

1. **Chiffres clés** : 894 étudiants et 82 % d'insertion (repris de l'ancien
   site, sources à documenter) — `config-site.js` + bloc stats d'`index.html`.
2. **Historique** : « Depuis 2008 » (les « 18 ans » sont calculés sur cette
   base) ; distinguer origine/agrément/étapes si communication officielle.
3. **Accréditations du bandeau d'accueil** : Agrément MESR, ISO 9001:2015,
   Cisco Networking Academy, Palme Internationale 2024 — fournir références.
4. **Pages légales** : compléter les champs [entre crochets] et faire valider
   (hébergeur, RCCM, directeur de publication, juridiction).
5. **Fiches formations** : 57 fiches ont un programme détaillé ; les autres
   affichent « programme bientôt disponible » — compléter dans
   `formations-data.js` à partir des documents pédagogiques officiels.
6. **Frais et dates de rentrée** : affichés « sur demande » volontairement ;
   renseigner si la direction souhaite les publier.
7. **Assistant IA** : déployer l'API, alimenter la base documentaire avec des
   documents validés, puis renseigner l'endpoint.
