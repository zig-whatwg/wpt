import result from './swx-module-dependency.js';
if (typeof postMessage === 'function') postMessage(result);
else self.onconnect = event => event.ports[0].postMessage(result);
