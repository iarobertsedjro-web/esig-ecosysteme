# Service de traitement des formulaires — ESIG

Reçoit les envois des formulaires du site (préinscription, devis, contact, demande de document,
dépôt d'offre, candidature internationale, rendez-vous, demande d'information) et les **transmet par
e-mail** au bon service. Même principe de sécurité que le relais NOVA.

## Fonctionnement

```
Formulaire (data-formulaire="…")  ──POST /api/formulaire──▶  serveur-formulaires.js  ──▶  e-mail (SMTP)
        shared/js/formulaires.js        (JSON, même origine)                              └▶ repli fichier si SMTP indispo
```

- **Client** : `shared/js/formulaires.js` branche tout `<form data-formulaire="…" data-confirmation="…">` :
  validation, anti-spam (pot de miel `_gotcha`), envoi JSON, message de confirmation, gestion d'échec.
- **Serveur** : `serveur-formulaires.js` (Node pur ; `nodemailer` requis pour l'e-mail).

## Démarrage

```bash
# 1. (pour l'e-mail) installer nodemailer une fois
npm install nodemailer

# 2. lancer le service avec la configuration SMTP en variables d'environnement
SMTP_HOTE=smtp.esig.tg SMTP_PORT=587 SMTP_USER=site@esig.tg SMTP_MDP=*** EXPEDITEUR=site@esig.tg \
  node shared/components/formulaires/serveur-formulaires.js
```

À mettre en **service systemd** sur le serveur B, écoutant sur `127.0.0.1:8788`, exposé en
**même origine** via Nginx (`location = /api/formulaire`, voir `docs/DEPLOIEMENT_KALIPE.md` §5 et §8).

Sans SMTP configuré, le service **tourne quand même** et enregistre chaque demande dans
`_boite-reception/<type>.jsonl` (repli, pour ne rien perdre) — pratique pour tester.

## Variables d'environnement

| Variable | Rôle | Défaut |
|---|---|---|
| `PORT_FORMULAIRES` | Port d'écoute | `8788` |
| `SMTP_HOTE` / `SMTP_PORT` | Serveur SMTP | — / `587` |
| `SMTP_SECURISE` | TLS direct (`1`/`true`) | `false` (STARTTLS) |
| `SMTP_USER` / `SMTP_MDP` | Identifiants SMTP (**secrets**) | — |
| `EXPEDITEUR` | Adresse « De : » | `site@esig.tg` |
| `DESTINATAIRE_DEFAUT` | Repli si type inconnu | `contact@esig.tg` |
| `ORIGINES_AUTORISEES` | Liste blanche d'origines | 6 sous-domaines + local |
| `DOSSIER_REPLI` | Dossier de repli fichier | `_boite-reception/` |

**Aucun secret dans le code** : tout vient de l'environnement.

## Acheminement par type de formulaire

| Type (`data-formulaire`) | Destinataire |
|---|---|
| `preinscription`, `demande-info`, `rendez-vous`, `candidature-internationale` | `admissions@esig.tg` |
| `devis` | `formation@esig.tg` |
| `depot-offre`, `demande-document`, `contact` | `contact@esig.tg` |

(Modifiable dans `serveur-formulaires.js`, objet `DESTINATAIRES`.)

## Sécurité & RGPD

- **Pot de miel** (`_gotcha`) : les envois de robots sont ignorés (client et serveur).
- **Limitation de débit** : 6 envois / 10 min / IP (chaîne `X-Forwarded-For`, comme NOVA).
- **Taille de requête plafonnée** (50 Ko).
- **Consentement RGPD** : chaque formulaire a une case obligatoire ; l'état est transmis.
- **Repli fichier** : `_boite-reception/` contient des **données personnelles**. Le préfixe `_` fait
  qu'il est **exclu du déploiement** (`assembler.js` retire tout dossier `_*`). Le service tournant
  depuis l'arborescence source (et non la racine web), ce dossier n'est **pas** exposé. Le sécuriser
  (droits d'accès) et le **purger** régulièrement ; privilégier l'e-mail dès que le SMTP est en place.

## Côté développement

En local, les pages pointent vers `http://localhost:8788/api/formulaire` (via `window.FORM_CONFIG`).
Au déploiement, remplacer par l'endpoint **relatif** `/api/formulaire` (voir `DEPLOIEMENT_KALIPE.md` §3).
