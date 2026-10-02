// The interface objects' prototype chains of this worker's realm.
const checks = [
  ["XMLHttpRequestEventTarget.prototype", Object.getPrototypeOf(XMLHttpRequestEventTarget.prototype) === EventTarget.prototype],
  ["ProgressEvent.prototype", Object.getPrototypeOf(ProgressEvent.prototype) === Event.prototype],
  ["XMLHttpRequest.prototype", Object.getPrototypeOf(XMLHttpRequest.prototype) === XMLHttpRequestEventTarget.prototype],
  ["MessageEvent.prototype", Object.getPrototypeOf(MessageEvent.prototype) === Event.prototype],
];
postMessage(checks.filter(([, ok]) => !ok).map(([name]) => name));
