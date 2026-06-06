// ⚠️ 每次更新 index.html 后必须手动修改这里的版本号，否则用户看不到更新！
const CACHE_NAME = 'syn-v2;

self.addEventListener('install', function(e) {
  // [FIX] skipWaiting 必须放在 e.waitUntil() 中，否则安装未完成时 SW 可能提前激活
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      ).then(function() {
        return self.clients.claim();
      });
    })
  );
});

self.addEventListener('fetch', function(e) {
  // [FIX] 只处理GET请求，POST/PUT等请求不应被SW拦截
  if(e.request.method !== 'GET') return;
  // [FIX] 只处理http(s)协议，避免拦截chrome-extension等内部请求
  if(!e.request.url.startsWith('http')) return;

  // HTML页面：永远先联网取最新，失败了才用缓存
  if(e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        // [FIX] 只缓存正常响应，避免把404/500错误页写入缓存
        if(resp && resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      }).catch(function() {
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('./index.html');
        });
      })
    );
    return;
  }
  // 其他资源（图标、字体等）：缓存优先
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(resp) {
        if(resp && resp.status === 200) {
          var clone = resp.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      }).catch(function() {
        return new Response('', { status: 503, statusText: 'Offline' });
      });
    })
  );
});