// Clears intervals the ways rs-utils.js's RandomPushSource does: from inside
// its own callback after it has fired more than once, and from outside after
// it has been rescheduled. Reports the tick counts to the page.
let inside = 0;
const insideId = setInterval(() => {
  inside++;
  if (inside === 3) clearInterval(insideId);
}, 1);

let outside = 0;
const outsideId = setInterval(() => { outside++; }, 1);

setTimeout(() => {
  clearInterval(outsideId);
  const atClear = outside;
  setTimeout(() => {
    postMessage({ inside, atClear, outside });
  }, 50);
}, 40);
