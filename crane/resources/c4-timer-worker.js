// A worker that arms and clears timers on request (c4-worker-timers-per-global.html).
onmessage = e => {
  const cmd = e.data;
  if (cmd.op === "arm") {
    const id = setTimeout(() => postMessage({ op: "fired", id }), cmd.delay);
    postMessage({ op: "armed", id });
  } else if (cmd.op === "clear") {
    for (const id of cmd.ids) clearTimeout(id);
    postMessage({ op: "cleared" });
  } else if (cmd.op === "clear-interval") {
    for (const id of cmd.ids) clearInterval(id);
    postMessage({ op: "cleared" });
  }
};
