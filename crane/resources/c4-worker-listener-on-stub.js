// A worker that adds an event listener to an EventTarget whose impl never
// chained to EventTarget's init and deinit - EventSource until 2026-10-01,
// OffscreenCanvas still - then reports back
// (c4-worker-listener-on-stub-target.html).
const kind = new URL(self.location.href).searchParams.get("kind");
const target = kind === "offscreencanvas"
  ? new OffscreenCanvas(1, 1)
  : new EventSource("/eventsource/resources/message.py?message=data%3A1%0A%0A");
target.addEventListener("message", () => {});
postMessage("ready");
