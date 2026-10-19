import {destination} from './wf1-fetch-metadata.py?static';
async function report(port) {
  const dynamic = await import('./wf1-fetch-metadata.py?dynamic');
  port.postMessage([destination, dynamic.destination]);
}
if ('SharedWorkerGlobalScope' in self && self instanceof SharedWorkerGlobalScope) {
  onconnect = e => report(e.ports[0]);
} else {
  report(self);
}
