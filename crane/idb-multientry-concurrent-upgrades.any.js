// META: title=Concurrent IndexedDB upgrades retain independent multiEntry outcomes
// META: global=window,worker
// META: script=/IndexedDB/resources/support.js

async_test(t => {
  const request = createdb(t);
  request.onupgradeneeded = t.step_func(() => {
    const store = request.result.createObjectStore('records');
    assert_throws_dom('InvalidAccessError', () =>
      store.createIndex('names', ['name'], {multiEntry: true}));
    t.done();
  });
}, 'a rejected array key path does not affect another upgrade');

async_test(t => {
  const request = createdb(t);
  const value = {label: 'large', names: Array.from({length: 1000}, (_, i) => `name-${i}`)};
  let database;
  request.onupgradeneeded = t.step_func(() => {
    database = request.result;
    database.createObjectStore('records').createIndex('names', 'names', {multiEntry: true});
  });
  request.onsuccess = t.step_func(() => {
    const transaction = database.transaction('records', 'readwrite');
    transaction.objectStore('records').put(value, 1);
    transaction.oncomplete = t.step_func(() => {
      const index = database.transaction('records').objectStore('records').index('names');
      for (let i = 0; i < 1000; i++) {
        index.get(`name-${i}`).onsuccess = t.step_func(event => {
          assert_equals(event.target.result.label, 'large');
        });
      }
      index.get('name-999').onsuccess = t.step_func(event => {
        assert_equals(event.target.result.names.length, 1000);
        t.done();
      });
    });
  });
}, 'a large multiEntry request queue does not affect another upgrade');

async_test(t => {
  const request = createdb(t);
  let database;
  let abortError = '';
  const writeErrors = [];
  request.onerror = t.step_func(() => {
    assert_unreached(`open ${request.error.name}; transaction ${abortError}; writes ${writeErrors.join(', ')}`);
  });
  request.onupgradeneeded = t.step_func(() => {
    database = request.result;
    const transaction = request.transaction;
    transaction.onabort = () => {
      abortError = transaction.error ? transaction.error.name : 'null';
    };
    const store = database.createObjectStore('records');
    store.createIndex('names', 'name', {multiEntry: true});
    const values = [
      {name: 'Odin'},
      {name: ['Rita', 'Scheeta', {Bobby: 'Bobby'}]},
      {name: [{s: 'Robert'}, 'Neil', 'Bobby']}
    ];
    values.forEach((value, i) => {
      const write = store.add(value, i + 1);
      write.onerror = () => writeErrors.push(`${i + 1}: ${write.error.name}`);
    });
  });
  request.onsuccess = t.step_func(() => {
    const index = database.transaction('records').objectStore('records').index('names');
    const keys = [];
    ['Odin', 'Rita', 'Scheeta', 'Neil', 'Bobby'].forEach(name => {
      index.getKey(name).onsuccess = t.step_func(event => {
        keys.push(event.target.result);
        if (keys.length === 5) {
          assert_array_equals(keys, [1, 2, 2, 3, 3]);
          t.done();
        }
      });
    });
  });
}, 'mixed valid and invalid multiEntry keys survive concurrent upgrades');
