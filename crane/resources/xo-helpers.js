// Crane xo- tests: shared origin records (document.domain through inherited
// documents). Every test makes its own owner document, so no test depends on
// a domain an earlier one set: a domain opt-in cannot be undone.
let xoRequestId = 0;

function xoCommand(frame, command, value) {
  return new Promise(resolve => {
    const id = ++xoRequestId;
    function onMessage(event) {
      if (event.source !== frame.contentWindow || event.data.id !== id) return;
      window.removeEventListener("message", onMessage);
      resolve(event.data.result);
    }
    window.addEventListener("message", onMessage);
    frame.contentWindow.postMessage({id, command, value}, "*");
  });
}

function xoChildUrl(host = location.hostname, port = location.port) {
  const url = new URL("resources/xo-child.sub.html", location.href);
  url.hostname = host;
  url.port = port;
  return url.href;
}

// A frame of `doc` loading the command child at `host`, appended to `doc`'s
// body; resolves once it loaded.
function xoLoadChild(t, doc, host = location.hostname, port = location.port) {
  return new Promise(resolve => {
    const frame = doc.createElement("iframe");
    t.add_cleanup(() => frame.remove());
    frame.onload = () => resolve(frame);
    frame.src = xoChildUrl(host, port);
    doc.body.appendChild(frame);
  });
}

// A fresh same-origin owner document: a frame of this page loading the
// command child. Its domain is unset.
async function xoOwner(t) {
  const container = await xoLoadChild(t, document);
  return {container, owner: container.contentDocument};
}

// An initial about:blank frame appended to `doc`: its document inherits
// `doc`'s origin.
function xoBlankFrame(t, doc) {
  const frame = doc.createElement("iframe");
  t.add_cleanup(() => frame.remove());
  doc.body.appendChild(frame);
  return frame;
}

function xoWait(t, ms) {
  return new Promise(resolve => t.step_timeout(resolve, ms));
}
