// importScripts() of a script that does not exist throws a NetworkError:
// uncaught, it fails the registration with a TypeError.
importScripts("sw1-does-not-exist.js");
