#!/usr/bin/env node
/* =========================================================================
   build/convertir-formations.js
   -------------------------------------------------------------------------
   Transforme la base héritée du site v1.5.0 (FORMATIONS_DATA + LANGUES_DATA,
   dans site-existant/formations-data.js) en UNE source de vérité unique et
   plate : data/formations.json.

   Ce fichier JSON est ensuite consommé par les sites www, admission, executive
   et par l'assistant NOVA. Sa structure est directement transposable en API
   (voir docs/api-spec.md, phase 6).

   Usage :  node build/convertir-formations.js
   ========================================================================= */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RACINE = path.join(__dirname, '..');
const SRC = path.join(RACINE, 'site-existant', 'formations-data.js');
const SORTIE = path.join(RACINE, 'data', 'formations.json');
const DOSSIER_FICHES = path.join(RACINE, 'site-existant', 'formations');

/* ----- 1. Charger les objets hérités dans un bac à sable ----- */
const src = fs.readFileSync(SRC, 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + '\nthis.__F = FORMATIONS_DATA; this.__L = LANGUES_DATA;', ctx);
const FORMATIONS_DATA = ctx.__F;
const LANGUES_DATA = ctx.__L;

/* ----- 2. Correspondances niveau -> pôle / dossier / libellé ----- */
const NIVEAUX = {
  bts:       { pole: 'academique', dossier: 'bts',       prefixe: 'bts-',       niveau: 'BTS' },
  licence:   { pole: 'academique', dossier: 'licence',   prefixe: 'licence-',   niveau: 'Licence' },
  master:    { pole: 'academique', dossier: 'master',    prefixe: 'master-',    niveau: 'Master' },
  continue:  { pole: 'continue',   dossier: 'continue',  prefixe: 'continue-',  niveau: 'Continue' },
  modulaire: { pole: 'continue',   dossier: 'modulaire', prefixe: 'modulaire-', niveau: 'Modulaire' }
};

/* ----- 3. Utilitaires ----- */
function nettoyer(v) {
  if (Array.isArray(v)) return v.map(nettoyer).filter(x => x !== undefined && x !== '');
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'string') { const t = v.trim(); return t === '' ? undefined : t; }
  return v;
}
function nomFichier(slug, prefixe) {
  return slug.startsWith(prefixe) ? slug.slice(prefixe.length) : slug;
}
function ficheExiste(dossier, fichier) {
  return fs.existsSync(path.join(DOSSIER_FICHES, dossier, fichier + '.html'));
}

/* ----- 4. Conversion ----- */
const formations = [];
const avertissements = [];

// 4a. Formations standard (BTS, Licence, Master, Continue, Modulaire)
for (const niveauId of Object.keys(FORMATIONS_DATA)) {
  const meta = NIVEAUX[niveauId];
  if (!meta) { avertissements.push('Niveau inconnu ignoré : ' + niveauId); continue; }
  const bloc = FORMATIONS_DATA[niveauId];

  for (const domaine of (bloc.domaines || [])) {
    for (const spec of (domaine.specialites || [])) {
      const fichier = nomFichier(spec.slug, meta.prefixe);
      const dossier = meta.dossier;
      // URL relative à la racine du site (résolue selon le sous-domaine).
      const url = `formations/${dossier}/${fichier}.html`;
      if (!ficheExiste(dossier, fichier)) {
        avertissements.push(`Fiche introuvable pour ${spec.slug} -> ${dossier}/${fichier}.html`);
      }
      const f = {
        id: spec.slug,
        pole: meta.pole,
        niveau: meta.niveau,
        niveau_label: bloc.label,
        domaine: domaine.nom,
        mention: nettoyer(spec.mention),
        intitule: spec.titre,
        slug: spec.slug,
        url,
        duree: nettoyer(spec.duree) || bloc.duree,
        resume: nettoyer(spec.competences),
        presentation: nettoyer(spec.presentation),
        competences: nettoyer(spec.competences_detail),
        programme: nettoyer(spec.programme),
        debouches: nettoyer(spec.debouches),
        poursuite: nettoyer(spec.poursuite),
        admission: nettoyer(spec.admission)
      };
      // Regroupement contextuel : académie (continue) / pôle (modulaire)
      if (niveauId === 'continue') f.academie = domaine.nom;
      if (niveauId === 'modulaire') f.pole_modulaire = domaine.nom;
      // Retirer les champs vides
      for (const k of Object.keys(f)) if (f[k] === undefined) delete f[k];
      formations.push(f);
    }
  }
}

// 4b. Langues (structure distincte)
for (const item of (LANGUES_DATA.items || [])) {
  const fichier = nomFichier(item.slug, 'langue-');
  const url = `formations/langues/${fichier}.html`;
  if (!ficheExiste('langues', fichier)) {
    avertissements.push(`Fiche langue introuvable : langues/${fichier}.html`);
  }
  formations.push({
    id: item.slug,
    pole: 'continue',
    niveau: 'Langue',
    niveau_label: LANGUES_DATA.label,
    domaine: 'Langues & Certifications internationales',
    intitule: item.langue,
    slug: item.slug,
    url,
    tag: nettoyer(item.tag),
    certification: nettoyer(item.certif),
    niveau_cecrl: nettoyer(item.niveau),
    description: nettoyer(item.desc)
  });
}

/* ----- 5. Écriture ----- */
const parNiveau = {};
formations.forEach(f => { parNiveau[f.niveau] = (parNiveau[f.niveau] || 0) + 1; });
const parPole = {};
formations.forEach(f => { parPole[f.pole] = (parPole[f.pole] || 0) + 1; });

const sortie = {
  meta: {
    version: '2.0.0',
    genere_le: new Date().toISOString().slice(0, 10),
    source: 'site-existant/formations-data.js (v1.5.0)',
    note: 'Source de vérité unique — ne pas éditer à la main. Régénérer via build/convertir-formations.js.',
    total: formations.length,
    par_pole: parPole,
    par_niveau: parNiveau
  },
  formations
};

fs.writeFileSync(SORTIE, JSON.stringify(sortie, null, 2), 'utf8');

/* ----- 6. Rapport ----- */
console.log('data/formations.json généré.');
console.log('  Total :', formations.length);
console.log('  Par pôle :', JSON.stringify(parPole));
console.log('  Par niveau :', JSON.stringify(parNiveau));
if (avertissements.length) {
  console.log('\n  ⚠ Avertissements (' + avertissements.length + ') :');
  avertissements.forEach(a => console.log('   - ' + a));
} else {
  console.log('  ✓ Toutes les fiches HTML correspondantes existent.');
}
