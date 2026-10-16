let connections = 0;
onconnect = e => {
  connections++;
  const suffix = location.search.endsWith("&same") ? " " + connections : "";
  e.ports[0].postMessage(location.search + suffix);
};
