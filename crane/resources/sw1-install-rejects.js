// An install event whose extend lifetime promise rejects: installFailed.
self.addEventListener("install", e => e.waitUntil(Promise.reject(new Error("no"))));
