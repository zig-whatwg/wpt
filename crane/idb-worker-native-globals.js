try {
  // WebIDL 3.7.6 uses the interface that declares each attribute.
  // WorkerGlobalScope is not [Global]; these accessors belong on its prototype.
  const inspect = (name, Interface, method) => {
    const descriptor = Object.getOwnPropertyDescriptor(WorkerGlobalScope.prototype, name);
    const value = self[name];
    return {
      hasOwnProperty: Object.getOwnPropertyDescriptor(self, name) !== undefined,
      getterType: typeof (descriptor && descriptor.get),
      hasValue: !!descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value'),
      brand: value instanceof Interface,
      prototype: Object.getPrototypeOf(value) === Interface.prototype,
      method: value[method] === Interface.prototype[method]
    };
  };
  postMessage({
    crypto: inspect('crypto', Crypto, 'getRandomValues'),
    indexedDB: inspect('indexedDB', IDBFactory, 'open')
  });
} catch (error) {
  postMessage({error: String(error)});
}
