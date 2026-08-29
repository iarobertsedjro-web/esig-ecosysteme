# ESIG NOVA — Assistant conversationnel (composant partagé)

Ce dossier contient **tout** l'assistant NOVA de l'écosystème ESIG.
Il est **partagé** : un seul code, réutilisé par les 6 sites.

## Fichiers
| Fichier | Rôle | S'exécute où |
|---|---|---|
| `nova.js` | Le widget (bouton + fenêtre de discussion) | Navigateur du visiteur |
| `nova.css` | L'apparence du widget (aux couleurs de la marque) | Navigateur |
| `prompt-systeme.md` | Les consignes données à l'IA (règles anti-invention) | Serveur |
| `serveur-relais.js` | Le **relais** entre le widget et l'IA | Serveur de l'ESIG |
| `base-documentaire/` | Les données que l'IA a le droit d'utiliser (formations…) | Serveur |

## Le principe de sécurité (essentiel)

```
Visiteur → nova.js → RELAIS ESIG (serveur-relais.js) → API du modèle d'IA
                         ▲
                  la clé secrète vit ICI, sur le serveur, jamais dans la page
```

**La clé API de l'IA n'est jamais dans le site.** Le widget parle uniquement au
relais de l'ESIG. C'est le relais, sur le serveur, qui détient la clé (dans une
variable d'environnement) et parle à l'IA. Un visiteur ne peut donc jamais voir
ni voler la clé.

## Activer / désactiver le widget

Le widget **reste invisible** tant que l'adresse du relais n'est pas renseignée.
Dans la configuration du site (`ESIG_CONFIG` / `NOVA_CONFIG`) :

```js
window.NOVA_CONFIG = {
  endpoint: "",   // vide = widget masqué ; "https://esig.tg/api/assistant" = actif
  nom: "ESIG NOVA",
  accroche: "Une question sur nos formations, l'admission ou la VAE ? Je vous oriente.",
  whatsapp: "+22893033351"
};
```

## Mise en production (pour M. Kalipé)

1. **Copier** `data/formations.json` (et tout autre document validé) dans
   `base-documentaire/` — c'est la connaissance autorisée de l'assistant.
2. **Définir la clé API** en variable d'environnement (jamais dans un fichier
   versionné) :
   ```bash
   CLE_API_MODELE=sk-ant-xxxxx  node shared/components/nova/serveur-relais.js
   ```
3. **Placer le relais derrière le serveur web** (reverse proxy) pour qu'il
   réponde sur `https://esig.tg/api/assistant` en HTTPS.
4. **Vérifier les origines autorisées** : la variable `ORIGINES_AUTORISEES`
   liste les 7 sous-domaines. Ajuster si besoin.
5. **Renseigner `endpoint`** dans la configuration des sites → le widget apparaît.

### Notes d'exploitation
- **Modèle** : `claude-haiku-4-5` par défaut (rapide et économique) — modifiable
  via la variable `MODELE`.
- **Débit** : 12 requêtes / minute / adresse IP (protection anti-abus simple).
- **RGPD / journaux** : le relais fourni ne journalise pas les questions par
  défaut. Si vous activez une journalisation, informez les visiteurs, limitez la
  durée de conservation et évitez d'y stocker des données personnelles.
- **RAG** : la recherche documentaire est volontairement simple (mots-clés).
  Elle pourra être remplacée par une recherche sémantique (embeddings) plus tard,
  sans changer le contrat d'API.

## Le contrat d'API (pour l'interconnexion future)
Requête : `POST /api/assistant` → `{ messages: [{role, content}], page }`
Réponse : `{ reponse: string, transfert_humain: boolean, sources: string[] }`
