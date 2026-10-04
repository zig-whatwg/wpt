// META: title=Upstream multiEntry array-key-path case followed by adding keys
// META: script=/IndexedDB/resources/support.js

'use strict';

// Preserve these upstream bodies and their order while isolating the earlier
// test that causes Adding keys to abort on the current runner.
async_test(t => {
  createdb(t).onupgradeneeded = function(e) {
    let store = e.target.result.createObjectStore('store');
    assert_throws_dom('InvalidAccessError', function() {
      store.createIndex('actors', ['name'], {multiEntry: true})
    });
    t.done();
  };
}, 'Array keyPath with multiEntry');

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
