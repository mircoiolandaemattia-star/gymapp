let cacheName = 'fittrack-shell'

const SHELL = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png']

async function loadPrecache() {
  try {
    const res = await fetch('/precache.json')
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data.assets) && data.assets.length) return data
    return null
  } catch {
    return null
  }
}

async function precacheAll(cache, data) {
  if (data) {
    await Promise.allSettled(data.assets.map((url) => cache.add(url)))
    return
  }
  await Promise.allSettled(SHELL.map((url) => cache.add(url)))
  try {
    const res = await fetch('/index.html')
    const html = await res.text()
    const assetUrls = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
    await Promise.allSettled(assetUrls.map((url) => cache.add(url)))
  } catch {
    // Gli asset verranno comunque cache-ati al primo fetch
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const data = await loadPrecache()
      if (data) cacheName = 'fittrack-' + data.version
      const cache = await caches.open(cacheName)
      await precacheAll(cache, data)
    })()
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithShellFallback(request))
    return
  }

  event.respondWith(cacheFirst(request))
})

async function networkFirstWithShellFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = (await caches.match(request)) || (await caches.match('/index.html'))
    if (cached) return cached
    return new Response('Offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }
}
