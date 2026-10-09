// lf2-script-queue-removed-gc.html: each load logs the name its element carries.
lf2Log.push(String(document.currentScript && document.currentScript.getAttribute('data-name')));
