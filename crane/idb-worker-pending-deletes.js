// The allocator leak log checks ownership after close() discards worker tasks.
// No deletion event is required after the worker's closing flag is set.
const names = Array.from({length: 4}, (_, i) => `idb-pending-delete-${Date.now()}-${i}`);
const databases = [];
for (const name of names) {
  const request = indexedDB.open(name);
  request.onerror = () => {
    postMessage({error: request.error.name});
    close();
  };
  request.onsuccess = () => {
    databases.push(request.result);
    if (databases.length !== names.length) return;
    for (const database of databases) database.close();
    const states = names.map(name => indexedDB.deleteDatabase(name).readyState);
    postMessage({states});
    close();
  };
}
