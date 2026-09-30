self.addEventListener("error", e => postMessage(e.error.name + ": " + e.error.message));
throw new RangeError("thrown by a module worker");
