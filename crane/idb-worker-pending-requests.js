// The allocator leak log checks the transaction task and accepted arguments
// after close() discards further worker tasks. No result event is required.
const request = indexedDB.open(`idb-pending-requests-${Date.now()}`);
request.onerror = () => {
  postMessage({error: request.error.name});
  close();
};
request.onupgradeneeded = () => {
  request.result.createObjectStore('records').put('value', 1);
};
request.onsuccess = () => {
  try {
    const transaction = request.result.transaction('records');
    const store = transaction.objectStore('records');
    const requests = [store.get(1), store.getKey(1), store.getAll(), store.getAllKeys()];
    postMessage({states: requests.map(request => request.readyState)});
    close();
  } catch (error) {
    postMessage({error: String(error)});
    close();
  }
};
