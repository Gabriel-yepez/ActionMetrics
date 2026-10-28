/**
 * Pruebas del pool de proveedores de IA (rotación y conmutación de API keys).
 * Usan un servidor local que imita la API de OpenAI/DeepSeek: el comportamiento depende
 * de la clave (ok-*, rl-* = 429, bal-* = 402, bad-* = 401, slow-* = no responde a tiempo,
 * srv-* = 500, req-* = 400).
 *
 *   node --test tests/
 */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { AIProviderPool, AllProvidersFailedError } = require('../services/aiProviderPool');
const AIService = require('../services/aiService');

let server;
let baseURL;
const hits = {};       // peticiones recibidas por clave
const models = {};     // modelo recibido por clave

before(async () => {
  server = http.createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const key = (req.headers.authorization || '').replace('Bearer ', '');
      hits[key] = (hits[key] || 0) + 1;
      models[key] = JSON.parse(body || '{}').model;
      const send = (status, payload, headers = {}) => {
        res.writeHead(status, { 'content-type': 'application/json', ...headers });
        res.end(JSON.stringify(payload));
      };
      if (key.startsWith('ok-')) {
        return send(200, {
          id: 'x', object: 'chat.completion', model: models[key],
          choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: `respuesta de ${key}` } }],
        });
      }
      if (key.startsWith('rl-')) return send(429, { error: { message: 'Rate limit' } }, key === 'rl-retry' ? { 'retry-after': '7' } : {});
      if (key.startsWith('bal-')) return send(402, { error: { message: 'Insufficient Balance' } });
      if (key.startsWith('bad-')) return send(401, { error: { message: 'Invalid key' } });
      if (key.startsWith('srv-')) return send(500, { error: { message: 'Internal error' } });
      if (key.startsWith('req-')) return send(400, { error: { message: 'Bad request' } });
      if (key.startsWith('slow-')) return; // nunca responde: provoca timeout
      send(404, { error: { message: 'unknown' } });
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseURL = `http://127.0.0.1:${server.address().port}/v1`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

const resetHits = () => { for (const k of Object.keys(hits)) delete hits[k]; };

/** Pool con un proveedor propio que apunta al servidor falso. */
const makePool = (keys, extraEnv = {}, options = {}) => AIProviderPool.fromEnv({
  AI_PROVIDERS: 'falso',
  FALSO_BASE_URL: baseURL,
  FALSO_MODEL: 'modelo-falso',
  FALSO_API_KEYS: keys.join(','),
  ...extraEnv,
}, options);

const ask = (pool) => pool.chatCompletion({ messages: [{ role: 'user', content: 'hola' }], max_tokens: 10 });

// --- Configuración ---

test('retrocompatible: solo DEEPSEEK_API_KEY funciona como antes', () => {
  const pool = AIProviderPool.fromEnv({ DEEPSEEK_API_KEY: 'sk-unica-1234' });
  assert.equal(pool.size, 1);
  assert.equal(pool.entries[0].provider, 'DEEPSEEK');
  assert.equal(pool.entries[0].model, 'deepseek-reasoner');
  assert.equal(pool.entries[0].baseURL, 'https://api.deepseek.com/v1');
});

test('sin claves o con el valor de ejemplo del .env no hay proveedores (análisis simulado)', () => {
  assert.equal(AIProviderPool.fromEnv({}).size, 0);
  assert.equal(AIProviderPool.fromEnv({ DEEPSEEK_API_KEY: 'tu_api_key_aqui' }).size, 0);
});

test('varias claves y proveedores; un proveedor sin modelo se ignora con aviso', () => {
  const pool = AIProviderPool.fromEnv({
    DEEPSEEK_API_KEYS: 'sk-a, sk-b,sk-a',  // duplicada
    DEEPSEEK_API_KEY: 'sk-c',
    GROQ_API_KEYS: 'gsk-1',
    GROQ_MODEL: 'llama-x',
    GEMINI_API_KEYS: 'gem-1',               // sin GEMINI_MODEL
  });
  assert.deepEqual(pool.entries.map(e => `${e.provider}:${e.apiKey}`), ['DEEPSEEK:sk-a', 'DEEPSEEK:sk-b', 'DEEPSEEK:sk-c', 'GROQ:gsk-1']);
  assert.equal(pool.entries[3].baseURL, 'https://api.groq.com/openai/v1');
  assert.match(pool.warnings.join(), /GEMINI.*GEMINI_MODEL/);
});

test('el estado nunca expone las claves completas', () => {
  const pool = AIProviderPool.fromEnv({ DEEPSEEK_API_KEYS: 'sk-secreta-abcdefgh-9876' });
  const status = JSON.stringify(pool.getStatus());
  assert.ok(!status.includes('sk-secreta-abcdefgh-9876'));
  assert.ok(status.includes('…9876'));
});

// --- Rotación ---

