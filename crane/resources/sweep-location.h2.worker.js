// A worker script whose name carries ".h2." - a WPT file-name flag the
// engine once rewrote into an https:// URL on the same port. The worker's
// URL is its script's URL (HTML "run a worker"), and relative URLs resolve
// against it.
let imported = false;
try {
  importScripts("sweep-import-marker.js");
  imported = self.sweepImportMarker === 1;
} catch (e) {
  imported = String(e);
}
postMessage({ href: self.location.href, protocol: self.location.protocol, imported });
