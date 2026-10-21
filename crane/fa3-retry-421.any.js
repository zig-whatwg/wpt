// META: global=window,worker
// META: script=/common/utils.js
// META: script=/common/get-host-info.sub.js

promise_test(async () => {
  const url = '/fetch/connection-pool/resources/network-partition-key.py?' +
    `status=421&uuid=${token()}&partition_id=${get_host_info().ORIGIN}` +
    '&dispatch=check_partition&addcounter=true';
  const response = await fetch(url, {method: 'POST', body: 'fa3'});
  assert_equals(response.status, 421, 'the retry stops after the second 421');
  assert_equals(await response.text(),
    'ok. Request was sent 2 times. 2 connections were created.');
}, 'A replayable upload retries a 421 exactly once over a new connection');
