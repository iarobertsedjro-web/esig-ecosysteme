# Outils de construction (`build/`)

Deux scripts, aucune dépendance externe (Node ≥ 18).

## 1. Assembler les pages — `build.js`

**À quoi ça sert :** ne jamais écrire deux fois le même code. L'en-tête et le
pied de page communs (dossier `shared/components/`) sont injectés
automatiquement dans chaque page de chaque site.

**Une seule commande :**
```bash
node build/build.js
```

**Comment ça marche :**
1. On écrit les pages avec l'extension **`.src.html`**.
2. Là où l'on veut un fragment partagé, on place un repère :
   ```html
   <!--#inclure:header-->
   ...contenu de la page...
   <!--#inclure:footer-->
   ```
3. `node build/build.js` transforme chaque `page.src.html` en `page.html`,
   fragments injectés et jetons remplacés.

**Jetons :** `{{ANNEE}}` devient l'année courante. Une page peut définir ses
propres jetons (navigation, boutons…) via un bloc en tête de fichier :
```html
<!--esig-config
{ "NAV": "<li><a href=\"/\">Accueil</a></li>", "CTA_URL": "/admission.html", "CTA_LIBELLE": "Préinscription" }
-->
```
Traiter un dossier précis : `node build/build.js sites/www`.

## 2. Régénérer la base des formations — `convertir-formations.js`

**À quoi ça sert :** produire la source de vérité unique
`data/formations.json` (les 145 formations) à partir du site hérité.

```bash
node build/convertir-formations.js
```
Le script vérifie au passage que chaque formation possède bien sa fiche HTML.
À relancer uniquement si l'on modifie la base héritée `site-existant/formations-data.js`.

---
### Ordre habituel après une modification
```bash
node build/convertir-formations.js   # si les formations ont changé
node build/build.js                  # réassemble toutes les pages
```
