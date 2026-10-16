// Lane sw1's service worker test helpers (Crane tests sw1-*).

// The worker's state, once it reaches `state` (or later states).
function sw1WaitForState(worker, state) {
  const order = ["parsed", "installing", "installed", "activating", "activated", "redundant"];
  return new Promise((resolve, reject) => {
    if (worker.state === state) return resolve(worker.state);
    worker.addEventListener("statechange", function listener() {
      if (worker.state === state) {
        worker.removeEventListener("statechange", listener);
        resolve(worker.state);
      } else if (worker.state === "redundant") {
        worker.removeEventListener("statechange", listener);
        reject(new Error("the worker became redundant waiting for " + state));
      } else if (order.indexOf(worker.state) > order.indexOf(state)) {
        worker.removeEventListener("statechange", listener);
        reject(new Error("the worker went past " + state + " to " + worker.state));
      }
    });
  });
}

// Unregister whatever is registered at `scope` first: registrations outlive
// a test page.
async function sw1Unregister(scope) {
  const absolute = new URL(scope, location.href).href;
  const found = await navigator.serviceWorker.getRegistration(scope);
  if (found && found.scope === absolute) await found.unregister();
}

async function sw1Register(t, script, options) {
  await sw1Unregister(options.scope);
  const registration = await navigator.serviceWorker.register(script, options);
  t.add_cleanup(() => registration.unregister());
  return registration;
}
