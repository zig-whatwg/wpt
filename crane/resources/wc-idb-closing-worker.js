'use strict';
// A worker that calls close() and then gives IndexedDB a task to queue, in the
// same task. close() sets the closing flag; this task runs to its end, and
// what it posts is still delivered (HTML "close()", and
// workers/interfaces/WorkerGlobalScope/close/sending-messages). A closing
// worker's loop discards a task as it is queued: Crane's WorkerEventLoop
// calls its drop before queueTask returns.

function attempt(report, key, steps) {
  try {
    steps();
    report[key] = 'returned';
  } catch (e) {
    report[key] = e.name;
  }
}

self.onmessage = (event) => {
  const { name, step } = event.data;
  const open = indexedDB.open(name, 1);
  open.onupgradeneeded = () => open.result.createObjectStore('s');
  open.onerror = () => self.postMessage({ error: 'open failed' });
  open.onsuccess = () => {
    const db = open.result;
    const report = { step };
    if (step === 'transaction-after-close') {
      // IDBDatabase transaction(): a new transaction's task is queued at once.
      self.close();
      let transaction = null;
      attempt(report, 'transaction', () => { transaction = db.transaction('s', 'readwrite'); });
      if (transaction) attempt(report, 'put', () => { transaction.objectStore('s').put(1, 'k'); });
    } else if (step === 'request-after-close') {
      // A transaction that could not start yet has no task queued. When the
      // writer ahead of it aborts, its next request queues its task.
      const first = db.transaction('s', 'readwrite');
      const second = db.transaction('s', 'readwrite');
      self.close();
      attempt(report, 'abort', () => { first.abort(); });
      attempt(report, 'put', () => { second.objectStore('s').put(2, 'k'); });
    }
    self.postMessage(report);
  };
};
