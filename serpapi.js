// serpapi.js — Obtiene precios reales de Google Shopping
// Docs: https://serpapi.com/google-shopping-api

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const TIENDAS_PRIORITARIAS = [
  "amazon",
  "mediamarkt",
  "pccomponentes",
  "elcorteingles",
  "fnac",
  "zalando",
  "decathlon",
  "zara",
  "ebay",
  "carrefour",
];

export async function getShoppingResults(query) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY no configurada");

  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", "google_shopping");
  url.searchParams.set("q", query);
  url.searchParams.set("gl", "es");          // País: España
  url.searchParams.set("hl", "es");          // Idioma: español
  url.searchParams.set("google_domain", "google.es");
  url.searchParams.set("num", "20");         // Más resultados para filtrar mejor
  url.searchParams.set("api_key", SERPAPI_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

  const data = await res.json();
  const items = data.shopping_results || [];

  if (!items.length) return [];

  // Normalizar y priorizar tiendas conocidas
  const normalized = items.map((item) => {
    const source = (item.source || "").toLowerCase();
    const esPrioritaria = TIENDAS_PRIORITARIAS.some((t) => source.includes(t));

    return {
      tienda: item.source || "Desconocida",
      precio: parsePrecio(item.price),
      precio_original: parsePrecio(item.old_price),
      disponible: true, // SerpAPI solo muestra productos disponibles
      url: item.product_link || item.link || null,
      imagen: item.thumbnail || null,
      rating: item.rating || null,
      reseñas: item.reviews || null,
      envio: item.delivery || null,
      _prioritaria: esPrioritaria,
    };
  });

  // Ordenar: prioritarias primero, luego por precio
  const prioritarias = normalized
    .filter((r) => r._prioritaria && r.precio !== null)
    .sort((a, b) => a.precio - b.precio);

  const otras = normalized
    .filter((r) => !r._prioritaria && r.precio !== null)
    .sort((a, b) => a.precio - b.precio);

  // Devolver máx 6 resultados: primero las tiendas conocidas
  const resultado = [...prioritarias, ...otras].slice(0, 6);

  return resultado.map(({ _prioritaria, ...r }) => r);
}

function parsePrecio(str) {
  if (!str) return null;
  // Quitar símbolo €, puntos de miles, convertir coma decimal
  const clean = str.replace(/[€$£\s]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}
