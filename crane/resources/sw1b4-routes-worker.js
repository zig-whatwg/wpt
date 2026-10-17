// Lane sw1-b4: a worker with static routes. Its install adds the rules, and
// records what addRoutes() said about the bad ones.
const results = {};

async function attempt(name, e, rules) {
  try {
    await e.addRoutes(rules);
    results[name] = 'ok';
  } catch (err) {
    results[name] = err.name;
  }
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open('sw1b4');
    await cache.put(new Request('sw1b4-routes/cached.txt'), new Response('From cache'));
    await attempt('good', e, [
      {condition: {urlPattern: '/**/net.txt'}, source: 'network'},
      {condition: {urlPattern: new URLPattern({pathname: '/**/CACHED.TXT'}, {ignoreCase: true})}, source: {cacheName: 'sw1b4'}},
      {condition: {requestMethod: 'post', requestMode: 'cors'}, source: 'network'},
      {condition: {not: {urlPattern: '/**/*.txt'}}, source: 'fetch-event'},
    ]);
    await attempt('bad-method', e, {condition: {requestMethod: '(GET)'}, source: 'network'});
    await attempt('forbidden-method', e, {condition: {requestMethod: 'TRACE'}, source: 'network'});
    await attempt('regexp-group', e, {condition: {urlPattern: '/(\\d+)'}, source: 'network'});
    await attempt('or-with-other', e, {condition: {or: [{requestMode: 'cors'}], requestMethod: 'GET'}, source: 'network'});
    await attempt('empty-condition', e, {condition: {}, source: 'network'});
    await attempt('no-source', e, {condition: {requestMode: 'cors'}});
    await attempt('bad-source', e, {condition: {requestMode: 'cors'}, source: 'nowhere'});
    await attempt('bad-mode', e, {condition: {requestMode: 'nope'}, source: 'network'});
    await attempt('too-many', e, [...Array(1025)].map((_, i) => ({condition: {urlPattern: `/x-${i}`}, source: 'network'})));
  })());
  self.skipWaiting();
});

let installEvent;
self.addEventListener('install', e => { installEvent = e; });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try {
      await installEvent.addRoutes({condition: {requestMode: 'cors'}, source: 'network'});
      results['after-install'] = 'ok';
    } catch (err) {
      results['after-install'] = err.name;
    }
    await clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  e.respondWith(new Response('from-sw'));
});

self.addEventListener('message', e => {
  e.source.postMessage(results);
});
