// META: global=window,dedicatedworker
// META: title=An interface object's [[Prototype]] is its inherited interface's interface object
//
// WebIDL 3.7.1, interface object: "If interface inherits from another
// interface, then let constructorProto be the interface object of that
// inherited interface; otherwise %Function.prototype%", and the object's
// [[Prototype]] is constructorProto. IndexedDB/idlharness.any.js failed
// "Object.getPrototypeOf(IDBRequest) === EventTarget" (codex-indexeddb Q41).

test(() => {
  assert_equals(Object.getPrototypeOf(EventTarget), Function.prototype);
}, "an interface with no inherited interface: %Function.prototype%");

test(() => {
  assert_equals(Object.getPrototypeOf(IDBRequest), EventTarget, "IDBRequest");
  assert_equals(Object.getPrototypeOf(IDBOpenDBRequest), IDBRequest, "IDBOpenDBRequest");
}, "IDBOpenDBRequest -> IDBRequest -> EventTarget");

test(() => {
  // DOMException's interface prototype object inherits from %Error.prototype%
  // (WebIDL 3.14.1), but it inherits from no interface: its interface object
  // is a plain function.
  assert_equals(Object.getPrototypeOf(DOMException), Function.prototype);
}, "DOMException's interface object: %Function.prototype%");

test(() => {
  // Every global constructor F whose prototype object inherits from another
  // global constructor's prototype object G.prototype has G as its
  // [[Prototype]] - true of every inherited interface and of ECMAScript's own
  // constructors alike. A legacy factory function (Image) is skipped: its
  // prototype is another interface's (F.prototype.constructor !== F).
  const wrong = [];
  for (const name of Object.getOwnPropertyNames(self)) {
    if (name === "DOMException") continue;
    let F;
    try { F = self[name]; } catch (e) { continue; }
    if (typeof F !== "function") continue;
    const proto = Object.getOwnPropertyDescriptor(F, "prototype");
    if (!proto || typeof proto.value !== "object" || proto.value === null) continue;
    if (proto.value.constructor !== F) continue;
    const parentProto = Object.getPrototypeOf(proto.value);
    if (parentProto === null || parentProto === Object.prototype) continue;
    const parent = Object.getOwnPropertyDescriptor(parentProto, "constructor");
    if (!parent || typeof parent.value !== "function") continue;
    if (Object.getPrototypeOf(F) !== parent.value) wrong.push(name + " (expected " + parent.value.name + ")");
  }
  assert_array_equals(wrong, []);
}, "every inherited interface object's [[Prototype]] is its parent's interface object");
