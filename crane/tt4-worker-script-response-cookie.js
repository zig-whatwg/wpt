if ('onconnect' in self) {
  onconnect = event => event.ports[0].postMessage('ready');
} else {
  postMessage('ready');
}
