// META: title=Window teardown owns pending IndexedDB deletion tasks

async_test(t => {
  const names = Array.from({length: 4}, (_, i) => `idb-window-pending-delete-${Date.now()}-${i}`);
  const databases = [];
  for (const name of names) {
    const request = indexedDB.open(name);
    request.onerror = t.unreached_func('database creation must succeed');
    request.onsuccess = t.step_func(() => {
      databases.push(request.result);
      if (databases.length !== names.length) return;
      for (const database of databases) database.close();
      const states = names.map(name => indexedDB.deleteDatabase(name).readyState);
      assert_array_equals(states, ['pending', 'pending', 'pending', 'pending']);
      t.done();
    });
  }
}, 'The final window task can leave database deletions pending for teardown');
