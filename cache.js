// cache.js — Cache en memoria con TTL (Railway no incluye Redis en free tier)
// Para producción con mucho tráfico, sustituir por Redis

class SimpleCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = 3600) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  delete(key) {
    this.store.delete(key);
  }

  // Limpiar entradas expiradas cada 10 minutos
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.expiresAt) this.store.delete(key);
      }
    }, 10 * 60 * 1000);
  }
}

export const cache = new SimpleCache();
cache.startCleanup();
