import {valueB} from "./dw-module-cycle-b.mjs?pipe=trickle(d1)";
export function valueA() { return "a"; }
window.dwCycleRuns++;
if (valueB() !== "b") throw new Error("wrong cycle import");
