// META: global=dedicatedworker

test(() => {
  assert_true(indexedDB instanceof IDBFactory);
  assert_equals(indexedDB, self.indexedDB);
  assert_equals(indexedDB.cmp(1, 2), -1);
}, 'A dedicated worker exposes its cached IndexedDB factory');
