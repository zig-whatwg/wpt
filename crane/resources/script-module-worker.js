import { value } from "./script-module-worker-dep.js";
let importScriptsError = null;
try {
  importScripts("script-imported-ok.js");
} catch (e) {
  importScriptsError = e.name;
}
postMessage({ value, url: import.meta.url, importScriptsError, thisValue: String(this) });
