// META: global=window,dedicatedworker
// META: title=JSON module bodies use UTF-8 decode, including BOM removal
promise_test(async () => {
  const module = await import('data:application/json,%EF%BB%BF%7B%22value%22%3A%22ok%22%7D', {with: {type: 'json'}});
  assert_equals(module.default.value, 'ok');
}, 'A leading UTF-8 BOM is stripped before JSON parsing');
