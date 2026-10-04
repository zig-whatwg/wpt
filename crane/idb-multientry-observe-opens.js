// Load the upstream test body unchanged. These observers keep only strings;
// they neither retain requests outside their existing owners nor cancel events.
(() => {
  const audit = async_test('All three upstream multiEntry opens succeed');
  const observations = [];
  let successes = 0;
  function recordTransaction(event) {
    const error = event.target.error;
    observations.push(`${event.type}: ${error ? error.name : 'null'}`);
  }
  function observeUpgrade(event) {
    const transaction = event.target.transaction;
    transaction.addEventListener('error', recordTransaction);
    transaction.addEventListener('abort', recordTransaction);
  }
  function recordSuccess() {
    if (++successes === 3) audit.done();
  }
  const recordError = audit.step_func_done(event => {
    assert_unreached(`open.error: ${event.target.error.name}; ${observations.join('; ')}`);
  });
  const originalCreatedb = self.createdb;
  self.createdb = function(...args) {
    const request = originalCreatedb.apply(this, args);
    request.addEventListener('upgradeneeded', observeUpgrade);
    request.addEventListener('success', recordSuccess);
    request.addEventListener('error', recordError);
    return request;
  };
})();
