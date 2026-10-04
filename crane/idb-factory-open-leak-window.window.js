// META: title=IDBFactory open allocation control in a window
// META: script=/IndexedDB/resources/support.js
// META: script=/IndexedDB/idbfactory_open.any.js

// Run the unchanged upstream cases in only a window to distinguish task
// teardown leaks from the worker timer fallback. Keep its null-version RED.
