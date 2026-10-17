// Lane sw1-b2: a dedicated worker that reads what its page put in a cache.
onmessage = async e => {
  const cache = await caches.open(e.data.name);
  const response = await cache.match(e.data.url);
  postMessage(response ? await response.text() : "no match");
};
