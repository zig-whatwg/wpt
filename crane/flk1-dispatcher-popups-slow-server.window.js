// META: title=Two popups driven through the dispatcher still run when the server answers the opener's polls slowly
// META: timeout=long
// META: script=/common/utils.js
// META: script=/common/dispatcher/dispatcher.js

// html/cross-origin-embedder-policy/credentialless/fetch.https.window.js with
// its server made slow on purpose: an opener with 24 receive() loops - the
// dispatcher's limiter(6) keeps six polls in flight for as long as each poll
// takes longer than the pause before the next - and two popups whose own
// requests (dispatcher.js, then their polls and replies) go to the same host.
// The browsers queue requests beyond a host's six connections in arrival
// order (Chromium: TransportClientSocketPool::ProcessPendingRequest; Gecko:
// nsHttpConnectionMgr's pending queue), so the popups' requests take their
// turn among the opener's polls and every round trip completes.
//
// Crane gave a freed connection to whichever request asked next, and the
// opener's next poll always asked first: the popups' requests never started,
// no executor ran, and the upstream file's twelve subtests timed out whenever
// a sweep's 32 runners slowed the server enough (13 -> 1, lane flk1). Here
// the slowness is certain, not likely: every dispatcher request this window
// makes is answered 100 ms late (wptserve's trickle pipe). 24 pollers that
// pause 55 ms on average between polls keep six requests in flight once a
// poll takes about 18 ms (24 * t / (t + 55) >= 6), so 100 ms is five times
// what it takes.
const real_fetch = self.fetch;
self.fetch = (input, init) => {
  const slow = typeof input === 'string' && input.includes(dispatcher_path);
  return real_fetch(slow ? input + '&pipe=trickle(d0.1)' : input, init);
};

promise_test(async (t) => {
  const executors = [token(), token()];
  const popups = executors.map((uuid) => window.open(`/common/dispatcher/executor.html?uuid=${uuid}`));
  t.add_cleanup(() => popups.forEach((popup) => popup.close()));
  const trips = [];
  for (let i = 0; i < 12; i++) {
    executors.forEach((uuid, which) => {
      const reply = token();
      // As the upstream file does: the send is not awaited, so all 24
      // receive() loops poll from the start.
      send(uuid, `send("${reply}", "popup ${which} trip ${i}");`);
      trips.push(receive(reply));
    });
  }
  const answers = await Promise.all(trips);
  for (let i = 0; i < 12; i++) {
    assert_equals(answers[2 * i], `popup 0 trip ${i}`);
    assert_equals(answers[2 * i + 1], `popup 1 trip ${i}`);
  }
}, 'every round trip to two popups completes while 24 slow polls keep six connections busy');
