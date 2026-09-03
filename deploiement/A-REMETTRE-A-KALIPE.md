# À remettre à M. Kalipé — Mise en ligne de l'écosystème ESIG

Récapitulatif de tout ce qui est fourni pour déployer le site sur **Scaleway**.
Mode d'emploi détaillé : **`docs/DEPLOIEMENT_KALIPE.pdf`** (16 sections).

## 1. Le projet (le paquet)
Le dossier complet **`esig-ecosysteme`** — livré sans `node_modules`, `dist`, `.git` (régénérés au
déploiement). Il contient les sources, le moteur de build, le kit `deploiement/` et les documents.

## 2. À lire, dans l'ordre
| Fichier | Rôle |
|---|---|
| `docs/DEPLOIEMENT_KALIPE.pdf` | Mode d'emploi complet |
| `deploiement/COMMANDES.md` | Les commandes, dans l'ordre |
| `deploiement/deploy.sh` | Script de mise en ligne (build + envoi des 8 sous-domaines) |
| `deploiement/nginx-vhost.template.conf` | Modèle Nginx + redirections |
| `deploiement/esig-nova.service` · `esig-formulaires.service` | Les 2 services systemd |

## 3. Accès à prévoir (à sécuriser — jamais en clair)
- **SSH** au serveur B (Scaleway) + **admin Nginx Proxy Manager** (serveur A).
- **Compte Cloudflare** (pour corriger le DNS — *Error 1000*).

## 4. Secrets à renseigner (variables d'environnement)
- **Clé API** du modèle IA (assistant NOVA).
- **SMTP** : hôte, utilisateur, mot de passe (formulaires).
- **Token Cloudflare Web Analytics** (à créer dans le compte Cloudflare).

## 5. Ordre conseillé
1. **Corriger le DNS Cloudflare** (sinon le site reste invisible — Error 1000).
2. `./deploiement/deploy.sh` — build + envoi des fichiers sur le serveur B.
3. Déposer le dépôt sur le serveur B + activer les **services systemd** (NOVA, formulaires).
4. **Nginx** (modèle par sous-domaine) + **NPM** (SSL wildcard `*.esig.tg`).
5. **Contrôles** : HTTPS des 8 sites, formulaires (e-mail test), NOVA, document réservé en 404.

## 6. Points de vigilance
- Serveur B = **Nginx statique en HTTP, SANS SSL** (le SSL/HSTS est géré par NPM). **Aucun Caddy.**
- **Documents réservés** (agrément / certificat qualité) : **ne jamais exposer publiquement**.
- **8 sous-domaines** : `esig.tg` · `admission` · `executive` · `cooperation` · `carrieres` ·
  `alumni` · `news` · `tech` (+ redirections `international → cooperation`, `entreprises → carrieres`).

---
*Contact projet : Direction Marketing & Communication — ESIG Global Success.*
