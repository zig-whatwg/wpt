// META: global=window,worker
test(t => {
  const oldPrepare = Object.getOwnPropertyDescriptor(Error, 'prepareStackTrace');
  const oldName = Object.getOwnPropertyDescriptor(Error.prototype, 'name');
  const oldMessage = Object.getOwnPropertyDescriptor(Error.prototype, 'message');
  let calls = 0;
  let stack, repeated;
  try {
    const hostile = {configurable:true, get() {calls++; throw 'unexpected formatter';}};
    Object.defineProperty(Error, 'prepareStackTrace', hostile);
    Object.defineProperty(Error.prototype, 'name', hostile);
    Object.defineProperty(Error.prototype, 'message', hostile);
    const tag = new WebAssembly.Tag({parameters:[]});
    function wj1Capture() {return new WebAssembly.Exception(tag, [], {traceStack:true});}
    const exception = wj1Capture();
    const get = Object.getOwnPropertyDescriptor(WebAssembly.Exception.prototype, 'stack').get;
    stack = get.call(exception);
    repeated = get.call(exception);
  } finally {
    if (oldPrepare) Object.defineProperty(Error, 'prepareStackTrace', oldPrepare);
    else delete Error.prepareStackTrace;
    Object.defineProperty(Error.prototype, 'name', oldName);
    Object.defineProperty(Error.prototype, 'message', oldMessage);
  }
  assert_equals(calls, 0);
  assert_equals(typeof stack, 'string');
  assert_true(stack.includes('wj1Capture'));
  assert_equals(repeated, stack);
}, 'Exception stack captures native frames without invoking Error formatting hooks');
