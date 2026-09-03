# Mise en ligne sur Scaleway — commandes prêtes à copier

Kit d'accompagnement pour M. Kalipé. Le détail explicatif complet est dans
`docs/DEPLOIEMENT_KALIPE.pdf`. Ici : les commandes, dans l'ordre.

Architecture : **serveur A = Nginx Proxy Manager** (SSL + routage) → **serveur B = Scaleway**
(Nginx statique HTTP + 2 services Node). 8 sous-domaines :
`esig.tg` · `admission` · `executive` · `cooperation` · `carrieres` · `alumni` · `news` · `tech`.

---

## 0. DNS (une fois)
Faire pointer vers le NPM (serveur A) : les **8 sous-domaines** + `international.esig.tg` et
`entreprises.esig.tg` (pour les redirections 301).

## 1. Déployer les fichiers (depuis le dépôt, machine Unix/WSL)
Éditer les 3 variables en tête de `deploiement/deploy.sh` (SSH_USER, SSH_HOST, WEB_ROOT), puis :
```bash
chmod +x deploiement/deploy.sh
./deploiement/deploy.sh
```
Le script génère les livrables, contrôle (206/206 · 0 lien cassé), bascule les endpoints en
relatif, et synchronise les 8 sous-domaines dans `/var/www/<sous-domaine>/`.

## 2. Déposer le dépôt sur le serveur B (pour les 2 services Node)
Les services Node tournent depuis le dépôt (ex. `/opt/esig-ecosysteme`) :
```bash
sudo mkdir -p /opt/esig-ecosysteme
sudo rsync -a --exclude dist --exclude .git ./ deploy@SERVEUR_B:/opt/esig-ecosysteme/
# Base documentaire de NOVA :
ssh deploy@SERVEUR_B "cp /opt/esig-ecosysteme/data/formations.json /opt/esig-ecosysteme/shared/components/nova/base-documentaire/"
# Dépendance e-mail (facultatif mais recommandé) :
ssh deploy@SERVEUR_B "cd /opt/esig-ecosysteme && npm install nodemailer"
```

## 3. Nginx sur le serveur B (HTTP, sans SSL)
Décliner `deploiement/nginx-vhost.template.conf` en **un vhost par sous-domaine**
(adapter `server_name` + `root`). Ce fichier contient déjà les redirections 301
`international → cooperation` et `entreprises → carrieres`.
```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 4. Services Node (systemd)
Copier les deux unités, y renseigner la **clé API** (NOVA) et le **mot de passe SMTP** (formulaires) :
```bash
sudo cp deploiement/esig-nova.service        /etc/systemd/system/
sudo cp deploiement/esig-formulaires.service /etc/systemd/system/
sudo nano /etc/systemd/system/esig-nova.service          # CLE_API_MODELE=...
sudo nano /etc/systemd/system/esig-formulaires.service   # SMTP_MDP=...
sudo systemctl daemon-reload
sudo systemctl enable --now esig-nova esig-formulaires
sudo systemctl status esig-nova esig-formulaires
```

## 5. SSL + routage via NPM (serveur A)
Pour chaque sous-domaine : **Proxy Host** → IP locale du serveur B, port 80, *Host* conservé,
*Block Common Exploits* activé. Onglet **SSL** → Let's Encrypt + **Force SSL + HTTP/2 + HSTS**.
Un certificat **wildcard `*.esig.tg`** couvre tout en une fois.

## 5 bis. Web analytics — Cloudflare Web Analytics (sans cookie, RGPD)
Le beacon est déjà intégré au pied de page partagé (donc sur les 8 sous-domaines) et la CSP
l'autorise déjà. Il ne reste qu'à renseigner le **token** :
1. Cloudflare → **Analytics & Logs → Web Analytics → Add a site** (hostname `esig.tg`).
2. Copier le **token** fourni (chaîne dans `data-cf-beacon`).
3. Le coller dans `shared/components/footer.html` à la place de `CF_BEACON_TOKEN_A_REMPLACER`
   (une seule fois → propagé partout au build).
4. Relancer le déploiement : `./deploiement/deploy.sh`.
> Sans cookie ni bandeau supplémentaire. La CSP autorise `static.cloudflareinsights.com`
> (script) et `cloudflareinsights.com` (envoi). Le beacon est **retiré automatiquement** de la
> préviz Netlify (les stats ne concernent que la production).

## 6. Contrôles après mise en ligne
```bash
# Documents réservés : doit renvoyer 404
curl -I https://esig.tg/medias/documents/agrement-esig.pdf
# Services locaux à l'écoute
ssh deploy@SERVEUR_B "ss -ltnp | grep -E '8787|8788'"
```
- Les **8 sous-domaines** répondent en HTTPS (cadenas, redirection HTTP→HTTPS).
- Diaporamas des accueils qui défilent ; images OK.
- **Formulaires** : un envoi test arrive par e-mail (admissions@ / formation@ / contact@).
- **NOVA** répond (ou widget masqué si non activé).
- Redirections : `international.esig.tg` → cooperation, `entreprises.esig.tg` → carrieres.
- `sitemap.xml` + `robots.txt` accessibles ; en-têtes de sécurité présents (securityheaders.com).

---

## Mises à jour ultérieures
Il suffit de relancer `./deploiement/deploy.sh` (re-génère + re-synchronise). Pour un changement
de contenu Node (NOVA/formulaires), refaire l'étape 2 puis `sudo systemctl restart esig-nova esig-formulaires`.
