// Makes 64 blob URLs of 256 KiB each (16 MiB) in this worker and never
// revokes them; answers with the last one's length once fetched.
const chunkLength = 256 * 1024;
const chunk = "x".repeat(chunkLength);
const urls = [];
for (let i = 0; i < 64; i++) urls.push(URL.createObjectURL(new Blob([chunk, String(i).padStart(2, "0")])));
fetch(urls[63]).then(r => r.text()).then(text => postMessage(text.length), e => postMessage(String(e)));
