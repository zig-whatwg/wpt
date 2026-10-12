let ddRequestId = 0;
function ddCommand(frame, command, value) {
  return new Promise(resolve => {
    const id = ++ddRequestId;
    function onMessage(event) {
      if (event.source !== frame.contentWindow || event.data.id !== id) return;
      window.removeEventListener("message", onMessage);
      resolve(event.data.result);
    }
    window.addEventListener("message", onMessage);
    frame.contentWindow.postMessage({id, command, value}, "*");
  });
}
function ddFrame(t, host = location.hostname, port = location.port, sandbox) {
  return new Promise(resolve => {
    const frame = document.createElement("iframe");
    t.add_cleanup(() => frame.remove());
    if (sandbox !== undefined) frame.sandbox = sandbox;
    const url = new URL("dd-domain-child.sub.html", location.href);
    url.hostname = host;
    url.port = port;
    frame.onload = () => resolve(frame);
    frame.src = url;
    document.body.appendChild(frame);
  });
}
