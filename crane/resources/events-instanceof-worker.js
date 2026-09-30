// A dedicated worker's realm: events made here, and the message event the
// engine dispatches here, are instances of this realm's interfaces.
const results = {};
results.ctorEvent = new Event("x") instanceof Event;
results.ctorCustomEvent = new CustomEvent("x") instanceof Event && new CustomEvent("x") instanceof CustomEvent;
onmessage = (e) => {
  results.messageIsMessageEvent = e instanceof MessageEvent;
  results.messageIsEvent = e instanceof Event;
  postMessage(results);
};
