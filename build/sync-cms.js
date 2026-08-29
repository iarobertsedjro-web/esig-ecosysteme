#!/usr/bin/env node
/* =========================================================================
   build/sync-cms.js — Synchronisation CMS → données du site (MODÈLE)
   -------------------------------------------------------------------------
   RÔLE : récupérer le contenu saisi dans le CMS (actualités, agenda…) et
   écrire les fichiers data/*.json que consomment les sites statiques. Après
   la synchro, on régénère le site normalement :
         node build/sync-cms.js          (met à jour data/*.json)
         node build/build.js             (assemble les pages)
         node build/generer-fiches.js …  (si besoin)
         node build/assembler.js         (produit dist/)

   ⚠ MODÈLE À ACTIVER : ce script est prêt mais volontairement inerte tant que
   le CMS n'est pas installé. Il ne fait rien de destructif sans configuration.
   Une fois le CMS en place (voir docs/CMS-SPEC.md et docs/CMS-MODELE-CONTENU.md) :
     1. renseigner les variables d'environnement CMS_URL et CMS_TOKEN ;
     2. vérifier les noms de collections/champs ci-dessous (section COLLECTIONS) ;
     3. lancer d'abord en test :  node build/sync-cms.js --dry-run

   SÉCURITÉ : aucune clé n'est écrite dans le code. Le jeton d'accès vient de
   l'environnement (CMS_TOKEN) — jamais du dépôt, jamais d'un fichier public.

   Hypothèse d'API : Directus (REST). Pour PocketBase ou un autre outil,
   seules les fonctions lireCollection() et les « mapper » sont à adapter.

   Usage :
     node build/sync-cms.js [--dry-run] [--medias]
       --dry-run : récupère et affiche un aperçu SANS rien écrire.
       --medias  : télécharge aussi les images dans medias/ (sinon on garde le
                   chemin fourni tel quel).
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const AVEC_MEDIAS = ARGS.includes('--medias');

const CMS_URL = (process.env.CMS_URL || '').replace(/\/+$/, '');   // ex. https://cms.esig.tg
const CMS_TOKEN = process.env.CMS_TOKEN || '';                     // jeton d'accès (jamais dans le code)

/* =========================================================================
   COLLECTIONS — la correspondance CMS ⇄ fichiers du site.
   Adaptez « cms » (nom de la collection) et les « mapper » (noms des champs)
   à ce qui aura été créé dans le CMS. La structure de sortie, elle, ne doit
   PAS changer : elle est attendue telle quelle par shared/js/*.js.
   ========================================================================= */
const COLLECTIONS = [
  {
    cms: 'actualites',
    fichier: 'data/actualites.json',
    cle: 'actualites',
    tri: '-date',              // plus récent d'abord
    dossierMedias: 'medias/actualites',
    mapper: function (it) {
      return nettoyer({
        slug: it.slug,
        date: it.date,
        date_texte: it.date_texte,
        categorie: it.categorie,
        titre: it.titre,
        resume: it.resume,
        contenu: enParagraphes(it.contenu),
        image: it.image,       // résolu plus bas si --medias
        lieu: it.lieu || ''
      });
    }
  },
  {
    cms: 'evenements',
    fichier: 'data/agenda.json',
    cle: 'evenements',
    tri: 'date',               // chronologique
    dossierMedias: 'medias/actualites',
    mapper: function (it) {
      return nettoyer({
        slug: it.slug,
        date: it.date,
        date_fin: it.date_fin,
        heure: it.heure,
        date_texte: it.date_texte,
        categorie: it.categorie,
        titre: it.titre,
        resume: it.resume,
        lieu: it.lieu,
        lien: it.lien,
        lien_libelle: it.lien_libelle,
        image: it.image
      });
    }
  }
];

/* ----- Petits utilitaires ------------------------------------------- */
// Retire les champs vides/indéfinis pour un JSON propre.
function nettoyer(obj) {
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}

// « contenu » peut arriver comme tableau (repeater) ou texte à découper en
// paragraphes sur les lignes vides.
function enParagraphes(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (typeof v === 'string') {
    return v.split(/\n\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
  }
  return [];
}

function log() { console.log.apply(console, arguments); }

// Écriture atomique : fichier temporaire puis renommage.
function ecrireJSON(cheminAbs, donnees) {
  const tmp = cheminAbs + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(donnees, null, 2) + '\n', 'utf8');
  fs.renameSync(tmp, cheminAbs);
}

// Conserve le bloc « meta » (catégories, note) du fichier existant.
function metaExistante(cheminAbs, cle) {
  try {
    const actuel = JSON.parse(fs.readFileSync(cheminAbs, 'utf8'));
    if (actuel && actuel.meta) return actuel.meta;
  } catch (e) { /* fichier absent ou illisible : on repart d'un meta minimal */ }
  return { version: '1.0.0', note: 'Contenu synchronisé depuis le CMS (' + cle + ').' };
}

