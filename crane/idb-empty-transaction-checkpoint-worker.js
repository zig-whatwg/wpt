(async () => {
  const opened = indexedDB.open('idb-empty-worker-checkpoint');
  opened.onupgradeneeded = () => { opened.result.createObjectStore('records'); };
  const db = await new Promise((resolve, reject) => {
    opened.onsuccess = () => resolve(opened.result);
    opened.onerror = () => reject(opened.error);
  });
  setTimeout(() => {
    try {
      const tx = db.transaction('records', 'readwrite');
      const store = tx.objectStore('records');
      setTimeout(() => {
        let errorName = null;
        try {
          store.put({value: 1}, 1);
        } catch (error) {
          errorName = error.name;
        }
        db.close();
        postMessage({worker: self instanceof DedicatedWorkerGlobalScope, errorName});
      }, 0);
    } catch (error) {
      db.close();
      postMessage({setupError: String(error)});
    }
  }, 0);
})().catch(error => { postMessage({setupError: String(error)}); });
