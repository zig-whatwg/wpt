// A service worker whose script throws: Run Service Worker's start status
// is an abrupt completion, and Update rejects with a TypeError.
throw new Error("sw1-throws");
