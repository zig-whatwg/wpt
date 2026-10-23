// Same URL and name in both owner sites: their storage partitions must still
// select different SharedWorker instances and different HTTP cache entries.
const instanceToken = Math.random().toString();
onconnect = event => {
  const port = event.ports[0];
  port.onmessage = async ({data}) => {
    if (data.close) { close(); return; }
    try {
      performance.clearResourceTimings();
      const response = await fetch(data.url, {mode: 'same-origin', cache: data.cache});
      const text = await response.text();
      const entry = await new Promise(resolve => {
        const observer = new PerformanceObserver(list => {
          const found = list.getEntriesByName(data.url)[0];
          if (found) { observer.disconnect(); resolve(found); }
        });
        observer.observe({type: 'resource', buffered: true});
      });
      port.postMessage({instanceToken, text, transferSize: entry.transferSize});
    } catch (error) {
      port.postMessage({instanceToken, error: error.name});
    }
  };
};
