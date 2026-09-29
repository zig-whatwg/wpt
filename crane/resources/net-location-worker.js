// Reports this dedicated worker's location, getter by getter.
const keys = ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "origin"];
const out = {};
for (const k of keys) out[k] = location[k];
out.string = String(location);
postMessage(out);
