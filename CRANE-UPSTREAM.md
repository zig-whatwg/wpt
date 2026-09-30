# Crane's WPT fork: upstream base

This tree is upstream web-platform-tests plus Crane's own additions. Its
history does not contain upstream's: each sync takes upstream's TREE, not its
commits, so the fork stays small. The upstream commit a sync is based on is
recorded here and in `.crane-upstream-revision` (one line, the full SHA; Crane's
WPT runner reads it for the wptreport's `run_info.revision`).

| | Upstream commit | Date |
|-|-----------------|------|
| Current base | `afe89a5df4dcc7c6bcb317b07d6eee31a383c466` | 2026-09-30 (wpt.fyi's aligned Chrome/Firefox/Safari runs) |
| Previous base | `fae291ef55a6871a9f7836e30eff5f4271ba3954` | 2025-12-23 (the flattened snapshot, dcf9091f5) |

## What Crane adds on top of upstream

- `crane/` - Crane's own tests (not WPT; never uploaded to wpt.fyi).
- `tools/serve/serve.py` - `spawn` start method on macOS (semaphore leaks with `fork`).
- `tools/wpt/browser.py`, `tools/wpt/run.py` - `crane` registered as a `wpt run` product.
- `tools/wptrunner/wptrunner/browsers/crane.py` and `crane` in
  `tools/wptrunner/wptrunner/products.py` `BUILTIN_PRODUCTS` - the wptrunner
  product (before upstream 02eb560ce this was a line in `browsers/__init__.py`).
- `.crane-upstream-revision` and this file.

No upstream test file is modified. (The h2 EOF fix Crane once carried in
`tools/wptserve/wptserve/server.py` is upstream's own `data == b''` form, so it
needs no patch from afe89a5 on.)

## Syncing to a newer upstream

Pick the revision of wpt.fyi's latest aligned stable runs:

```bash
curl -s 'https://wpt.fyi/api/runs?aligned&label=master&label=stable&max-count=1&product=chrome&product=firefox&product=safari' \
  | python3 -c 'import json,sys; print({r["full_revision_hash"] for r in json.load(sys.stdin)})'
```

Then, in a clone of this fork with upstream fetched (a shallow fetch down to the
previous base is enough: `git fetch --shallow-since=<previous base date> upstream master`):

```bash
PREV=afe89a5df4dcc7c6bcb317b07d6eee31a383c466   # "Current base" above
NEW=<new upstream SHA>
git merge-tree --write-tree --merge-base=$PREV main $NEW   # prints the merged tree, then any conflicts
git read-tree -u --reset <tree>                             # resolve conflicts by hand, then git add
printf '%s\n' $NEW > .crane-upstream-revision               # and move the table above
git commit-tree $(git write-tree) -p main -m "Sync upstream WPT to $NEW"
```

The commit's only parent is the fork's `main`, so `main` fast-forwards to it.
Push it as a branch (`crane-upstream-<short sha>`), never force-push `main`.
Regenerate MANIFEST.json (`./wpt manifest`) and Crane's worklist
(`python3 tools/wpt_subset.py` in Crane) against the new tree.
