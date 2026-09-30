import { value } from "./script-module-worker-dep.js";
onconnect = e => e.ports[0].postMessage({ value, url: import.meta.url });
