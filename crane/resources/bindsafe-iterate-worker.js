// Iterates every pair iterable a worker has, through each iteration method,
// and answers with the count and the iterator prototypes' class strings.
// For crane/bindsafe-worker-iterators-many.html.
function iterateAll() {
  const headers = new Headers([['a', '1'], ['b', '2']]);
  const form = new FormData();
  form.append('a', '1');
  const params = new URLSearchParams('a=1&b=2');
  let n = 0;
  for (const target of [headers, form, params]) {
    for (const _ of target) n++;
    for (const _ of target.entries()) n++;
    for (const _ of target.keys()) n++;
    for (const _ of target.values()) n++;
  }
  return [n].concat([headers, form, params].map(t => Object.prototype.toString.call(Object.getPrototypeOf(t.keys())))).join();
}

if (typeof SharedWorkerGlobalScope !== 'undefined' && self instanceof SharedWorkerGlobalScope) {
  self.onconnect = e => e.ports[0].postMessage(iterateAll());
} else {
  self.postMessage(iterateAll());
}
