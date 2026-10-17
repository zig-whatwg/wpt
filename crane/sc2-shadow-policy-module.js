import { referrer } from '/html/semantics/scripting-1/the-script-element/module/resources/referrer-checker.py?name=sc2-shadow-policy-static';
export const staticReferrer = referrer;
export const dynamicReferrer = (await import('/html/semantics/scripting-1/the-script-element/module/resources/referrer-checker.py?name=sc2-shadow-policy-dynamic')).referrer;
