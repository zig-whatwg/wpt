// Chrome 154 and Safari 27 defer the CSP check until the handler is used.
// wpt.fyi cc74d2669f, targeting-for-inline-handler-on-disconnected-element:
// both report click line 12, while Firefox reports installation line 11.
promise_test(async t => {
  const element = document.createElement('div');
  document.documentElement.appendChild(element);
  t.add_cleanup(() => element.remove());
  const events = [];
  element.addEventListener('securitypolicyviolation', event => events.push(event));
  element.setAttribute('onclick', 'void(0)');
  await new Promise(resolve => t.step_timeout(resolve, 0));
  assert_equals(events.length, 0, 'installation alone must not CSP-check the handler');
  const violation = new Promise(resolve => element.addEventListener('securitypolicyviolation', resolve, {once: true}));
  element.click();
  const event = await violation;
  assert_equals(event.blockedURI, 'inline');
  assert_equals(event.effectiveDirective, 'script-src-attr');
  assert_equals(event.target, element);
  assert_equals(event.sample, 'void(0)');
  assert_equals(event.sourceFile, new URL('cn-inline-handler-set-location.js', location.href).href);
  assert_equals(event.lineNumber, 14, 'first-use source line');
}, 'An installed inline handler is CSP-checked and reported only on first use');
