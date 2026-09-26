// What ReflectionTests.resolveUrl (html/dom/reflection.js) needs from <a>:
// the href setter and the protocol, host, pathname, search and hash getters.
// Supplied from the URL constructor, and only when the real ones do not work,
// so that the reflection suite measures reflection rather than
// HTMLHyperlinkElementUtils. The href GETTER is left as it is: the suite's own
// a.href tests keep testing the real thing.
(function () {
  try {
    const a = document.createElement("a");
    a.href = "x";
    if (typeof a.protocol === "string" && typeof a.pathname === "string") return;
  } catch (e) {}
  const proto = HTMLAnchorElement.prototype;
  function parsed(a) {
    const href = a.getAttribute("href");
    if (href === null) return null;
    try { return new URL(href, document.baseURI); } catch (e) { return null; }
  }
  let own = null;
  for (let o = proto; o && !own; o = Object.getPrototypeOf(o)) own = Object.getOwnPropertyDescriptor(o, "href");
  Object.defineProperty(proto, "href", {
    configurable: true,
    enumerable: true,
    get: own ? own.get : undefined,
    set(value) { this.setAttribute("href", value); },
  });
  for (const part of ["protocol", "host", "pathname", "search", "hash"]) {
    Object.defineProperty(proto, part, {
      configurable: true,
      enumerable: true,
      get() {
        const url = parsed(this);
        if (url) return url[part];
        return part === "protocol" ? ":" : "";
      },
    });
  }
})();
