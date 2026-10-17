// Lane sw1-b4's cost probe: the batch 3 pass-through worker (a fetch listener
// that does not answer) with ten router rules, none of which matches
// data.txt?cost=N - the last routes to the fetch event, so every fetch is
// evaluated against all ten (Get Router Source on the fetching thread), then
// fires the event and falls back.
self.addEventListener("install", e => {
  const rules = [];
  for (let i = 0; i < 9; i++) rules.push({ condition: { urlPattern: `/**/nothing-${i}.txt` }, source: "network" });
  rules.push({ condition: { urlPattern: "/**/data.txt", requestMethod: "POST" }, source: "network" });
  e.waitUntil(e.addRoutes(rules));
  self.skipWaiting();
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
