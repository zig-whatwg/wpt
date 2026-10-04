// META: global=window,dedicatedworker
// META: title=A [Global] interface's members are the global object's own, not its prototype's
//
// WebIDL 3.7.5/3.7.6 and "named properties object": for an interface
// declared [Global], its regular attributes and operations - and those of
// the mixins it includes - are properties of the global object itself, and
// not of the interface prototype object. An interface the global object only
// inherits from (WorkerGlobalScope, EventTarget) keeps its members on its
// interface prototype object. IndexedDB/idlharness.any.js:
// "Window.prototype must not have indexedDB".

function ownMembers(proto) {
  return Object.getOwnPropertyNames(proto).filter(n => n !== "constructor");
}

if (self.GLOBAL.isWindow()) {
  test(() => {
    assert_array_equals(ownMembers(Window.prototype), []);
  }, "Window.prototype has no attributes or operations");

  test(() => {
    for (const name of ["indexedDB", "crypto", "origin", "isSecureContext"]) {
      const d = Object.getOwnPropertyDescriptor(self, name);
      assert_not_equals(d, undefined, name);
      assert_equals(typeof d.get, "function", name + " getter");
    }
    for (const name of ["setTimeout", "atob", "fetch", "queueMicrotask", "structuredClone"]) {
      const d = Object.getOwnPropertyDescriptor(self, name);
      assert_not_equals(d, undefined, name);
      assert_equals(typeof d.value, "function", name);
    }
  }, "WindowOrWorkerGlobalScope's members are own properties of the window");
} else {
  test(() => {
    assert_array_equals(ownMembers(DedicatedWorkerGlobalScope.prototype), []);
  }, "DedicatedWorkerGlobalScope.prototype has no attributes or operations");

  test(() => {
    for (const name of ["postMessage", "close", "name"]) {
      assert_not_equals(Object.getOwnPropertyDescriptor(self, name), undefined, name);
    }
  }, "DedicatedWorkerGlobalScope's members are own properties of the global");

  test(() => {
    for (const name of ["indexedDB", "setTimeout", "importScripts", "location"]) {
      assert_not_equals(Object.getOwnPropertyDescriptor(WorkerGlobalScope.prototype, name), undefined, name);
      assert_equals(Object.getOwnPropertyDescriptor(self, name), undefined, name);
    }
  }, "WorkerGlobalScope is not [Global]: its members stay on WorkerGlobalScope.prototype");
}
