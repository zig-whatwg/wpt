(() => {
  try {
    const request = indexedDB.open('idb-worker-request-brand');
    const result = {
      openRequest: request instanceof IDBOpenDBRequest,
      eventTarget: request instanceof EventTarget,
      listenerType: typeof request.addEventListener,
      initialState: request.readyState,
      events: []
    };
    if (!result.openRequest || !result.eventTarget) {
      // A legacy stub returns a rejected Promise. Report the wrong brand
      // immediately without letting that rejection obscure the assertion.
      if (request && typeof request.catch === 'function') request.catch(() => {});
      postMessage(result);
      return;
    }
    request.addEventListener('upgradeneeded', () => {
      result.events.push('upgrade');
      request.result.createObjectStore('records');
    });
    request.addEventListener('success', () => {
      result.events.push('success');
      request.result.close();
      indexedDB.deleteDatabase('idb-worker-request-brand');
      postMessage(result);
    });
    request.addEventListener('error', () => { postMessage({error: String(request.error)}); });
  } catch (error) {
    postMessage({error: String(error)});
  }
})();
