// workers3 lane: what this worker's code generation checks answer, under the CSP its response carries (wt-eval-csp-worker.js.headers:
// script-src 'self').
const results = { violations: [] };
self.addEventListener("securitypolicyviolation", e => {
  results.violations.push(e.violatedDirective + " " + e.blockedURI);
});
try { results.eval = String(eval("6 * 7")); } catch (e) { results.eval = e.name; }
try { results.fn = String(new Function("return 6 * 7")()); } catch (e) { results.fn = e.name; }
try {
  new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]));
  results.wasm = "allowed";
} catch (e) { results.wasm = e.name; }
// The violation events are tasks: report after them.
setTimeout(() => postMessage(results), 0);
