// META: title=IndexedDB multiEntry ignores invalid array members during upgrade writes
// META: global=window,worker

promise_test(async t => {
  const name = `crane-multientry-add-keys-${self.location.pathname}`;
  const request = indexedDB.open(name, 1);
  let database;
  let transactionError = '';
  const writeErrors = [];
  t.add_cleanup(() => {
    if (database) database.close();
    indexedDB.deleteDatabase(name);
  });
  request.onupgradeneeded = t.step_func(() => {
    database = request.result;
    const transaction = request.transaction;
    transaction.onabort = () => {
      transactionError = transaction.error ? transaction.error.name : 'null';
    };
    const store = database.createObjectStore('records');
    store.createIndex('names', 'name', {multiEntry: true});
    const values = [
      {name: 'Odin'},
      {name: ['Rita', 'Scheeta', {Bobby: 'Bobby'}]},
      {name: [{s: 'Robert'}, 'Neil', 'Bobby']}
    ];
    values.forEach((value, index) => {
      const write = store.add(value, index + 1);
      write.onerror = () => writeErrors.push(`${index + 1}: ${write.error.name}`);
    });
  });
  await new Promise((resolve, reject) => {
    request.onsuccess = resolve;
    request.onerror = event => {
      event.preventDefault();
      reject(new Error(`open ${request.error.name}; transaction ${transactionError}; writes ${writeErrors.join(', ')}`));
    };
  });
  const index = database.transaction('records').objectStore('records').index('names');
  const keys = await Promise.all(['Odin', 'Rita', 'Scheeta', 'Neil', 'Bobby'].map(name => {
    const get = index.getKey(name);
    return new Promise((resolve, reject) => {
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    });
  }));
  assert_array_equals(keys, [1, 2, 2, 3, 3]);
}, 'multiEntry filters invalid array members without aborting upgrade writes');
