import express from "express";
import cors from "cors";
import { getShoppingResults } from "./serpapi.js";
import { summarizeWithClaude } from "./claude.js";
import { cache } from "./cache.js";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ status: "ok", app: "Sherlock API" }));

// Main endpoint: GET /search?q=iphone+16
app.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Parámetro q requerido" });

  const cacheKey = `search:${q.toLowerCase()}`;

  // Cache: devolver si existe (1h de validez)
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache hit] ${q}`);
    return res.json({ ...cached, fromCache: true });
  }

  try {
    console.log(`[search] ${q}`);

    // 1. Obtener precios reales de Google Shopping via SerpAPI
    const shoppingResults = await getShoppingResults(q);

    // 2. Claude analiza y genera consejo de compra
    const summary = await summarizeWithClaude(q, shoppingResults);

    const response = {
      producto: q,
      resultados: shoppingResults,
      consejo: summary.consejo,
      fuente: "Google Shopping via SerpAPI · Actualizado ahora",
      fromCache: false,
    };

    // Guardar en cache por 1 hora
    cache.set(cacheKey, response, 3600);

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error buscando precios", detail: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sherlock API escuchando en puerto ${PORT}`));
