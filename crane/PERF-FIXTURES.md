# Where the WPT runner's time went

These pages are not conformance tests. They are the measurement chain that
found why `encoding/` took 6,284 shard-seconds for 774,980 subtests — 8.11ms
each — and they are kept so nobody has to walk the dead ends a second time.

Run any of them like a normal test; the numbers come back in the subtest names:

```
zig build wpt -- --quiet --journal=/tmp/j.jsonl crane/scale-10k.html
```

The journal record carries the phase split: `nav_ms` (context + harness
install), `load_ms` (fetch + parse + synchronous scripts), `duration_ms` (poll
wait for completion), `wall_ms` (total).

## The answer

**testharness.js's human-facing reporting, which nothing in a headless runner
reads.** `setup({ output: false })`, injected by `loadTestHarness`, turns off
both the completion-time results table and the per-assertion stack capture in
`expose_assert`. The two most expensive files in the corpus went 182.9s → 7.9s
and 183.5s → 3.4s, with identical statuses and subtest counts.

## The chain, in order

| Page | Question | Finding |
|---|---|---|
| `subtest-cost.html` | What does one encoding subtest do? | Breaks the body down by operation |
| `href-cost.html` | Is it `a.href`? | Isolates a single set |
| `throw-cost.html` | Is it the NotImplemented throw? | ~75us per V8 boundary crossing — the constant everything else is measured against |
| `harness-cost.html` | Is it subtest registration? | ~400us each, well short of 8.11ms |
| `harness-scaling.html` | Is the harness O(n²)? | **No.** Refuted |
| `encoder-loop-cost.html` | Is it the shared 27,985-iteration setup loop? | **No.** The full encoder is 4.0us/op ≈ 0.1s total. Refuted |
| `scale-1k.html` / `scale-10k.html` | Two points, identical but for subtest count | **Yes.** 2.163 ms/subtest in the wait phase vs 0.069 to run one |

## Two mistakes worth not repeating

**Wall-time parity bounds the difference, not the shared parts.**
`iso2022jp-encode-form-errors-han.html` (21,269 subtests NOTRUN) and its
`-href` sibling (21,269 that ran) cost the same 183s. That correctly says the
subtests are cheap. It was then read as "therefore the shared setup loop is the
cost" — but a third thing fit both observations better: completion-time work
proportional to subtest *count*, which both files had 21,269 of.

**A fixture that times out measures the timeout.** An early version of
`encoder-loop-cost.html` created 2,000 `async_test`s and never resolved them,
so the page ran to the harness timeout and its wall clock was that timeout.
It briefly produced a confident "6.9ms per subtest" that meant nothing. Any
page here must complete on its own; `scale-1k`/`scale-10k` are built that way
deliberately, which is what makes the two-point subtraction valid.

## Keeping them honest

`scale-1k` and `scale-10k` double as a regression guard. If the wait phase
starts scaling with subtest count again, something has re-enabled per-subtest
completion work. The recorded baselines are in `scale-1k.html`'s header.
