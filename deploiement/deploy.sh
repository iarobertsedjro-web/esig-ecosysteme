#!/usr/bin/env bash
# =========================================================================
# ESIG — Déploiement du site statique sur le serveur B (Scaleway)
# -------------------------------------------------------------------------
# Génère les livrables, bascule les endpoints NOVA + formulaires en RELATIF
# (même origine), puis synchronise les 8 sous-domaines par rsync.
#
# À lancer depuis la RACINE du dépôt « esig-ecosysteme », sur une machine
# Unix (Linux / macOS / WSL) disposant de : node >= 18, rsync, ssh.
#   chmod +x deploiement/deploy.sh
#   ./deploiement/deploy.sh
# =========================================================================
set -euo pipefail

# --- À ADAPTER UNE SEULE FOIS --------------------------------------------
SSH_USER="deploy"                     # utilisateur SSH sur le serveur B
SSH_HOST="REMPLACER_IP_OU_HOTE"       # IP ou nom du serveur B (Scaleway)
WEB_ROOT="/var/www"                   # racine web sur le serveur B
# -------------------------------------------------------------------------

cd "$(dirname "$0")/.."               # se placer à la racine du dépôt

echo "==> 1/4  Génération des fiches et des pages"
node build/convertir-formations.js
node build/generer-fiches.js admission
node build/generer-fiches.js executive
node build/build.js

echo "==> 2/4  Contrôles qualité (doit être 206/206 et 0 lien cassé)"
node build/audit.js
node build/assembler.js
node build/verifier-liens.js

echo "==> 3/4  Bascule des endpoints en relatif (même origine)"
find dist -name "*.html" -exec sed -i 's|http://localhost:8787/api/assistant|/api/assistant|g' {} +
find dist -name "*.html" -exec sed -i 's|http://localhost:8788/api/formulaire|/api/formulaire|g' {} +

echo "==> 4/4  Synchronisation vers le serveur B ($SSH_HOST)"
for pair in \
  "www:esig.tg" \
  "admission:admission.esig.tg" \
  "executive:executive.esig.tg" \
  "cooperation:cooperation.esig.tg" \
  "carrieres:carrieres.esig.tg" \
  "alumni:alumni.esig.tg" \
  "news:news.esig.tg" \
  "tech:tech.esig.tg" ; do
  src="${pair%%:*}"; dom="${pair##*:}"
  echo "    - dist/$src  ->  $WEB_ROOT/$dom/"
  rsync -av --delete "dist/$src/" "${SSH_USER}@${SSH_HOST}:${WEB_ROOT}/${dom}/"
done

echo ""
echo "==> Fichiers déployés."
echo "    Rappels : (re)démarrer les services Node (systemd) et vérifier NPM (SSL)."
echo "    Contrôle documents réservés : https://esig.tg/medias/documents/agrement-esig.pdf doit renvoyer 404."
