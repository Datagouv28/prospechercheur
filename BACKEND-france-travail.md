# Signal « recrutement en cours » — proxy France Travail (gratuit)

Ce guide active le signal d'intention **le plus fort** : savoir si une entreprise
**recrute actuellement**. Tout est gratuit, sans carte bancaire.

Pourquoi un backend ? L'API France Travail exige une clé secrète et bloque les
appels directs depuis le navigateur (CORS). On met donc un tout petit serveur
(Cloudflare Worker) entre la plateforme et France Travail : **ta clé reste cachée
sur le serveur**, jamais dans le site public.

```
Plateforme (GitHub Pages)  →  ton Worker Cloudflare (garde la clé)  →  API France Travail
```

---

## Étape 1 — Clé France Travail (gratuit, ~10 min)

1. Va sur **https://francetravail.io** et crée un compte.
2. Crée une application, puis abonne-la à l'API **« Offres d'emploi v2 »**.
3. Récupère ton **Identifiant client** (`client_id`) et ta **Clé secrète** (`client_secret`).

> L'accès est gratuit. La validation de l'abonnement à l'API peut prendre un court délai.

## Étape 2 — Créer le Worker Cloudflare (gratuit, sans CB)

1. Crée un compte sur **https://dash.cloudflare.com** (plan gratuit, pas de carte).
2. Menu **Workers & Pages** → **Create** → **Create Worker**.
3. Donne-lui un nom (ex. `prospechercheur-ft`) → **Deploy**.
4. Clique **Edit code**, efface le code d'exemple, et colle **tout le contenu de
   `francetravail-proxy.js`**. Puis **Deploy**.

## Étape 3 — Renseigner la clé (variables)

Dans ton Worker → **Settings** → **Variables and Secrets**, ajoute :

| Nom | Valeur | Type |
|---|---|---|
| `FT_CLIENT_ID` | ton identifiant client | Text |
| `FT_CLIENT_SECRET` | ta clé secrète | **Secret** |
| `ALLOW_ORIGIN` | `https://datagouv28.github.io` | Text |

Puis **Deploy** à nouveau.

## Étape 4 — Connecter la plateforme

1. Copie l'URL de ton Worker (ex. `https://prospechercheur-ft.toncompte.workers.dev`).
2. Ouvre la plateforme → **⚙︎** → champ **« Proxy recrutement — France Travail »** →
   colle l'URL → **Enregistrer**.

C'est tout. Ouvre la fiche d'une entreprise : la section **« 🔥 Signaux chauds —
recrutement »** affichera les postes ouverts détectés.

---

## Comment ça marche / limites

- Le Worker cherche les offres France Travail par **nom d'entreprise + commune**,
  puis filtre celles dont le nom correspond. C'est **indicatif** : une PME qui
  recrute via France Travail sera détectée ; une boîte qui ne passe que par
  LinkedIn/cooptation ne le sera pas.
- Résultats mis en cache 1 h côté Worker.
- Coût : **0 €**. Cloudflare gratuit = 100 000 requêtes/jour ; France Travail = gratuit.
- Sécurité : ta clé vit **uniquement** dans les variables du Worker, jamais dans
  le site GitHub ni dans ton navigateur.

## Les deux autres signaux (pour info)

- **Levée de fonds** : pas d'API officielle gratuite fiable. Possible plus tard via
  une recherche d'actualités sur le même Worker (fiabilité moyenne).
- **Activité LinkedIn** : pas d'API publique ; le scraping est interdit par LinkedIn
  (risque ToS/juridique). La voie propre = un fournisseur d'enrichissement payant.
  Non implémenté volontairement.
