# Harness overhead

Two hundred copies of one trivial test: an empty `test(() => {})`, the harness and nothing else.

They measure what a WPT runner costs per test file before any engine work: page load, testharness.js,
and the runner's own result reporting. They are run over the same runner count in Crane's runner and in
a browser's `wpt run` (lane chromeref1, 2026-11-04), so a worklist's wall time can be split into harness
and engine. Every file has to pass in every engine; they are not WPT tests and never join the worklist.
