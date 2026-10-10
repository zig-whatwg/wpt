// Shared by the od-*.html Crane tests (lane ownerdoc): a node keeps its node
// document alive for as long as the node lives. Blink's Node traces its
// TreeScope (Node::Trace visits tree_scope_, core/dom/node.cc), and with it
// the document and the document's tree; WebKit's Node counts itself on its
// document (Document::incrementReferencingNodeCount in Node::Node). So a node
// script holds answers ownerDocument with its own document, whole, whatever
// script let go of.
//
// Every node is made inside a helper, so nothing but the node (or the native
// holder script keeps) names its document. TestUtils.gc() collects
// synchronously; the deferred teardown frees a collected tree between tasks,
// so a task turn follows each collection. The churn reissues freed slots, so
// a document freed under its node answers with whatever took its slot - or
// crashes the runner, which is what Crane did before this lane.
"use strict";

function odNextTask(t) {
  return new Promise(resolve => t.step_timeout(resolve, 0));
}

async function odCollect(t) {
  for (let i = 0; i < 3; i++) {
    await odNextTask(t);
    TestUtils.gc();
  }
  await odNextTask(t);
  const churn = [];
  for (let i = 0; i < 1500; i++) {
    churn.push(document.createElement("span"), document.createTextNode("churn"));
  }
  for (let i = 0; i < 20; i++) churn.push(document.implementation.createHTMLDocument("churn"));
  TestUtils.gc();
  await odNextTask(t);
  return churn.length;
}

// The documents a script can make without a window, each with an expando on
// the document and one on its document element, and the content type that
// tells them apart.
const odDocumentMakers = {
  createHTMLDocument: {
    contentType: "text/html",
    make: () => document.implementation.createHTMLDocument("od"),
  },
  createDocument: {
    contentType: "application/xhtml+xml",
    make: () => document.implementation.createDocument("http://www.w3.org/1999/xhtml", "html", null),
  },
  DOMParser: {
    contentType: "text/html",
    make: () => new DOMParser().parseFromString("<!doctype html><title>od</title><body>", "text/html"),
  },
};

function odMakeDocument(kind) {
  const doc = odDocumentMakers[kind].make();
  doc.od = "doc:" + kind;
  doc.documentElement.od = "html:" + kind;
  return doc;
}

// `node`'s node document is the document `odMakeDocument(kind)` made, intact:
// the same wrapper (its expando), its tree (and the expando on its document
// element), and still working.
function odAssertDocumentKept(node, kind) {
  assert_true(!!(self.TestUtils && TestUtils.gc), "TestUtils.gc is available");
  const doc = node.ownerDocument;
  assert_not_equals(doc, null, "ownerDocument");
  assert_equals(doc.nodeType, Node.DOCUMENT_NODE, "ownerDocument is a document");
  assert_equals(doc.contentType, odDocumentMakers[kind].contentType, "its content type");
  assert_equals(doc.od, "doc:" + kind, "the same document, with its expando");
  assert_not_equals(doc.documentElement, null, "its tree is kept");
  assert_equals(doc.documentElement.localName, "html");
  assert_equals(doc.documentElement.od, "html:" + kind, "with its wrappers");
  const fresh = doc.createElement("i");
  doc.documentElement.appendChild(fresh);
  assert_equals(fresh.ownerDocument, doc, "the document still makes nodes");
  assert_equals(doc.documentElement.lastChild, fresh, "and takes them");
  return doc;
}
