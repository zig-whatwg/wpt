window.sc2RedirectResult = import("./sc2-redirect-dependency.js").then(module => module.url);
window.sc2RedirectResult.catch(() => {});
