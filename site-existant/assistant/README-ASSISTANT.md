# ESIG Success Assistant — Architecture et règles

## Vue d'ensemble

```
Visiteur ──> assistant.js (widget, sur toutes les pages)
                 │  POST JSON { messages, page }
                 ▼
        API ESIG  /api/assistant        ← seul endroit où vit la clé d'API
                 │  1. filtre et journalise la demande
                 │  2. recherche dans la base documentaire (RAG)
                 │  3. appelle le modèle (Claude API) avec le prompt système
                 │  4. décide d'un éventuel transfert humain
                 ▼
        Réponse JSON { reponse, transfert_humain, sources }
```

Le widget est déjà intégré au site et reste **masqué tant que
`ASSISTANT_CONFIG.endpoint` est vide** dans `config-site.js`.

## Fonctions spécialisées (routage d'intentions)

| Intention | Sources | Transfert humain |
|---|---|---|
| Orientation | formations.json, pages catalogue | admissions@esig.tg |
| Admission | admission.html, procédure officielle | admissions@esig.tg |
| Formation continue | catalogue continue/modulaire | formation@esig.tg |
| VAE / VAP | dispositif VAE validé | formation@esig.tg |
| International | accords de partenariat validés | contact@esig.tg |
| Carrière / débouchés | fiches formations | — |
| Vie étudiante | pages campus | — |
| Entreprises | offre intra, devis | formation@esig.tg |
| Support | FAQ, contact | contact@esig.tg |

## Règles absolues (anti-invention)

L'assistant NE DOIT JAMAIS inventer : une formation, un diplôme, un tarif,
une date de rentrée, un partenariat, une accréditation, une décision
d'admission, une garantie de visa, ou une condition pédagogique.

Implémentation :
1. **RAG strict** : la réponse ne peut s'appuyer que sur les documents du
   dossier `base-documentaire/` (documents institutionnels validés).
2. **Aveu d'ignorance** : si l'information n'est pas dans les sources, la
   réponse type est : « Je ne dispose pas de cette information validée.
   Je peux vous mettre en relation avec un conseiller. » et le champ
   `transfert_humain: true` est renvoyé.
3. **Tarifs et visas** : toujours répondre « sur devis / auprès du service
   des admissions », jamais un montant ; jamais de promesse de visa.
4. **Journalisation** : chaque échange (horodatage, question, réponse,
   sources utilisées, transfert) est journalisé côté serveur pour audit,
   sans données personnelles inutiles.

Le prompt système complet est dans `prompt-systeme.md`.

## Base documentaire (`base-documentaire/`)

- `formations.json` — généré automatiquement par `tools/generer-fiches.js`
  à partir du catalogue officiel. Ne pas éditer à la main.
- Y déposer uniquement des documents **validés par la direction** :
  procédure d'admission, grille VAE/VAP, accords de partenariat, FAQ
  officielle, calendrier académique. Formats recommandés : Markdown ou JSON.
- Tout document retiré du dossier disparaît des réponses de l'assistant.

## Sécurité

- La clé d'API du modèle est une **variable d'environnement serveur**
  (`CLE_API_MODELE` — voir `.env.example` à la racine). Jamais dans le
  code du site, jamais dans un dépôt.
- Limiter le débit (ex. 10 requêtes/minute/IP) et la taille des messages
  (500 caractères, déjà appliqué côté widget).
- Valider et échapper toute entrée ; n'accepter que `POST` en JSON depuis
  le domaine du site (CORS restreint à `SITE_URL`).

## Mise en service (résumé)

1. Déployer une petite API (Node/Express, Cloudflare Workers ou équivalent)
   exposant `POST /api/assistant` selon le contrat ci-dessus.
2. Y charger `base-documentaire/` et le prompt système.
3. Renseigner `ASSISTANT_CONFIG.endpoint` dans `config-site.js`.
4. Tester les 9 intentions + les cas « information inconnue ».
