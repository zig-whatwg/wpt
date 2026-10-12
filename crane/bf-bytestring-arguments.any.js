// META: global=window,dedicatedworker
// META: title=ByteString arguments and members: a code unit above 0xFF is a TypeError
//
// WebIDL 3.2.11: converting to ByteString is ToString, then "If the value of
// any element of x is greater than 255, then throw a TypeError." Crane's
// binding converted ByteString like USVString - both are `[]const u8` in Zig -
// so a header value of U+0100 was stored as its UTF-8 bytes. Codegen now marks
// ByteString arguments (byte_string_arguments) and dictionary members
// (byte_string_members) for the binding to check. Names below are valid
// tokens and values valid header values in every other way, so only the
// ByteString conversion can throw.

"use strict";

test(() => {
  const headers = new Headers();
  assert_throws_js(TypeError, () => headers.append("x-a", "\u0100"));
  assert_throws_js(TypeError, () => headers.set("x-a", "\uFF83\uFF7D\uFF84"));
  assert_throws_js(TypeError, () => headers.set("x-a", "\uD800"));
  assert_false(headers.has("x-a"));
}, "Headers append() and set(): a value above 0xFF is a TypeError");

test(() => {
  const headers = new Headers({ "x-a": "1" });
  assert_throws_js(TypeError, () => headers.get("x-\u0100"));
  assert_throws_js(TypeError, () => headers.has("x-\u0100"));
  assert_throws_js(TypeError, () => headers.delete("x-\u0100"));
  assert_equals(headers.get("x-a"), "1");
}, "Headers get(), has() and delete(): a name above 0xFF is a TypeError");

test(() => {
  const headers = new Headers();
  headers.append("x-a", "\u00E9\u00FF");
  assert_equals(headers.get("x-a"), "\u00E9\u00FF");
}, "Headers append(): code units up to 0xFF are a ByteString");

test(() => {
  assert_throws_js(TypeError, () => new Request("/", { method: "P\u0100ST" }));
  assert_throws_js(TypeError, () => new Response(null, { statusText: "O\u0100" }));
  assert_equals(new Response(null, { statusText: "\u00E9" }).statusText, "\u00E9");
}, "RequestInit.method and ResponseInit.statusText are ByteStrings");

test(() => {
  const xhr = new XMLHttpRequest();
  assert_throws_js(TypeError, () => xhr.open("G\u0100T", "/"));
  assert_throws_js(TypeError, () => xhr.open("G\u0100T", "/", true));
  xhr.open("GET", "/");
  assert_throws_js(TypeError, () => xhr.setRequestHeader("x-a", "\u0100"));
  assert_throws_js(TypeError, () => xhr.getResponseHeader("x-\u0100"));
}, "XMLHttpRequest open(), setRequestHeader() and getResponseHeader() take ByteStrings");
