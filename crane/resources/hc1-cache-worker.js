onmessage = async e => {
  const url = e.data;
  const response = await fetch(url);
  const text = await response.text();
  const entry = await new Promise(resolve => {
    new PerformanceObserver(list => {
      const found = list.getEntriesByName(url)[0];
      if (found) resolve(found);
    }).observe({ type: "resource", buffered: true });
  });
  postMessage({ text, transferSize: entry.transferSize, deliveryType: entry.deliveryType });
};
