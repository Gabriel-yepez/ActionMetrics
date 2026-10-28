const OpenAI = require('openai');

/**
 * Pool de proveedores de IA compatibles con la API de OpenAI (el mismo formato que usa DeepSeek).
 *
 * Cada combinación proveedor + API key es una "entrada". En cada petición se elige una al azar
 * (o en orden rotativo) y, si falla por límite de uso, saldo agotado, clave inválida o error del
 * servidor, se pasa a la siguiente. La entrada que falló queda en pausa un tiempo (con backoff
 * exponencial) para no gastar sus intentos, y vuelve a usarse cuando la pausa termina.
 *
 * Configuración por variables de entorno (ver .env.example):
 *   <PROVEEDOR>_API_KEYS   claves separadas por coma (o <PROVEEDOR>_API_KEY con una sola)
 *   <PROVEEDOR>_MODEL      modelo a usar (DeepSeek tiene valor por defecto)
 *   <PROVEEDOR>_BASE_URL   solo para proveedores propios o para cambiar la URL de uno conocido
 *   AI_PROVIDERS           proveedores propios adicionales (ej.: "miproveedor,otro")
 *   AI_ROTATION            random (por defecto) | round-robin
 *
 * Retrocompatible: con solo DEEPSEEK_API_KEY funciona igual que antes (DeepSeek, deepseek-reasoner).
 */

