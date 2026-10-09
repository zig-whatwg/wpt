// Run by ed-svg-script-removed-gc.html as a script-inserted external SVG
// script: it takes its own element out of the document, lets every reference
// to it go, collects, and makes SVG script elements that would take a freed
// slot - each logs "wrong" if it is ever sent the load event meant for this
// one.
log.push('ran');
document.currentScript.remove();
TestUtils.gc();
self.edChurn = [];
for (let i = 0; i < 2000; i++) {
  const other = document.createElementNS('http://www.w3.org/2000/svg', 'script');
  other.addEventListener('load', () => log.push('wrong'));
  edChurn.push(other);
}
TestUtils.gc();
