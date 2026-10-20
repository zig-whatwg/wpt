(async () => {
  try {
    let completed = 0;
    let bytes = 0;
    const start = performance.now();
    for (let i = 0; i < 1000; ++i) {
      const response = await fetch('/common/blank.html?sr1-cost=' + i, {cache: 'no-store'});
      if (response.status !== 200) throw new Error('Unexpected status: ' + response.status);
      bytes += (await response.text()).length;
      ++completed;
    }
    postMessage({completed, bytes, elapsed: performance.now() - start});
  } catch (error) {
    postMessage({error: String(error)});
  }
})();
