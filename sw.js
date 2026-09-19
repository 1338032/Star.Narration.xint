// ⚠️ 每次更新 index.html 后必须手动修改这里的版本号，否则用户看不到更新！
const CACHE_NAME = 'syn-v13';

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

  // HTML页面 & 核心代码文件(script-*.js/styles.css)：永远先联网取最新，失败了才用缓存。
  // [FIX] JS/CSS 每次发版都会变，如果走下面"缓存优先"的策略，
  // 一旦被缓存过，哪怕服务器上的文件已经更新，也会一直被当作"没变"而继续吐旧版本，
  // 必须手动改 CACHE_NAME 才能强制刷新——这正是之前"改了代码但页面一直加载不到新版本"的根因。
  // 这里按扩展名匹配，script.js 拆分成 script-1-core.js ~ script-5-system.js 五个文件后不需要改这段逻辑。
  // 这两类文件和 HTML 一样必须保证优先拿新的，缓存只作为断网时的兜底。
  var isCoreAsset = e.request.url.endsWith('.js') || e.request.url.endsWith('.css');
  if(e.request.mode === 'navigate' || e.request.url.endsWith('.html') || e.request.url.endsWith('/') || isCoreAsset) {
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
          if(cached) return cached;
          if(isCoreAsset) return new Response('', { status: 503, statusText: 'Offline' });
          return caches.match('./index.html');
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