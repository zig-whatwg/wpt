promise_test(async t => {
  const violation = new Promise(resolve => document.addEventListener('securitypolicyviolation', resolve, {once: true}));
  assert_throws_js(EvalError, () => {
    eval('1 + 1');
  });
  const event = await violation;
  assert_equals(event.blockedURI, 'eval');
  assert_equals(event.sourceFile, new URL('cn-eval-external-location.js', location.href).href);
  assert_equals(event.lineNumber, 4, 'external eval source line');
}, 'An eval CSP violation keeps the external script source location');
