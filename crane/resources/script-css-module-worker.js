import("./script-css-module.css", { with: { type: "css" } })
  .then(() => postMessage("loaded"), e => postMessage(e.name));
