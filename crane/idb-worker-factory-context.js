try {
  const factory = self.indexedDB;
  self.postMessage({
    worker: self instanceof DedicatedWorkerGlobalScope,
    documentType: typeof document,
    factory: factory instanceof IDBFactory,
    same: factory === self.indexedDB,
    comparison: factory.cmp(1, 2),
  });
} catch (error) {
  self.postMessage({error: String(error)});
}