/* ----- Accès au CMS (Directus REST) --------------------------------- */
async function lireCollection(nom, tri) {
  const url = CMS_URL + '/items/' + encodeURIComponent(nom) +
    '?limit=-1&fields=*' +
    '&filter[statut][_eq]=publie' +          // ne publier que les entrées « publié »
    (tri ? '&sort=' + encodeURIComponent(tri) : '');
  const rep = await fetch(url, { headers: { Authorization: 'Bearer ' + CMS_TOKEN } });
  if (!rep.ok) {
    const corps = await rep.text().catch(function () { return ''; });
    throw new Error('CMS ' + rep.status + ' sur « ' + nom + ' » : ' + corps.slice(0, 300));
  }
  const data = await rep.json();
  return (data && data.data) ? data.data : [];  // Directus renvoie { data: [...] }
}

// Téléchargement optionnel d'une image du CMS vers medias/.
async function rapatrierImage(image, dossierRel, slug) {
  if (!image || !AVEC_MEDIAS) return image;
  // Cas Directus : « image » peut être un id de fichier → /assets/<id>
  const estId = typeof image === 'string' && !image.startsWith('/') && !/^https?:/.test(image);
  const urlSrc = estId ? (CMS_URL + '/assets/' + image) : image;
  try {
    const rep = await fetch(urlSrc, { headers: { Authorization: 'Bearer ' + CMS_TOKEN } });
    if (!rep.ok) throw new Error('HTTP ' + rep.status);
    const type = rep.headers.get('content-type') || '';
    const ext = type.includes('png') ? '.png' : type.includes('webp') ? '.webp' : '.jpg';
    const nom = (slug || ('media-' + image)).replace(/[^a-z0-9\-_]/gi, '-') + ext;
    const destRel = path.join(dossierRel, nom);
    const destAbs = path.join(RACINE, destRel);
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    const buf = Buffer.from(await rep.arrayBuffer());
    fs.writeFileSync(destAbs, buf);
    return '/' + destRel.split(path.sep).join('/');
  } catch (e) {
    log('    ⚠ image non rapatriée (' + urlSrc + ') : ' + e.message + ' — chemin conservé tel quel');
    return image;
  }
}

/* ----- Programme principal ------------------------------------------ */
async function main() {
  if (typeof fetch !== 'function') {
    console.error('Node ≥ 18 requis (fonction fetch native).');
    process.exit(1);
  }
  if (!CMS_URL || !CMS_TOKEN) {
    console.error('\n⚠ Configuration manquante. Ce script attend deux variables d\'environnement :');
    console.error('    CMS_URL   = adresse du CMS (ex. https://cms.esig.tg)');
    console.error('    CMS_TOKEN = jeton d\'accès en lecture (jamais dans le code)');
    console.error('\nExemples :');
    console.error('  Windows PowerShell :  $env:CMS_URL="https://cms.esig.tg"; $env:CMS_TOKEN="…"; node build/sync-cms.js --dry-run');
    console.error('  Linux / macOS      :  CMS_URL=https://cms.esig.tg CMS_TOKEN=… node build/sync-cms.js --dry-run');
    console.error('\nTant que le CMS n\'est pas installé, c\'est normal : voir docs/CMS-SPEC.md.\n');
    process.exit(1);
  }

  log('Synchronisation CMS → data/  (' + CMS_URL + ')' + (DRY_RUN ? '  [aperçu, aucune écriture]' : ''));

  for (const col of COLLECTIONS) {
    const cheminAbs = path.join(RACINE, col.fichier);
    try {
      const bruts = await lireCollection(col.cms, col.tri);
      const items = [];
      for (const it of bruts) {
        const m = col.mapper(it);
        if (m.image) m.image = await rapatrierImage(m.image, col.dossierMedias, m.slug);
        items.push(m);
      }
      log('  • ' + col.cms + ' → ' + col.fichier + ' : ' + items.length + ' entrée(s)');
      if (DRY_RUN) {
        items.slice(0, 3).forEach(function (x) { log('      - ' + (x.date || '') + '  ' + (x.titre || '')); });
        continue;
      }
      const sortie = { meta: metaExistante(cheminAbs, col.cle) };
      sortie.meta.synchronise_le = new Date().toISOString().slice(0, 10);
      sortie[col.cle] = items;
      ecrireJSON(cheminAbs, sortie);
      log('    ✓ écrit');
    } catch (e) {
      console.error('  ✗ ' + col.cms + ' : ' + e.message);
      process.exitCode = 1;   // on signale l'échec sans interrompre les autres collections
    }
  }

  if (!DRY_RUN) log('\nTerminé. Régénérez ensuite le site : node build/build.js && node build/assembler.js');
}

main().catch(function (e) { console.error(e); process.exit(1); });
