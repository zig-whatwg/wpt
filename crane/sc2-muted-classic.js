window.sc2RedirectResult = import("./sc2-redirect-dependency.js?pipe=header(Access-Control-Allow-Origin,*)");
window.sc2RedirectResult.catch(() => {});
