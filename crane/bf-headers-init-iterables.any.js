// META: global=window,dedicatedworker
// META: title=HeadersInit: every iterable is a sequence of pairs
//
// WebIDL 3.2.25 step 11.2: converting to HeadersInit =
// (sequence<sequence<ByteString>> or record<ByteString, ByteString>), an
// Object whose @@iterator is not undefined is the sequence member, created
// from that method - a Headers object (its pair iterator yields [name,
// value]), a Map, a generator - and only an Object without one is the record.
// Crane's binding tested IsArray instead, so a Headers object given as init
// or as `headers` read as a record of its own enumerable properties (none):
// every header was dropped, fetch() included. Each string is a ByteString
// (3.2.11): a code unit above 0xFF is a TypeError.

"use strict";

test(() => {
  const headers = new Headers(new Headers({ "x-a": "1", "x-b": "2" }));
  assert_equals(headers.get("x-a"), "1");
  assert_equals(headers.get("x-b"), "2");
}, "new Headers(headers) copies every header");

test(() => {
  const request = new Request("/", { headers: new Headers({ "x-a": "1" }) });
  assert_equals(request.headers.get("x-a"), "1");
}, "new Request(url, { headers }) keeps every header of a Headers object");

test(() => {
  const response = new Response(null, { headers: new Headers({ "x-a": "1" }) });
  assert_equals(response.headers.get("x-a"), "1");
}, "new Response(body, { headers }) keeps every header of a Headers object");

test(() => {
  const headers = new Headers(new Map([["x-a", "1"], ["x-b", "2"]]));
  assert_array_equals([...headers].flat(), ["x-a", "1", "x-b", "2"]);
}, "a Map is a sequence of pairs");

test(() => {
  const headers = new Headers((function* () {
    yield ["x-a", "1"];
    yield new Set(["x-b", "2"]);
  })());
  assert_array_equals([...headers].flat(), ["x-a", "1", "x-b", "2"]);
}, "a generator of iterables is a sequence of pairs");

test(() => {
  assert_throws_js(TypeError, () => new Headers([["x-a", "\u0100"]]));
  assert_throws_js(TypeError, () => new Headers([["x-\u0100", "1"]]));
  assert_throws_js(TypeError, () => new Headers({ "x-a": "\uFFFF" }));
  assert_throws_js(TypeError, () => new Request("/", { headers: { "x-a": "\uD800" } }));
}, "a name or value with a code unit above 0xFF is a TypeError");

test(() => {
  assert_equals(new Headers([["x-a", "\u00E9"]]).get("x-a"), "\u00E9");
  assert_equals(new Headers({ "x-a": "\u00FF" }).get("x-a"), "\u00FF");
}, "code units up to 0xFF are a ByteString");

test(() => {
  assert_throws_js(TypeError, () => new Headers("x-a: 1"));
  assert_throws_js(TypeError, () => new Headers(1));
  assert_throws_js(TypeError, () => new Headers({ [Symbol.iterator]: 1 }));
  assert_throws_js(TypeError, () => new Headers([["x-a", "1"], "x-b"]));
}, "anything else is a TypeError");

promise_test(async () => {
  const response = await fetch("/fetch/api/resources/inspect-headers.py?headers=x-bf", {
    headers: new Headers({ "x-bf": "sent" }),
  });
  assert_equals(response.headers.get("x-request-x-bf"), "sent");
}, "fetch(url, { headers }) sends every header of a Headers object");

promise_test(async () => {
  const response = await fetch("/fetch/api/resources/inspect-headers.py?headers=x-bf", {
    headers: new Map([["x-bf", "map"]]),
  });
  assert_equals(response.headers.get("x-request-x-bf"), "map");
}, "fetch(url, { headers }) sends every pair of a Map");
