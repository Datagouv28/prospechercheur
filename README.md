# Prospechercheur

Plateforme de recherche et de qualification d'entreprises françaises pour la prospection.
100 % navigateur, sans backend, sans clé pour la recherche. Conçue pour GitHub Pages.

## Ce que fait l'outil

- **Recherche multicritères** : activité (NAF/secteur), localisation, date de création, effectifs, catégorie, labels (ESS, RGE, bio, Qualiopi, formation…), chiffre d'affaires, dirigeant.
- **Barre intelligente** : tape ta demande en français, elle est traduite en filtres.
- **Chat IA (API Claude)** : décris ton besoin en langage naturel, l'IA choisit les critères, lance la recherche et **qualifie les prospects** dans le contexte de tes projets (Tondroit, Product Builder IA, Sceniq).
- **Score d'intention** : chaque entreprise reçoit un score 0–100 (création récente, croissance du CA, effectif, expansion, événements légaux BODACC).
- **Présets de prospection** prêts à l'emploi par projet.
- **Fiche détail** par société : identité, siège, dirigeants, finances, annonces légales BODACC, signaux d'intention.
- **Enrichissement manuel** : LinkedIn, site, téléphone, email, tags, notes — sauvegardés dans le navigateur, exportables en JSON.

## Sources de données (gratuites, publiques)

- **API Recherche d'entreprises** (recherche-entreprises.api.gouv.fr) — moteur principal.
- **BODACC** (opendatasoft) — annonces légales & signaux d'intention.
- **API Géo** (geo.api.gouv.fr) — communes, départements, régions.

Aucune clé requise pour ces sources. Le chat IA utilise ta clé API Anthropic (voir ci-dessous).

## Déploiement sur GitHub Pages

1. Crée un dépôt GitHub (ex. `prospechercheur`).
2. Ajoute le fichier `index.html` à la racine du dépôt.
3. Onglet **Settings → Pages**.
4. **Source** : branche `main`, dossier `/ (root)`. Enregistre.
5. Au bout d'1–2 min, ton site est en ligne sur `https://<ton-pseudo>.github.io/prospechercheur/`.

## Chat IA — configuration de la clé

1. Ouvre le site, clique **💬 Chat IA** puis **⚙︎**.
2. Colle ta clé API Anthropic (console.anthropic.com) et choisis le modèle.
3. **Sécurité** : la clé est stockée **uniquement dans ton navigateur** (localStorage), jamais dans le code du dépôt. Ne partage pas l'onglet une fois ta clé saisie.

> Pour un usage partagé/public sécurisé, il faudra plus tard un petit proxy serverless (Vercel/Cloudflare) qui garde la clé côté serveur. Le site n'est plus purement statique à ce moment-là.

## Enrichissements fiche détail

- **N° TVA intracommunautaire** calculé depuis le SIREN + validation VIES.
- **EORI (candidat)** + lien de vérification douanes (signal import/export).
- **Bilans & actes** : lien vers les documents déposés (INPI).

## Signal « recrutement en cours » (France Travail) — optionnel, gratuit

Le signal d'intention le plus fort (une entreprise qui recrute a un besoin immédiat).
Nécessite un petit proxy serverless gratuit (la clé France Travail ne peut pas vivre
sur GitHub Pages). Voir **BACKEND-france-travail.md** + `francetravail-proxy.js`.
Une fois déployé, renseigne l'URL du proxy dans ⚙︎ → la fiche affiche les postes ouverts.

## Limites & feuille de route (vers un Apollo/Lemlist FR)

Fait : recherche, score d'intention, signaux BODACC, qualification IA, TVA/EORI/bilans,
signal recrutement France Travail (via proxy gratuit).

Étapes suivantes :

- **Levées de fonds** : pas d'API officielle gratuite ; approximation possible par veille presse (backend).
- **Activité LinkedIn** : pas d'API publique, scraping interdit (ToS) — voie propre = enrichissement payant. Non implémenté.
- **Enrichissement contact** (emails/téléphones de décideurs) — via fournisseurs tiers payants.
- **Suivi dans le temps** (CRM léger) et alertes sur nouveaux signaux.

> Pas d'envoi de campagnes automatisées : l'outil reste une couche d'**intelligence & de données**, pas d'outreach.
