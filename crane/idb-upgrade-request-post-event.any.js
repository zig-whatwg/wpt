// META: title=IndexedDB clears the upgrade request association after dispatch
// META: global=window,worker

for (const outcome of ['commit', 'user abort', 'request failure']) {
  async_test(t => {
    const name = `crane-idb-post-event-${self.location.pathname}-${outcome}`;
    const request = indexedDB.open(name, 1);
    let database;
    let sawOpenResult = false;
    let sawPostEventTask = false;
    let sawMicrotask = false;
    const finish = () => {
      if (sawOpenResult && sawPostEventTask) t.done();
    };
    t.add_cleanup(() => {
      if (database) database.close();
      indexedDB.deleteDatabase(name);
    });
    request.onupgradeneeded = t.step_func(() => {
      database = request.result;
      const transaction = request.transaction;
      const store = database.createObjectStore('records');
      transaction.addEventListener(outcome === 'commit' ? 'complete' : 'abort',
          t.step_func(() => {
        assert_equals(request.transaction, transaction, 'association during dispatch');
        queueMicrotask(t.step_func(() => {
          assert_equals(request.transaction, transaction, 'association during callback checkpoint');
          sawMicrotask = true;
        }));
        t.step_timeout(t.step_func(() => {
          assert_true(sawMicrotask);
          assert_equals(request.transaction, null, 'association after dispatch');
          if (outcome !== 'commit' && !sawOpenResult) {
            assert_equals(request.readyState, 'pending');
            assert_throws_dom('InvalidStateError', () => request.result);
          }
          sawPostEventTask = true;
          finish();
        }), 0);
      }));
      if (outcome === 'user abort') transaction.abort();
      if (outcome === 'request failure') {
        store.add('first', 1);
        store.add('duplicate', 1);
      }
    });
    request.onsuccess = t.step_func(() => {
      assert_equals(outcome, 'commit');
      assert_equals(request.transaction, null, 'association at open success');
      sawOpenResult = true;
      finish();
    });
    request.onerror = t.step_func(event => {
      event.preventDefault();
      assert_not_equals(outcome, 'commit');
      assert_equals(request.error.name, 'AbortError');
      assert_equals(request.transaction, null, 'association at open error');
      sawOpenResult = true;
      finish();
    });
  }, `${outcome} clears request.transaction after dispatch and its callback microtasks`);
}
