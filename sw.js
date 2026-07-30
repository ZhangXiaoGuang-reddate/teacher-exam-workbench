/* ============================================
   Service Worker - 教资备考工作台
   离线缓存 + 安装为 PWA
   ============================================ */

const CACHE_NAME = 'teacher-exam-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './css/themes.css',
  './css/components.css',
  './css/animations.css',
  './css/responsive.css',
  './js/store.js',
  './js/utils.js',
  './js/router.js',
  './js/theme.js',
  './js/app.js',
  './js/modules/navigation.js',
  './js/modules/cat-mascot.js',
  './js/modules/planning.js',
  './js/modules/daily-plan.js',
  './js/modules/pomodoro.js',
  './js/modules/subject-study.js',
  './js/modules/schedule.js',
  './js/modules/mood.js',
  './js/modules/countdown.js',
  './js/modules/statistics.js',
  './js/modules/ai-assistant.js',
  './js/modules/settings.js',
  './assets/icon-48.png',
  './assets/icon-72.png',
  './assets/icon-96.png',
  './assets/icon-144.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
];

// 安装：预缓存所有核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll partial failure (some files may be missing):', err.message);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 请求拦截：缓存优先，离线回退
self.addEventListener('fetch', (event) => {
  // 跳过非 GET 请求和 API 请求
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('api.deepseek.com')) return;
  if (event.request.url.includes('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 缓存命中直接返回
      if (cached) {
        // 后台更新缓存
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => null);
        return cached;
      }

      // 缓存未命中，尝试网络
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // 离线且无缓存，返回 index.html（SPA 回退）
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// 监听消息（用于触发更新）
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
