// Service Worker untuk LAZISNU PWA
const CACHE_VERSION = 'lazisnu-v1.0.0'
const CACHE_NAME = `lazisnu-cache-${CACHE_VERSION}`

// File yang akan di-cache
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/dashboard.html',
  '/auth.js',
  '/donasi.js',
  '/users.js',
  '/audit.js',
  '/admin.js',
  '/printer.js',
  '/charts.js',
  '/offline.js',
  '/export.js',
  '/exportJP.js',
  '/backup.js',
  '/validation.js',
  '/supabaseClient.js',
  '/manifest.json'
]

// CDN yang akan di-cache
const CDN_CACHE = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static files')
      return cache.addAll(STATIC_CACHE.concat(CDN_CACHE))
    }).catch((error) => {
      console.error('[SW] Cache failed:', error)
    })
  )
  
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Network first for Supabase API
  if (url.hostname.includes('supabase')) {
    event.respondWith(networkFirst(request))
    return
  }
  
  // Cache first for static assets
  event.respondWith(cacheFirst(request))
})

// Cache first strategy
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  
  if (cached) {
    console.log('[SW] Serving from cache:', request.url)
    return cached
  }
  
  try {
    const response = await fetch(request)
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    
    // Return offline page if available
    const offlinePage = await cache.match('/index.html')
    return offlinePage || new Response('Offline', { status: 503 })
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    
    // Cache successful API responses
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(request)
    
    if (cached) {
      return cached
    }
    
    throw error
  }
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
