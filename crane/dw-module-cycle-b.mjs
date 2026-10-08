import {valueA} from "./dw-module-cycle-a.mjs";
export function valueB() { return "b"; }
window.dwCycleRuns++;
if (valueA() !== "a") throw new Error("wrong cycle import");
