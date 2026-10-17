// A dedicated worker in the service worker's scope: is it controlled, and
// do its fetches go to the service worker?
(async () => {
  const controlled = !!(self.navigator.serviceWorker && self.navigator.serviceWorker.controller);
  let text = null;
  try {
    text = await (await fetch("data.txt?sw=respond")).text();
  } catch (error) {
    text = "fetch failed: " + error;
  }
  postMessage({ controlled, text });
})();
