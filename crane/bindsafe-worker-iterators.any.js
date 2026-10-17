// META: global=dedicatedworker,sharedworker,serviceworker
// META: title=Pair iterables iterate in every kind of worker, many times
//
// WebIDL 3.7.10: each realm has one "%<Interface> Iterator Prototype%" per
// iterable interface, shared by every iterator of that interface, whose
// class string is "<Interface> Iterator". Crane's V8 adapter makes it from a
// template kept per isolate; a worker realm's template storage ends with the
// realm, and it left every iterator prototype template behind - one Global per
// iterable interface iterated per worker (lane bindsafe; leaks --atExit over
// this file names any that remain). The file iterates Headers, FormData and
// URLSearchParams through each of their iteration methods, many times.

const ROUNDS = 64;

function iterables() {
  const headers = new Headers([['a', '1'], ['b', '2']]);
  const form = new FormData();
  form.append('a', '1');
  form.append('b', '2');
  const params = new URLSearchParams('a=1&b=2');
  return { Headers: headers, FormData: form, URLSearchParams: params };
}

for (const [name, make] of [
  ['Headers', () => iterables().Headers],
  ['FormData', () => iterables().FormData],
  ['URLSearchParams', () => iterables().URLSearchParams],
]) {
  test(() => {
    for (let round = 0; round < ROUNDS; round++) {
      const target = make();
      assert_array_equals([...target].map(([k, v]) => k + '=' + v), ['a=1', 'b=2'], '@@iterator');
      assert_array_equals([...target.entries()].map(([k, v]) => k + '=' + v), ['a=1', 'b=2'], 'entries()');
      assert_array_equals([...target.keys()], ['a', 'b'], 'keys()');
      assert_array_equals([...target.values()], ['1', '2'], 'values()');
    }
  }, `${name} iterates through each of its iteration methods, ${ROUNDS} times`);

  test(() => {
    const first = Object.getPrototypeOf(make().keys());
    for (let round = 0; round < ROUNDS; round++) {
      const target = make();
      assert_equals(Object.getPrototypeOf(target.entries()), first, 'entries()');
      assert_equals(Object.getPrototypeOf(target.values()), first, 'values()');
      assert_equals(Object.getPrototypeOf(target[Symbol.iterator]()), first, '@@iterator');
    }
    assert_equals(Object.prototype.toString.call(first), `[object ${name} Iterator]`);
    assert_equals(Object.getPrototypeOf(first), Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())),
      'its [[Prototype]] is %IteratorPrototype%');
  }, `every ${name} iterator in this realm shares one iterator prototype`);
}