// Proveedores conocidos: solo hace falta poner sus claves (y el modelo)
const PRESETS = {
  DEEPSEEK: { baseURL: 'https://api.deepseek.com/v1', model: 'deepseek-reasoner' },
  GROQ: { baseURL: 'https://api.groq.com/openai/v1' },
  OPENROUTER: { baseURL: 'https://openrouter.ai/api/v1' },
  GEMINI: { baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
  MISTRAL: { baseURL: 'https://api.mistral.ai/v1' },
  CEREBRAS: { baseURL: 'https://api.cerebras.ai/v1' },
  TOGETHER: { baseURL: 'https://api.together.xyz/v1' },
  OPENAI: { baseURL: 'https://api.openai.com/v1' },
};

// Valores de ejemplo de .env.example que no son claves reales
const PLACEHOLDER_KEYS = new Set(['tu-api-key-aqui', 'tu_api_key_aqui', 'your-api-key', 'changeme']);

const SECOND = 1000;
const MINUTE = 60 * SECOND;

class AllProvidersFailedError extends Error {
  constructor(attempts) {
    super(`Ningún proveedor de IA respondió (${attempts.length} intento(s))`);
    this.name = 'AllProvidersFailedError';
    this.attempts = attempts;
  }
}

const parseList = (value) =>
  [...new Set(String(value || '').split(/[\s,;]+/).map(v => v.trim()).filter(Boolean))];

const parsePositiveInt = (value, fallback) => {
  const n = parseInt(value, 10);
  return n > 0 ? n : fallback;
};

/** Solo los últimos 4 caracteres: las claves nunca se registran ni se devuelven completas. */
const maskKey = (key) => (key.length > 8 ? `…${key.slice(-4)}` : '…');

/**
 * Clasifica un error del SDK y decide cuánto tiempo pausar la entrada.
 * `retryable`: si tiene sentido probar con otra entrada.
 */
function classifyError(error, config) {
  const status = error && typeof error.status === 'number' ? error.status : null;

  if (error instanceof OpenAI.APIConnectionTimeoutError || error?.name === 'AbortError') {
    return { reason: 'timeout', status, baseCooldown: config.transientCooldownMs };
  }
  if (status === 429) {
    // Respetar Retry-After si el proveedor lo envía
    // openai >= 5 entrega un objeto Headers; versiones anteriores, un objeto plano
    const headers = error.headers;
    const retryAfter = parseFloat(typeof headers?.get === 'function' ? headers.get('retry-after') : headers?.['retry-after']);
    const fromHeader = retryAfter > 0 ? retryAfter * SECOND : null;
    return { reason: 'rate_limit', status, baseCooldown: fromHeader || config.rateLimitCooldownMs, exact: !!fromHeader };
  }
  if (status === 401 || status === 403) return { reason: 'auth', status, baseCooldown: config.disabledCooldownMs };
  if (status === 402) return { reason: 'sin_saldo', status, baseCooldown: config.disabledCooldownMs };
  if (status === 404) return { reason: 'modelo_no_encontrado', status, baseCooldown: config.disabledCooldownMs };
  if (status === 400 || status === 422) {
    // Petición rechazada por este proveedor/modelo: no es culpa de la clave, no se pausa
    return { reason: 'peticion_invalida', status, baseCooldown: 0 };
  }
  // 5xx, 408, 409, errores de red...
  return { reason: status ? 'error_servidor' : 'error_conexion', status, baseCooldown: config.transientCooldownMs };
}

class AIProviderPool {
  /**
   * @param {object[]} entries  [{ provider, baseURL, model, apiKey }]
   * @param {object} options    { strategy, timeoutMs, totalTimeoutMs, ..., now, random, clientFactory }
   */
  constructor(entries, options = {}) {
    this.config = {
      strategy: options.strategy === 'round-robin' ? 'round-robin' : 'random',
      timeoutMs: options.timeoutMs || 120 * SECOND,
      totalTimeoutMs: options.totalTimeoutMs || 170 * SECOND,
      rateLimitCooldownMs: options.rateLimitCooldownMs || MINUTE,
      transientCooldownMs: options.transientCooldownMs || 30 * SECOND,
      disabledCooldownMs: options.disabledCooldownMs || 60 * MINUTE,
      maxCooldownMs: options.maxCooldownMs || 6 * 60 * MINUTE,
    };
    this.now = options.now || Date.now;
    this.random = options.random || Math.random;
    this.clientFactory = options.clientFactory
      || ((entry) => new OpenAI({ apiKey: entry.apiKey, baseURL: entry.baseURL, maxRetries: 0 }));
    this.roundRobinIndex = 0;

    this.entries = entries.map((entry, index) => ({
      ...entry,
      id: `${entry.provider.toLowerCase()}#${index + 1}`,
      client: null,
      cooldownUntil: 0,
      consecutiveFailures: 0,
      successes: 0,
      failures: 0,
      lastError: null,
      lastUsedAt: null,
    }));
  }

  /** Construye el pool a partir de variables de entorno (process.env por defecto). */
  static fromEnv(env = process.env, options = {}) {
    const warnings = [];
    const providerNames = [...new Set([...Object.keys(PRESETS), ...parseList(env.AI_PROVIDERS).map(p => p.toUpperCase())])];
    const entries = [];

    for (const name of providerNames) {
      if (!/^[A-Z][A-Z0-9_]*$/.test(name)) {
        warnings.push(`Nombre de proveedor inválido en AI_PROVIDERS: "${name}"`);
        continue;
      }
      const keys = [...parseList(env[`${name}_API_KEYS`]), ...parseList(env[`${name}_API_KEY`])]
        .filter(key => !PLACEHOLDER_KEYS.has(key.toLowerCase()));
      if (keys.length === 0) continue;

      const preset = PRESETS[name] || {};
      const baseURL = env[`${name}_BASE_URL`] || preset.baseURL;
      const model = env[`${name}_MODEL`] || preset.model;
      if (!baseURL || !model) {
        warnings.push(`IA: ${name} tiene claves pero falta ${!baseURL ? `${name}_BASE_URL` : `${name}_MODEL`}; se ignora`);
        continue;
      }
      for (const apiKey of [...new Set(keys)]) {
        entries.push({ provider: name, baseURL, model, apiKey });
      }
    }

    const pool = new AIProviderPool(entries, {
      strategy: String(env.AI_ROTATION || '').toLowerCase(),
      timeoutMs: parsePositiveInt(env.AI_TIMEOUT_MS),
      totalTimeoutMs: parsePositiveInt(env.AI_TOTAL_TIMEOUT_MS),
      rateLimitCooldownMs: parsePositiveInt(env.AI_RATE_LIMIT_COOLDOWN_MS),
      disabledCooldownMs: parsePositiveInt(env.AI_DISABLED_COOLDOWN_MS),
      ...options,
    });
    pool.warnings = warnings;
    return pool;
  }

  get size() {
    return this.entries.length;
  }

  /** Orden de prueba para una petición: primero las disponibles (al azar o rotando). */
  _candidates() {
    const now = this.now();
    const available = this.entries.filter(e => e.cooldownUntil <= now);

    let ordered;
    if (this.config.strategy === 'round-robin') {
      // Rotación: cada petición empieza por la siguiente entrada
      const start = this.roundRobinIndex % this.entries.length;
      this.roundRobinIndex = (this.roundRobinIndex + 1) % this.entries.length;
      const rotated = [...this.entries.slice(start), ...this.entries.slice(0, start)];
      ordered = rotated.filter(e => available.includes(e));
    } else {
      // Elección aleatoria (Fisher–Yates): reparte el uso entre todas las claves
      ordered = [...available];
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }

    // Si todas están en pausa, último recurso: las pausadas por límite o error temporal
    // (nunca las de clave inválida o sin saldo), empezando por la que antes se libera
    if (ordered.length === 0) {
      ordered = this.entries
        .filter(e => ['rate_limit', 'timeout', 'error_servidor', 'error_conexion'].includes(e.lastError?.reason))
        .sort((a, b) => a.cooldownUntil - b.cooldownUntil);
    }
    return ordered;
  }

  _client(entry) {
    if (!entry.client) entry.client = this.clientFactory(entry);
    return entry.client;
  }

  _recordFailure(entry, classification) {
    entry.failures += 1;
    entry.lastError = { reason: classification.reason, status: classification.status, at: new Date(this.now()).toISOString() };
    if (classification.baseCooldown <= 0) return 0;

    entry.consecutiveFailures += 1;
    // Backoff exponencial: cada fallo seguido duplica la pausa (salvo Retry-After exacto)
    const factor = classification.exact ? 1 : 2 ** (entry.consecutiveFailures - 1);
    const cooldown = Math.min(classification.baseCooldown * factor, this.config.maxCooldownMs);
    entry.cooldownUntil = this.now() + cooldown;
    return cooldown;
  }

  /**
   * Ejecuta un chat completion probando entradas hasta que una responda.
   * @param {object} params  parámetros de chat.completions.create SIN `model` (lo pone cada entrada)
   * @returns {{ response, provider, model, entryId }}
   */
  async chatCompletion(params) {
    if (this.size === 0) throw new AllProvidersFailedError([]);

    const deadline = this.now() + this.config.totalTimeoutMs;
    const attempts = [];

    for (const entry of this._candidates()) {
      const remaining = deadline - this.now();
      if (remaining <= 0) break;

      entry.lastUsedAt = new Date(this.now()).toISOString();
      try {
        const response = await this._client(entry).chat.completions.create(
          { ...params, model: entry.model },
          { timeout: Math.min(this.config.timeoutMs, remaining), maxRetries: 0 }
        );
        entry.successes += 1;
        entry.consecutiveFailures = 0;
        entry.cooldownUntil = 0;
        console.log(`IA: respuesta de ${entry.id} (${entry.model}, clave ${maskKey(entry.apiKey)})`);
        return { response, provider: entry.provider, model: entry.model, entryId: entry.id };
      } catch (error) {
        const classification = classifyError(error, this.config);
        const cooldown = this._recordFailure(entry, classification);
        attempts.push({ entryId: entry.id, reason: classification.reason, status: classification.status });
        console.warn(
          `IA: ${entry.id} falló (${classification.reason}${classification.status ? ` ${classification.status}` : ''})` +
          (cooldown ? `, en pausa ${Math.round(cooldown / SECOND)}s` : '') + '; probando con la siguiente'
        );
      }
    }

    throw new AllProvidersFailedError(attempts);
  }

  /** Estado del pool para diagnóstico (sin claves). */
  getStatus() {
    const now = this.now();
    return {
      strategy: this.config.strategy,
      total: this.size,
      available: this.entries.filter(e => e.cooldownUntil <= now).length,
      entries: this.entries.map(e => ({
        id: e.id,
        provider: e.provider,
        model: e.model,
        key: maskKey(e.apiKey),
        available: e.cooldownUntil <= now,
        cooldownSeconds: Math.max(0, Math.ceil((e.cooldownUntil - now) / SECOND)),
        successes: e.successes,
        failures: e.failures,
        lastError: e.lastError,
        lastUsedAt: e.lastUsedAt,
      })),
      warnings: this.warnings || [],
    };
  }
}

// Pool compartido por toda la aplicación (las pausas de cada clave se respetan entre peticiones)
const aiPool = AIProviderPool.fromEnv();
for (const warning of aiPool.warnings) console.warn(warning);
if (aiPool.size > 0) {
  console.log(`IA: ${aiPool.size} clave(s) configurada(s) en ${new Set(aiPool.entries.map(e => e.provider)).size} proveedor(es), rotación "${aiPool.config.strategy}"`);
}

module.exports = { AIProviderPool, AllProvidersFailedError, aiPool, classifyError, maskKey, PRESETS };
