/**
 * Prospechercheur — Proxy France Travail (signal "recrutement en cours")
 * ----------------------------------------------------------------------
 * Cloudflare Worker GRATUIT. Garde ta clé France Travail côté serveur
 * (jamais exposée dans le site GitHub Pages) et expose un petit endpoint
 * que la plateforme appelle pour savoir si une entreprise recrute.
 *
 * DÉPLOIEMENT (résumé — voir BACKEND-france-travail.md pour le détail) :
 *   1. Crée une appli sur https://francetravail.io → API "Offres d'emploi v2"
 *      → récupère client_id + client_secret.
 *   2. Crée un Worker sur https://dash.cloudflare.com (gratuit, sans CB).
 *   3. Colle ce fichier comme code du Worker.
 *   4. Settings > Variables and Secrets : ajoute
 *        FT_CLIENT_ID      = ton identifiant
 *        FT_CLIENT_SECRET  = ton secret   (type "Secret")
 *        ALLOW_ORIGIN      = https://datagouv28.github.io   (recommandé)
 *   5. Déploie. Copie l'URL du Worker (ex. https://xxx.workers.dev) et
 *      colle-la dans la plateforme : ⚙︎ → "Proxy recrutement".
 *
 * Endpoint : GET /?name=<nom entreprise>&commune=<code INSEE>&departement=<dd>
 * Réponse  : { count, total_zone, offres:[{intitule,date,lieu,type,url}] }
 */

const TOKEN_URL  = "https://entreprise.francetravail.io/connexion/oauth2/access_token?realm=%2Fpartenaire";
const SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search";
const SCOPE      = "api_offresdemploiv2 o2dsoffre";

let cachedToken = null;
let cachedExp = 0;

async function getToken(env) {
  const now = Date.now();
  if (cachedToken && now < cachedExp - 30000) return cachedToken;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: env.FT_CLIENT_ID,
    client_secret: env.FT_CLIENT_SECRET,
    scope: SCOPE
  });
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!r.ok) throw new Error("auth France Travail " + r.status);
  const d = await r.json();
  cachedToken = d.access_token;
  cachedExp = now + (d.expires_in || 1400) * 1000;
  return cachedToken;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "public, max-age=3600"
  };
}

// normalise un nom d'entreprise pour le matching
function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\b(sas|sasu|sarl|sa|eurl|sci|snc|selarl|scp|group|groupe|france)\b/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default {
  async fetch(request, env) {
    const allow = env.ALLOW_ORIGIN || "*";
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allow) });
    }
    const url = new URL(request.url);
    const name = (url.searchParams.get("name") || "").trim();
    const commune = (url.searchParams.get("commune") || "").trim();
    const departement = (url.searchParams.get("departement") || "").trim();

    if (!name) {
      return new Response(JSON.stringify({ error: "param 'name' requis" }),
        { status: 400, headers: corsHeaders(allow) });
    }

    try {
      const token = await getToken(env);
      const p = new URLSearchParams();
      p.set("motsCles", name.slice(0, 60));
      if (commune) p.set("commune", commune);
      else if (departement) p.set("departement", departement);
      p.set("range", "0-49");
      p.set("sort", "1"); // tri par date décroissante

      const r = await fetch(`${SEARCH_URL}?${p.toString()}`, {
        headers: { Authorization: "Bearer " + token, Accept: "application/json" }
      });
      if (r.status === 204) {
        return new Response(JSON.stringify({ count: 0, total_zone: 0, offres: [] }),
          { headers: corsHeaders(allow) });
      }
      if (!r.ok) {
        const t = await r.text();
        return new Response(JSON.stringify({ error: "recherche " + r.status, detail: t.slice(0, 200) }),
          { status: 502, headers: corsHeaders(allow) });
      }
      const d = await r.json();
      const list = d.resultats || [];
      const target = norm(name);
      const matches = list.filter(o => {
        const en = norm(o.entreprise && o.entreprise.nom);
        if (!en || en.length < 3 || target.length < 3) return false;
        return en.includes(target) || target.includes(en);
      });
      const offres = matches.slice(0, 15).map(o => ({
        intitule: o.intitule,
        date: o.dateCreation,
        lieu: o.lieuTravail && o.lieuTravail.libelle,
        type: o.typeContratLibelle || o.typeContrat,
        url: o.origineOffre && o.origineOffre.urlOrigine
      }));
      return new Response(JSON.stringify({ count: matches.length, total_zone: list.length, offres }),
        { headers: corsHeaders(allow) });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e.message || e) }),
        { status: 500, headers: corsHeaders(allow) });
    }
  }
};
