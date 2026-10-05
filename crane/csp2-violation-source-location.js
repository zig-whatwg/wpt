// Line 1. The eval below is on line 4, column 5 (1-based).
function evalHere() {
  try {
    eval("1");
  } catch (e) {
    return e;
  }
  return null;
}
