// A classic worker's import(): the specifier resolves against this script's
// URL (HostLoadImportedModule step 6, the referencing script's base URL); the
// module's import.meta.url is its own URL; a second import() of the same URL
// is the same module (the worker's module map); a module that cannot be
// fetched rejects with a TypeError. Each answer is posted back.
(async () => {
  const result = {};
  try {
    const first = await import("./import-meta.mjs");
    result.url = first.url;
    result.same = (await import("./import-meta.mjs")) === first;
  } catch (e) {
    result.error = String(e);
  }
  try {
    await import("./eb-no-such-module.mjs");
    result.missing = "resolved";
  } catch (e) {
    result.missing = e && e.constructor ? e.constructor.name : String(e);
  }
  self.postMessage(result);
})();

// import() from a function this script defined, called later from a task.
self.addEventListener("message", e => {
  if (e.data !== "later") return;
  import("./import-meta.mjs").then(
    m => self.postMessage({ later: m.url }),
    err => self.postMessage({ later: "rejected: " + err }));
});
