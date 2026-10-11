const params = new URLSearchParams(document.currentScript.getAttribute('data-params') || '');
const label = params.get('encoding') || 'utf-16le';
const patterns = {
  'utf-8': [0x41],
  'utf-16le': [0x34,0x6c,0x41,0x00],
  'shift_jis': [0x90,0x85,0x41],
  'iso-2022-jp': [0x1b,0x24,0x42,0x3f,0x65,0x1b,0x28,0x42,0x41]
};
const pattern = patterns[label];
const input = new Uint8Array(Math.floor(3 * 1024 * 1024 / pattern.length) * pattern.length);
for (let i = 0; i < input.length; ++i) input[i] = pattern[i % pattern.length];
if (params.has('malformed')) {
  for (let i = 4096; i < input.length; i += 4096) {
    input[i] = label === 'utf-16le' ? 0x00 : 0xff;
    if (label === 'utf-16le') input[i + 1] = 0xd8;
  }
}
const decoder = new TextDecoder(label);
decoder.decode(input.subarray(0, Math.min(input.length, 32768)));
const start = performance.now();
let decoded;
if (params.has('small')) {
  for (let i = 0; i < 30000; ++i) decoded = decoder.decode(input.subarray(0, 100));
} else {
  decoded = decoder.decode(input);
}
const elapsed = performance.now() - start;
test(() => {
  if (label === 'utf-8') {
    assert_true(decoded === 'A'.repeat(params.has('small') ? 100 : input.length), 'the complete ASCII output matches');
  } else if (params.has('malformed')) {
    assert_true(decoded.includes('\ufffd'), 'malformed input produces replacement characters');
    assert_true(decoded.endsWith('\u6c34A'), 'decoding continues through the final complete pattern');
  } else {
    assert_true(decoded === '\u6c34A'.repeat(input.length / pattern.length), 'the complete decoded output matches');
  }
}, 'TextDecoder ' + label + (params.has('small') ? ' 30000 small decodes' : params.has('malformed') ? ' malformed' : ' valid') + ': ' + elapsed.toFixed(3) + ' ms for ' + (params.has('small') ? 3000000 : input.length) + ' bytes');