test('random: reparte las peticiones entre todas las claves y envía el modelo configurado', async () => {
  resetHits();
  const pool = makePool(['ok-1', 'ok-2', 'ok-3']);
  for (let i = 0; i < 90; i++) await ask(pool);
  for (const key of ['ok-1', 'ok-2', 'ok-3']) {
    assert.ok(hits[key] >= 15, `${key} se usó ${hits[key]} veces de 90`);
    assert.equal(models[key], 'modelo-falso');
  }
});

test('round-robin: usa las claves en orden, una tras otra', async () => {
  const pool = makePool(['ok-a', 'ok-b', 'ok-c'], { AI_ROTATION: 'round-robin' });
  const used = [];
  for (let i = 0; i < 6; i++) used.push((await ask(pool)).entryId);
  assert.deepEqual(used, ['falso#1', 'falso#2', 'falso#3', 'falso#1', 'falso#2', 'falso#3']);
});

// --- Conmutación ante fallos ---

test('si una clave falla (429, 402, 401, 500) se usa otra y la petición no falla', async () => {
  resetHits();
  const pool = makePool(['rl-1', 'bal-1', 'bad-1', 'srv-1', 'ok-1']);
  for (let i = 0; i < 20; i++) {
    const { response } = await ask(pool);
    assert.equal(response.choices[0].message.content, 'respuesta de ok-1');
  }
  // Cada clave rota se probó una sola vez y quedó en pausa: no se le siguieron gastando intentos
  for (const key of ['rl-1', 'bal-1', 'bad-1', 'srv-1']) assert.equal(hits[key], 1, `${key}: ${hits[key]} intentos`);
  const status = pool.getStatus();
  assert.equal(status.available, 1);
  const reasons = Object.fromEntries(status.entries.map(e => [e.id, e.lastError?.reason]));
  assert.deepEqual(reasons, { 'falso#1': 'rate_limit', 'falso#2': 'sin_saldo', 'falso#3': 'auth', 'falso#4': 'error_servidor', 'falso#5': undefined });
});

test('pausas: Retry-After se respeta; sin saldo/clave inválida = 1 h; error de petición no pausa', async () => {
  const pool = makePool(['rl-retry', 'bal-2', 'req-1', 'ok-2'], { AI_ROTATION: 'round-robin' });
  await ask(pool);
  const byId = Object.fromEntries(pool.getStatus().entries.map(e => [e.id, e]));
  assert.equal(byId['falso#1'].cooldownSeconds, 7);      // rl-retry
  assert.equal(byId['falso#2'].cooldownSeconds, 3600);   // bal-2
  assert.equal(byId['falso#3'].available, true);         // req-1
});

test('la clave vuelve a usarse cuando termina la pausa, con backoff exponencial si sigue fallando', async () => {
  let clock = 1_000_000;
  const pool = makePool(['rl-2'], {}, { now: () => clock });
  const entry = pool.entries[0];

  await assert.rejects(ask(pool), AllProvidersFailedError);
  assert.equal(entry.cooldownUntil - clock, 60_000);         // 1.ª pausa: 60 s
  clock += 60_001;
  await assert.rejects(ask(pool), AllProvidersFailedError);
  assert.equal(entry.cooldownUntil - clock, 120_000);        // 2.ª: 120 s
  clock += 120_001;
  await assert.rejects(ask(pool), AllProvidersFailedError);
  assert.equal(entry.cooldownUntil - clock, 240_000);        // 3.ª: 240 s
});

test('una clave que no responde a tiempo se abandona y se usa otra', async () => {
  const pool = makePool(['slow-1', 'ok-3'], { AI_ROTATION: 'round-robin', AI_TIMEOUT_MS: '300' });
  const start = Date.now();
  const { entryId } = await ask(pool);
  assert.equal(entryId, 'falso#2');
  assert.ok(Date.now() - start < 3000);
  assert.equal(pool.getStatus().entries[0].lastError.reason, 'timeout');
});

test('si todas fallan se lanza AllProvidersFailedError con el detalle de los intentos', async () => {
  const pool = makePool(['bal-3', 'bad-3']);
  const error = await ask(pool).catch(e => e);
  assert.ok(error instanceof AllProvidersFailedError);
  assert.deepEqual(error.attempts.map(a => a.reason).sort(), ['auth', 'sin_saldo']);
  // Pausadas por saldo/clave inválida: no se reintentan como último recurso
  const again = await ask(pool).catch(e => e);
  assert.equal(again.attempts.length, 0);
});

// --- Integración con AIService ---

const userData = { nombreFinal: 'Ana', apellidoFinal: 'Pérez', ciFormateado: '1.234' };
const evaluationData = { puntuacion: '4', fecha: '2026-10-28', responses: { Comunicación: 'Bueno' } };

test('AIService usa la respuesta del proveedor que funcione', async () => {
  const service = new AIService(makePool(['bad-4', 'ok-4']));
  const texto = await service.generateAIComment(userData, evaluationData);
  assert.equal(texto, 'respuesta de ok-4');
});

test('AIService: si ningún proveedor responde, devuelve el análisis simulado (como antes)', async () => {
  const service = new AIService(makePool(['bal-5']));
  const texto = await service.generateAIComment(userData, evaluationData);
  assert.match(texto, /Análisis generado por IA para Ana Pérez/);
});
