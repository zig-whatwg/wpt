// importScripts() in a classic dedicated worker: HTML "import scripts into
// worker global scope" - parse every URL first, then for each one fetch a
// classic worker-imported script (no-cors, a JavaScript MIME type required)
// and run it with rethrow errors true.
importScripts("/resources/testharness.js");
importScripts("/common/get-host-info.sub.js");

test(() => {
  let caught;
  try {
    importScripts("script-imported-throw.js");
  } catch (e) {
    caught = e;
  }
  assert_equals(self.importedThrowRan, 1, "the imported script ran");
  assert_true(caught instanceof RangeError, "caught: " + caught);
  assert_equals(caught, self.importedError, "the object the script threw reaches the caller");
}, "what an imported script throws is rethrown to importScripts()'s caller, not reported");

test(() => {
  assert_throws_js(SyntaxError, () => importScripts("script-imported-syntax-error.js"));
  assert_equals(self.syntaxErrorRan, undefined, "a script that does not parse runs nothing");
}, "an imported script's parse error is thrown to the caller");

test(() => {
  const before = self.importedThrowRan;
  const url = get_host_info().HTTP_REMOTE_ORIGIN + "/crane/resources/script-imported-throw.js";
  assert_throws_dom("NetworkError", () => importScripts(url));
  assert_equals(self.importedThrowRan, before + 1, "a no-cors script from another origin runs");
}, "what a cross-origin imported script throws is a NetworkError: its errors are muted");

test(() => {
  assert_throws_dom("NetworkError",
      () => importScripts("script-imported-ok.js?pipe=header(Content-Type,text/plain)"));
  assert_equals(self.importedOk, undefined, "the script did not run");
}, "a response whose MIME type is not a JavaScript MIME type is a NetworkError");

test(() => {
  assert_throws_dom("NetworkError", () => importScripts("script-imported-missing.js"));
}, "a response whose status is not ok is a NetworkError");

test(() => {
  assert_throws_dom("SyntaxError", () => importScripts("script-imported-ok.js", "http://[::1"));
  assert_equals(self.importedOk, undefined, "no URL is fetched before every URL has parsed");
}, "a URL that does not parse throws SyntaxError before anything is fetched");

test(() => {
  importScripts("script-imported-ok.js", "script-imported-ok.js");
  assert_equals(self.importedOk, 2);
}, "each URL is fetched and run, in order");

done();
