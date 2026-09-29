// Reports this shared worker's location, getter by getter, to each connection.
onconnect = e => {
  const keys = ["href", "protocol", "host", "hostname", "port", "pathname", "search", "hash", "origin"];
  const out = {};
  for (const k of keys) out[k] = location[k];
  out.string = String(location);
  e.ports[0].postMessage(out);
};
