// One request per worker; close the scope after reporting its outcome so a
// later test cannot reuse a shared scope's settings.
async function requestAndReport(port, {url, operation}) {
  let outcome;
  try {
    if (operation === "xhr") {
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = resolve;
        xhr.onerror = () => reject(new TypeError("network error"));
        xhr.send();
      });
    } else {
      await fetch(url, {mode: "no-cors"});
    }
    outcome = "loaded";
  } catch (error) {
    outcome = error.name;
  }
  port.postMessage(outcome);
  self.close();
}
self.onmessage = event => requestAndReport(self, event.data);
self.onconnect = event => {
  const port = event.ports[0];
  port.onmessage = message => requestAndReport(port, message.data);
  port.start();
};
