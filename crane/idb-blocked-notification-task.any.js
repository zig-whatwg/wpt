// META: title=IndexedDB captures blocked status after versionchange dispatch
// META: global=window,worker
// META: script=/IndexedDB/resources/support.js

for (const operation of ['upgrade', 'delete']) {
  indexeddb_test((t, database) => {
    database.createObjectStore('records');
  }, (t, database) => {
    const events = [];
    database.onversionchange = t.step_func(() => {
      events.push('versionchange');
      // Closing in a later task must not retract an already queued blocked event.
      t.step_timeout(() => database.close(), 0);
    });
    const request = operation === 'upgrade'
        ? indexedDB.open(database.name, 2) : indexedDB.deleteDatabase(database.name);
    request.onerror = t.unreached_func(`${operation} should succeed after close`);
    request.onblocked = t.step_func(event => {
      assert_equals(event.target, request);
      events.push('blocked');
    });
    request.onsuccess = t.step_func_done(() => {
      if (operation === 'upgrade') request.result.close();
      events.push('success');
      assert_array_equals(events, ['versionchange', 'blocked', 'success']);
    });
  }, `${operation} delivers the blocked event when versionchange leaves a connection open`);
}
