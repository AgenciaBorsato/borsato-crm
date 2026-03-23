/**
 * Cache de sessao para midias carregadas.
 * Armazena base64 em memoria (Map) durante a sessao do browser.
 * Evita re-fetches para midia ja visualizada.
 * Limita a 120 entradas (FIFO) para nao vazar memoria.
 */

const MAX_ENTRIES = 120;
const cache = new Map();

export function getCachedMedia(msgId) {
  return cache.get(msgId) || null;
}

export function setCachedMedia(msgId, src) {
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(msgId, src);
}

/**
 * Semaforo de concorrencia.
 * Garante no maximo MAX_CONCURRENT requests de midia simultaneos.
 * Requests adicionais ficam na fila e executam quando uma slot libera.
 */

const MAX_CONCURRENT = 3;
let running = 0;
const queue = [];

function next() {
  if (queue.length === 0 || running >= MAX_CONCURRENT) return;
  running++;
  const { fn, resolve, reject } = queue.shift();
  fn().then(resolve).catch(reject).finally(() => {
    running--;
    next();
  });
}

export function throttledFetch(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    next();
  });
}
