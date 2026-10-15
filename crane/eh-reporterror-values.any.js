// META: global=window,worker
// META: title=reportError preserves values and obeys the reporting-mode guard
setup({allow_uncaught_exception: true});
for (const value of [undefined, null, 1, 'error', Symbol('error'), {marker: 1}]) {
  test(t => {
    let observed;
    const listener = e => { observed = e; e.preventDefault(); };
    self.addEventListener('error', listener);
    t.add_cleanup(() => self.removeEventListener('error', listener));
    self.reportError(value);
    assert_true(observed instanceof ErrorEvent);
    assert_equals(observed.error, value);
    assert_equals(observed.target, self);
    assert_true(observed.cancelable);
    assert_true(observed.isTrusted);
  }, `reportError preserves ${typeof value} ${String(value)}`);
}
test(t => {
  const value = new TypeError('original');
  let calls = 0;
  self.onerror = function(message, source, line, column, error) {
    ++calls;
    assert_equals(arguments.length, 5);
    assert_equals(this, self);
    assert_equals(error, value);
    self.reportError('nested');
    return true;
  };
  t.add_cleanup(() => { self.onerror = null; });
  self.reportError(value);
  assert_equals(calls, 1, 'nested reporting does not reenter the same global');
  self.reportError(value);
  assert_equals(calls, 2, 'reporting mode is reset after dispatch');
}, 'reportError calls onerror with five arguments and guards reentrancy');
test(() => {
  assert_throws_js(TypeError, () => self.reportError());
}, 'reportError requires an argument');
