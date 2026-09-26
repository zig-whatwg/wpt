// META: global=dedicatedworker
// META: title=A dedicated worker's global object is a DedicatedWorkerGlobalScope platform object
//
// HTML "run a worker" step 6 creates the realm with a new
// DedicatedWorkerGlobalScope as its global object, and WebIDL gives that
// object the interface's prototype chain: DedicatedWorkerGlobalScope.prototype,
// then WorkerGlobalScope.prototype, then EventTarget.prototype. The
// WindowOrWorkerGlobalScope members are WorkerGlobalScope's own (a mixin's
// members are the includer's), so they are found on WorkerGlobalScope.prototype.

test(() => {
  assert_false(Object.prototype.hasOwnProperty.call(DedicatedWorkerGlobalScope, Symbol.hasInstance),
               "instanceof is not faked with Symbol.hasInstance");
  assert_false(Object.prototype.hasOwnProperty.call(WorkerGlobalScope, Symbol.hasInstance),
               "instanceof is not faked with Symbol.hasInstance");
  assert_true(self instanceof DedicatedWorkerGlobalScope, "self instanceof DedicatedWorkerGlobalScope");
  assert_true(self instanceof WorkerGlobalScope, "self instanceof WorkerGlobalScope");
  assert_true(self instanceof EventTarget, "self instanceof EventTarget");
}, "The global object is a DedicatedWorkerGlobalScope, a WorkerGlobalScope and an EventTarget");

test(() => {
  assert_equals(Object.getPrototypeOf(DedicatedWorkerGlobalScope.prototype), WorkerGlobalScope.prototype);
  assert_equals(Object.getPrototypeOf(WorkerGlobalScope.prototype), EventTarget.prototype);
  assert_true(DedicatedWorkerGlobalScope.prototype.isPrototypeOf(self),
              "DedicatedWorkerGlobalScope.prototype is on the global's prototype chain");
  assert_equals(String(self), "[object DedicatedWorkerGlobalScope]");
}, "The global object's prototype chain");

test(() => {
  assert_equals(self.fetch, WorkerGlobalScope.prototype.fetch, "fetch");
  assert_equals(self.atob, WorkerGlobalScope.prototype.atob, "atob");
  assert_equals(self.btoa, WorkerGlobalScope.prototype.btoa, "btoa");
  assert_equals(self.queueMicrotask, WorkerGlobalScope.prototype.queueMicrotask, "queueMicrotask");
  assert_equals(self.structuredClone, WorkerGlobalScope.prototype.structuredClone, "structuredClone");
  assert_equals(self.addEventListener, EventTarget.prototype.addEventListener, "addEventListener");
}, "Operations are the interfaces' own, bound through the generated bindings");

test(() => {
  assert_equals(atob("Y3JhbmU="), "crane");
  assert_equals(btoa("crane"), "Y3JhbmU=");
  assert_throws_dom("InvalidCharacterError", () => atob("!"));
  const copy = structuredClone({ a: [1, 2] });
  assert_array_equals(copy.a, [1, 2]);
}, "The bound WindowOrWorkerGlobalScope operations work");

test(() => {
  let heard = null;
  const listener = e => { heard = e; };
  self.addEventListener("crane-test", listener);
  const event = new Event("crane-test");
  assert_true(self.dispatchEvent(event));
  self.removeEventListener("crane-test", listener);
  assert_equals(heard, event, "the listener ran");
  assert_equals(heard.currentTarget, null, "currentTarget is cleared after dispatch");
  assert_equals(event.target, self, "the event's target is the global object");
}, "The global object is an event target");

test(() => {
  // The global scope's wrapper is its context's global proxy. Handing the
  // global scope to script - here as an event's currentTarget, which wraps it
  // through the wrapper cache - must return that proxy untouched: re-pointing
  // the proxy's prototype would cut it off from the global object behind it.
  self.craneGlobalProbe = 17;
  let target = null;
  const listener = e => { target = e.currentTarget; };
  self.addEventListener("crane-probe", listener);
  self.dispatchEvent(new Event("crane-probe"));
  self.removeEventListener("crane-probe", listener);
  assert_equals(target, self, "currentTarget during dispatch is the global object");
  assert_equals(self.craneGlobalProbe, 17, "self still reaches the global object");
  assert_equals(craneGlobalProbe, 17, "the global variable is still there");
  assert_true(DedicatedWorkerGlobalScope.prototype.isPrototypeOf(self), "the chain is unchanged");
  delete self.craneGlobalProbe;
}, "Returning the global scope to script leaves the global proxy alone");

test(() => {
  const handler = () => {};
  assert_equals(self.onmessage, null, "onmessage starts null");
  self.onmessage = handler;
  assert_equals(self.onmessage, handler, "onmessage keeps its value");
  self.onmessage = null;
  assert_equals(self.onmessage, null, "onmessage is cleared");
  self.onerror = handler;
  assert_equals(self.onerror, handler, "onerror keeps its value");
  self.onerror = null;
}, "Event handler IDL attributes");

test(() => {
  assert_true(self.location instanceof WorkerLocation, "location is a WorkerLocation");
  assert_equals(self.location, self.location, "location is [SameObject]");
  assert_true(self.location.href.endsWith(".any.worker.js"), "location.href is the worker's URL");
  assert_equals(String(self.location), self.location.href, "location stringifies to its href");
  assert_true(self.navigator instanceof WorkerNavigator, "navigator is a WorkerNavigator");
  assert_equals(self.navigator, self.navigator, "navigator is [SameObject]");
  assert_equals(typeof self.navigator.userAgent, "string");
  assert_equals(self.origin, self.location.origin, "origin is the worker's");
  assert_equals(typeof self.isSecureContext, "boolean");
  assert_equals(self.name, "", "an unnamed worker's name is the empty string");
}, "The WorkerGlobalScope and DedicatedWorkerGlobalScope attributes");
