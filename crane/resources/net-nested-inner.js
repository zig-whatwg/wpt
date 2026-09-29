// The inner worker, made by net-nested-outer.js: exercises the one thing its
// query names and reports the result.
const what = location.search.slice(1);
if (what === "timeout") {
  setTimeout(() => postMessage("timeout fired"), 0);
} else if (what === "interval") {
  let n = 0;
  const id = setInterval(() => { if (++n === 3) { clearInterval(id); postMessage("interval fired 3 times"); } }, 0);
} else if (what === "fetch-data") {
  fetch("data:text/plain,hello").then(r => r.text()).then(
    t => postMessage("fetched " + t), e => postMessage("fetch rejected: " + e));
} else if (what === "fetch-http") {
  fetch("/common/text-plain.txt").then(r => r.text()).then(
    t => postMessage("fetched " + t.trim()), e => postMessage("fetch rejected: " + e));
} else if (what === "message") {
  postMessage("inner alive");
}
