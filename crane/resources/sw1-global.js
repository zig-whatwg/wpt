// The service worker's own global, checked during its install event: any
// unmet expectation rejects the install event's extend lifetime promise, so
// the worker becomes redundant instead of activated.
self.addEventListener("install", e => {
  const problems = [];
  // Step 1 of "add lifetime promise": an event script made is not trusted.
  const made = new ExtendableEvent("made");
  try {
    made.waitUntil(Promise.resolve());
    problems.push("an untrusted event's waitUntil did not throw");
  } catch (x) {
    if (x.name !== "InvalidStateError") problems.push("untrusted waitUntil threw " + x.name);
  }
  if (!(e instanceof InstallEvent)) problems.push("the install event is not an InstallEvent");
  if (!e.isTrusted) problems.push("the install event is not trusted");
  e.waitUntil(new Promise((resolve, reject) => {
    setTimeout(() => {
      // Still active: its pending promises count is 1.
      try {
        e.waitUntil(Promise.resolve());
      } catch (x) {
        problems.push("waitUntil while a promise is pending threw " + x.name);
      }
      const scope = new URL("sw1-scope/global/", self.location.href).href;
      if (self.registration.scope !== scope) problems.push("registration.scope " + self.registration.scope);
      if (self.registration !== self.registration) problems.push("registration is not [SameObject]");
      if (self.serviceWorker.state !== "installing") problems.push("serviceWorker.state " + self.serviceWorker.state);
      if (self.serviceWorker.scriptURL !== self.location.href) problems.push("serviceWorker.scriptURL " + self.serviceWorker.scriptURL);
      if (self.registration.installing !== self.serviceWorker) problems.push("registration.installing is not serviceWorker");
      if (!(self instanceof ServiceWorkerGlobalScope)) problems.push("self is not a ServiceWorkerGlobalScope");
      if (problems.length) reject(new Error(problems.join("; ")));
      else resolve();
    }, 10);
  }));
});
