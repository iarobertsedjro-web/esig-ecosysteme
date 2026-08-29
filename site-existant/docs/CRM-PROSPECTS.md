# Suivi des prospects et préparation CRM — ESIG Global Success

## État actuel

Les formulaires du site (pré-inscription et contact) envoient les demandes par
email via **Formspree**, routées automatiquement :

| Formulaire | Motif | Destinataire |
|---|---|---|
| Pré-inscription | BTS / Licence / Master | admissions@esig.tg |
| Pré-inscription | Continue / modulaire / langues | formation@esig.tg |
| Contact | Admission, orientation | admissions@esig.tg |
| Contact | Formation continue, entreprises, VAE | formation@esig.tg |
| Contact | Partenariat, autre | admissions@esig.tg (à remplacer par contact@esig.tg) |

Chaque envoi contient désormais, en plus des champs saisis :
`utm_source`, `utm_medium`, `utm_campaign` (origine de la campagne, conservés
pendant la session de navigation) et `page_origine` (page depuis laquelle le
formulaire a été soumis), ainsi que le consentement explicite du prospect.

## Fiche prospect cible (à créer dans le CRM)

| Champ | Source |
|---|---|
| Nom / prénom | formulaire (`nom`) |
| Téléphone (WhatsApp) | formulaire (`telephone`) |
| Email | formulaire (`email`) |
| Pays / ville | à ajouter au formulaire si besoin, ou qualification téléphonique |
| Niveau actuel | qualification par le conseiller |
| Formation recherchée | formulaire (`niveau` / `motif`) |
| Année de rentrée | qualification |
| Source d'acquisition | `utm_source` / `utm_medium` |
| Campagne | `utm_campaign` |
| Page d'origine | `page_origine` |
| Statut | cycle CRM : Nouveau → Contacté → Qualifié → Dossier → Inscrit / Perdu |
| Conseiller affecté | attribution interne |
| Historique des échanges | CRM |
| Consentement | champ `consentement` = « oui » + date de soumission |
| Date de création | horodatage de l'email Formspree |

## Options de connexion CRM (par ordre de simplicité)

1. **Formspree → Google Sheets** (natif dans Formspree) : registre central
   immédiat, sans développement. Recommandé comme première étape.
2. **Formspree → Zapier/Make → CRM** (HubSpot gratuit, Brevo, EspoCRM…) :
   création automatique du prospect avec tous les champs UTM.
3. **API dédiée** (à terme, avec le sous-domaine admission.esig.tg) :
   formulaire → API sécurisée → base PostgreSQL + espace candidat.

## Suivi des conversions (une fois GA4 activé dans config-site.js)

Événements déjà émis par le site : `cta_preinscription`, `envoi_preinscription`,
`envoi_contact`, `clic_whatsapp`. À déclarer comme conversions dans GA4.
