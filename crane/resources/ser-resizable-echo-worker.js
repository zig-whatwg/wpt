// Echo the message back, transferring the buffers listed in it.
onmessage = e => postMessage(e.data, e.data.transfer || []);
