// META: title=Isolated upstream multiEntry adding-keys case
// META: script=/IndexedDB/resources/support.js

'use strict';

// Keep the upstream case's callback and request order intact. The full
// idbindex-multientry.any.js file fails in a window after the two earlier
// tests, while the lane's rewritten three-case diagnostic passes.
async_test(t => {
  let db;
  let expected_keys = [1, 2, 2, 3, 3];
  let open_rq = createdb(t)
  open_rq.onupgradeneeded = function(e) {
    db = e.target.result;
    let store = db.createObjectStore('store')
    store.createIndex('actors', 'name', {multiEntry: true})
    store.add({name: 'Odin'}, 1);
    store.add({name: ['Rita', 'Scheeta', {Bobby: 'Bobby'}]}, 2);
    store.add({name: [{s: 'Robert'}, 'Neil', 'Bobby']}, 3);
  };
  open_rq.onsuccess = function(e) {
    let gotten_keys = [];
    let idx = db.transaction('store', 'readonly')
                  .objectStore('store')
                  .index('actors');
    idx.getKey('Odin').onsuccess = t.step_func(function(e) {
      gotten_keys.push(e.target.result)
    });
    idx.getKey('Rita').onsuccess = t.step_func(function(e) {
      gotten_keys.push(e.target.result)
    });
    idx.getKey('Scheeta').onsuccess = t.step_func(function(e) {
      gotten_keys.push(e.target.result)
    });
    idx.getKey('Neil').onsuccess = t.step_func(function(e) {
      gotten_keys.push(e.target.result)
    });
    idx.getKey('Bobby').onsuccess = t.step_func(function(e) {
      gotten_keys.push(e.target.result)
      assert_array_equals(gotten_keys, expected_keys);
      t.done();
    });
  }
}, 'Adding keys');
