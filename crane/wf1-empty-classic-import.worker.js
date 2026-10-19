importScripts('/resources/testharness.js');

test(() => {
  assert_equals(importScripts('/workers/support/imported_script.py?mime=text/javascript'), undefined);
}, 'An empty HTTP JavaScript response is a successful classic worker import');

test(() => {
  assert_equals(importScripts('data:text/javascript,'), undefined);
}, 'An empty data URL JavaScript response is a successful classic worker import');

for (const status of [204, 205]) {
  test(() => {
    assert_equals(importScripts(`/workers/support/imported_script.py?mime=text/javascript&pipe=status(${status})`), undefined);
  }, `An empty ${status} JavaScript response is a successful classic worker import`);
}

done();
