self.importedThrowRan = (self.importedThrowRan || 0) + 1;
throw self.importedError = new RangeError("thrown by an imported script");
