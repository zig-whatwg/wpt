// importScripts() in a service worker (Service Workers 6.3.2): fetched while
// it is being evaluated, then answered from its script resource map.
importScripts("sw1-imported.js");
if (self.sw1ImportedValue !== 42) throw new Error("the imported script did not run");
self.sw1ImportedValue = 0;
self.addEventListener("install", e => {
  // Installing: the map answers again, and the script runs again.
  importScripts("sw1-imported.js");
  if (self.sw1ImportedValue !== 42) throw new Error("the stored script did not run");
});
