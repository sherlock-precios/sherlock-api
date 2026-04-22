# Sherlock API — Backend de precios reales

API REST que obtiene precios en tiempo real de Google Shopping (vía SerpAPI) y genera consejos de compra con Claude.

## Endpoints

```
GET /              → Health check
GET /search?q=...  → Buscar precios (ej: /search?q=iphone+16)
```

## Respuesta de ejemplo

```json
{
  "producto": "iPhone 16",
  "resultados": [
    {
      "tienda": "Amazon",
      "precio": 899.00,
      "precio_original": null,
      "disponible": true,
      "url": "https://...",
      "imagen": "https://...",
      "rating": 4.5,
      "envio": "Envío gratis"
    }
  ],
  "consejo": "El precio en Amazon es el más competitivo ahora mismo...",
  "fuente": "Google Shopping via SerpAPI · Actualizado ahora",
  "fromCache": false
}
```

---

## Despliegue en Railway (paso a paso)

### 1. Consigue tus claves API

- **SerpAPI**: Regístrate en [serpapi.com](https://serpapi.com) → Dashboard → API Key  
  (Plan gratuito: 100 búsquedas/mes. Plan de pago desde $50/mes para más volumen)

- **Anthropic**: Ve a [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

### 2. Sube el código a GitHub

```bash
git init
git add .
git commit -m "Sherlock API inicial"
git remote add origin https://github.com/TU_USUARIO/sherlock-api.git
git push -u origin main
```

### 3. Despliega en Railway

1. Ve a [railway.app](https://railway.app) y haz login con GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Selecciona tu repositorio `sherlock-api`
4. Railway detecta automáticamente que es Node.js y despliega

### 4. Añade las variables de entorno en Railway

En tu proyecto Railway → **Variables** → añade:

```
SERPAPI_KEY=tu_clave_serpapi
ANTHROPIC_API_KEY=tu_clave_anthropic
```

Railway asigna `PORT` automáticamente, no hace falta añadirlo.

### 5. Obtén tu URL pública

En Railway → Settings → Domains → **Generate Domain**  
Tu API estará en algo como: `https://sherlock-api-production.up.railway.app`

### 6. Conecta Sherlock (el widget del chat) con tu backend

En el widget de Sherlock, cambia la URL de la API:

```javascript
const BACKEND_URL = "https://TU-URL.up.railway.app";
// Luego en la función buscar():
const res = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(q)}`);
```

---

## Desarrollo local

```bash
cp .env.example .env
# Edita .env con tus claves

npm install
npm run dev
```

Prueba: `http://localhost:3000/search?q=iphone+16`

---

## Costes estimados

| Servicio | Coste |
|----------|-------|
| Railway (Hobby) | $5/mes |
| SerpAPI (Starter) | $50/mes (5.000 búsquedas) |
| Anthropic API | ~$0.003 por búsqueda |
| **Total aprox.** | **~$55/mes** para uso normal |

Para empezar gratis: SerpAPI tiene 100 búsquedas/mes gratis y Railway tiene un free tier de $5 de crédito.
