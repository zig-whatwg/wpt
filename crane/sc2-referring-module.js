import { referrer } from "/html/semantics/scripting-1/the-script-element/module/resources/referrer-checker.py?name=sc2-static";
export const staticReferrer = referrer;
export const dynamicReferrer = import("/html/semantics/scripting-1/the-script-element/module/resources/referrer-checker.py?name=sc2-dynamic").then(module => module.referrer);
