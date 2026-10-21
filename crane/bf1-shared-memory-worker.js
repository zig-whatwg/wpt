onmessage = event => {
  const buffer = event.data;
  const view = new Int32Array(buffer);
  view[0] = 31;
  postMessage({buffer, view});
};
