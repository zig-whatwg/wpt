// META: global=window,dedicatedworker
// META: title=WebAssembly memory and table descriptors take the i64 address type
//
// WebAssembly JS API, "Memory" and "Table" constructors: the descriptor's
// `address` member (AddressType, "i32" or "i64") selects the address type, and
// `initial`/`maximum` are AddressValues - BigInts for "i64"
// (AddressValueToU64). The wasm/core harness (async_index.js,
// reinitializeRegistry) builds `spectest.table64` this way before every file;
// when it throws, the registry stays `{}` and every later instantiation fails.

test(() => {
  const table = new WebAssembly.Table({
    initial: 10n, maximum: 20n, element: "anyfunc", address: "i64"
  });
  assert_true(table instanceof WebAssembly.Table);
}, "new WebAssembly.Table with address i64 and BigInt limits");

test(() => {
  const table = new WebAssembly.Table({ initial: 10n, element: "anyfunc", address: "i64" });
  assert_equals(table.length, 10n);
}, "an i64 table's length is a BigInt (U64ToAddressValue)");

test(() => {
  const memory = new WebAssembly.Memory({ initial: 1n, maximum: 2n, address: "i64" });
  assert_true(memory instanceof WebAssembly.Memory);
  assert_equals(memory.buffer.byteLength, 65536);
  assert_equals(memory.grow(1n), 1n, "an i64 memory's grow takes and returns BigInts");
}, "new WebAssembly.Memory with address i64 and BigInt limits");

test(() => {
  assert_throws_js(TypeError, () => new WebAssembly.Table({
    initial: 10, element: "anyfunc", address: "i64"
  }), "an i64 table's initial must be a BigInt");
  assert_throws_js(TypeError, () => new WebAssembly.Table({
    initial: 10, element: "anyfunc", address: "i65"
  }), "an unknown address type");
  assert_throws_js(TypeError, () => new WebAssembly.Memory({ initial: 1n, index: "i64" }),
    "`index`, the member's name before the memory64 proposal renamed it, is no member");
}, "address i64 converts initial with ToBigInt; an unknown address type throws");

test(() => {
  const table = new WebAssembly.Table({ initial: 3, element: "anyfunc", address: "i32" });
  assert_equals(table.length, 3);
  assert_equals(new WebAssembly.Table({ initial: 2, element: "anyfunc" }).length, 2);
}, "address i32, and no address, keep Number limits");

test(() => {
  const order = [];
  const logged = (name, value) => ({
    get() {
      order.push(name);
      return {
        toString() { order.push(name + " toString"); return value; },
        valueOf() { order.push(name + " valueOf"); return value; },
      };
    },
  });
  new WebAssembly.Table(Object.defineProperties({}, {
    maximum: logged("maximum", 2), initial: logged("initial", 1),
    element: logged("element", "anyfunc"), address: logged("address", "i32"),
  }));
  assert_array_equals(order, [
    "address", "address toString", "element", "element toString",
    "initial", "initial valueOf", "maximum", "maximum valueOf",
  ]);
}, "Order of evaluation for a descriptor with address");

for (const [name, args] of [["Memory", [{ initial: 1 }]],
                            ["Table", [{ initial: 1, element: "anyfunc" }]]]) {
  test(() => {
    const C = WebAssembly[name];
    const own = Object.getOwnPropertyDescriptor(WebAssembly, name);
    assert_equals(own.value, C);
    assert_true(own.writable, "writable");
    assert_false(own.enumerable, "enumerable");
    assert_true(own.configurable, "configurable");
    const proto = Object.getOwnPropertyDescriptor(C, "prototype");
    assert_false(proto.writable, "prototype writable");
    assert_false(proto.enumerable, "prototype enumerable");
    assert_false(proto.configurable, "prototype configurable");
    assert_equals(C.prototype.constructor, C);
    assert_equals(C.length, 1);
    assert_equals(C.name, name);
    assert_equals(Object.getPrototypeOf(new C(...args)), C.prototype);
  }, `WebAssembly.${name} keeps its interface object's properties`);

  test(() => {
    const C = WebAssembly[name];
    class Sub extends C {}
    const sub = new Sub(...args);
    assert_equals(Object.getPrototypeOf(sub), Sub.prototype);
    assert_true(sub instanceof C);
  }, `a subclass of WebAssembly.${name} gets the subclass's prototype`);
}

// (module (memory i64 1)) - memory limits flag 0x04 is the i64 address type.
const memory64Module = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x05, 0x03, 0x01, 0x04, 0x01]);

// (module (table i64 1 funcref)) - table limits flag 0x04.
const table64Module = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x04, 0x04, 0x01, 0x70, 0x04, 0x01]);

test(() => {
  assert_true(WebAssembly.validate(memory64Module), "i64 memory");
  assert_true(WebAssembly.validate(table64Module), "i64 table");
}, "modules declaring an i64 memory or table validate");

promise_test(async () => {
  const module = await WebAssembly.compile(memory64Module);
  assert_true(module instanceof WebAssembly.Module);
}, "a module declaring an i64 memory compiles");
