// claude.js — Genera consejo de compra inteligente con Claude
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeWithClaude(query, resultados) {
  if (!resultados.length) {
    return { consejo: "No se encontraron resultados para este producto." };
  }

  const resumenResultados = resultados
    .map((r) => `- ${r.tienda}: ${r.precio ? r.precio + "€" : "N/D"} ${r.precio_original ? "(antes " + r.precio_original + "€)" : ""} ${r.envio || ""}`)
    .join("\n");

  const msg = await client.messages.create({
model: "claude-sonnet-4-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `Eres Sherlock, un experto en compras online en España.

El usuario busca: "${query}"

Precios encontrados:
${resumenResultados}

En 2-3 frases máximo, da un consejo útil y concreto: dónde comprar, si el precio es bueno, si esperar ofertas (Black Friday, rebajas), qué variante/modelo elegir, o cualquier otra recomendación valiosa. Sé directo y práctico. No repitas los precios.`,
      },
    ],
  });

  return {
    consejo: msg.content[0]?.text || "Sin consejo disponible.",
  };
}
