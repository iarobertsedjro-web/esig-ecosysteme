# Correctif de sécurité D8 — retrait des fichiers serveur du site publié

**Date :** 29 août 2026 · **Décision :** D8, validée par la Direction générale · **Environnement visé :** préproduction `new-esig.netlify.app`

## Contexte

L'audit ESIG NOVA (phase 0) a constaté que des fichiers **serveur** étaient servis
publiquement par la préproduction, car les scripts d'assemblage copiaient
`shared/` intégralement dans le dossier publié.

Nuance importante (décision D8) : la publication du prompt et du code facilite
l'analyse du système, mais **leur secret ne constitue jamais une barrière de
sécurité**. Les contrôles essentiels (validation des entrées, CORS, limitation
de débit, permissions) sont et resteront appliqués côté serveur, indépendamment
de la connaissance du prompt.

## Dossiers concernés

| Rôle | Chemin |
|---|---|
| Sources (intactes) | `shared/components/nova/`, `shared/components/formulaires/` |
| Assemblage préproduction (déployé sur new-esig.netlify.app) | `dist-staging/` — produit par `build/assembler-staging.js` |
| Assemblage production par sous-domaine (non déployé) | `dist/` — produit par `build/assembler.js` |

## URL exposées retirées (constat vérifié en direct, HTTP 200 avant correctif)

1. `/shared/components/nova/prompt-systeme.md`
2. `/shared/components/nova/serveur-relais.js`
3. `/shared/components/nova/README-NOVA.md`
4. `/shared/components/nova/base-documentaire/formations.json` (copie privée du relais)
5. `/shared/components/formulaires/serveur-formulaires.js`
6. `/shared/components/formulaires/README-FORMULAIRES.md`

**Restent publics, délibérément :** `/shared/components/nova/nova.js`,
`/shared/components/nova/nova.css` (assets d'exécution du widget) et
`/data/formations.json` (consommé par les pages publiques — recherche et
comparateur de formations ; contenu exclusivement destiné au public).
La future base RAG privée de NOVA ne sera jamais placée dans un dossier publié.

## Modifications apportées

- `build/assembler-staging.js` : liste `FICHIERS_SERVEUR` supprimée du dossier
  de sortie après copie de `shared/`.
- `build/assembler.js` : même exclusion pour chacun des 8 paquets de `dist/`.
- Retrait chirurgical des 6 fichiers dans les artefacts existants
  (`dist-staging/`, `dist/`) sans reconstruction complète, afin que le
  déploiement corresponde strictement au correctif.
- **Aucun fichier source supprimé.**

## Procédure de retour arrière

1. **Netlify (immédiat)** : Deploys du site `new-esig` → sélectionner le
   déploiement précédent → « Publish deploy ». Chaque déploiement est conservé
   et republiable en un clic.
2. **Local** : le commit git précédant le correctif (`main`, commit « État
   initial du dépôt esig-ecosysteme avant correctif D8 ») restitue les scripts
   d'assemblage d'origine : `git revert <commit du correctif>` puis
   `node build/build.js && node build/assembler-staging.js` pour reconstruire
   un artefact identique à l'ancien.

## Vérifications post-déploiement (à reproduire après chaque futur déploiement)

- Les 6 URL ci-dessus renvoient **404**.
- `/`, `/admission/`, `/shared/components/nova/nova.js`,
  `/shared/components/nova/nova.css`, `/data/formations.json` renvoient **200**.
- Le widget NOVA s'affiche toujours (comportement dégradé « indisponible »
  inchangé tant que le backend n'existe pas — c'est l'objet des phases suivantes).
