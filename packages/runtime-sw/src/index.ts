
export {};

const self = globalThis as ServiceWorkerGlobalScope & typeof globalThis;

const OFFLINE_PATH = "/offline.html";

const CACHE_TTL = 600_000;

const CACHE_NAME = "runtime-v3";
const PRECACHE_NAME = "precache-v2";
const META_NAME = "meta-v1";
const PRECACHE_URLS = [
  "/menhera-window.js",
  "/menhera-worker.js",
  OFFLINE_PATH,
];

async function saveMeta(key: string, value: unknown) {
  const cache = await caches.open(META_NAME);
  await cache.put((new URL(key, origin)).href, new Response(JSON.stringify(value), { headers: {'Content-Type': 'application/json'} }));
}

async function getMeta<T>(key: string): Promise<T | null> {
  const cache = await caches.open(META_NAME);
  const res = await cache.match((new URL(key, origin)).href);
  return res ? await res.json() : null;
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PRECACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key !== CACHE_NAME && key !== PRECACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (!shouldHandle(request, url)) {
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request, event));
    return;
  }

  event.respondWith(handleStaleWhileRevalidate(request, event));
});

function isNavigationRequest(request: Request) {
  return request.mode === "navigate";
}

function shouldHandle(request: Request, url: URL) {
  if (request.method !== "GET") return false;
  //if (url.origin !== self.location.origin) return false;
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  if (request.headers.has("range")) return false;
  if (request.headers.has("authorization")) return false;

  return true;
}

async function handleNavigation(request: Request, event: FetchEvent) {
  const [precache, runtime] = await Promise.all([
    caches.open(PRECACHE_NAME),
    caches.open(CACHE_NAME),,
  ]);

  const [offlineFallback, cachedRequest] = await Promise.all([
    precache.match(OFFLINE_PATH),
    runtime.match(request),
  ]);

  const cachedDate = cachedRequest?.headers.get('Date');
  let cacheStall = false;
  if (cachedDate) {
    try {
      const d = new Date(cachedDate);
      cacheStall = (Date.now() - d.getTime()) > CACHE_TTL;
    } catch (e) {}
  }

  const isCached = cachedRequest && !cacheStall;

  if (isCached) {
    console.log('navigation (cached):', request.url);
  } else {
    console.log('navigation:', request.url);
  }

  const networkPromise = (async () => {
    const response = await fetch(request);

    if (response && response.ok && response.type === "basic") {
      await runtime.put(request, response.clone());
    }

    return response;
  })();

  event.waitUntil(networkPromise.catch(() => {}));

  if (cachedRequest && !cacheStall) {
    return cachedRequest;
  }

  try {
    return await networkPromise;
  } catch (err) {
    if (cachedRequest) {
      return cachedRequest;
    }

    if (offlineFallback) {
      return offlineFallback;
    }

    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

async function handleStaleWhileRevalidate(request: Request, event: FetchEvent) {
  const [cache, precache] = await Promise.all([caches.open(CACHE_NAME), caches.open(PRECACHE_NAME)]);
  const [cached, precached] = await Promise.all([cache.match(request), precache.match(request)]);

  const networkPromise = fetchAndUpdate(request, cache);

  event.waitUntil(networkPromise.catch(() => {}));

  if (cached) {
    return cached;
  }

  if (precached) {
    return precached;
  }

  try {
    return await networkPromise;
  } catch (err) {
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

async function fetchAndUpdate(request: Request, cache: Cache) {
  const response = await fetch(request);

  if (response && response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
  }

  return response;
}
