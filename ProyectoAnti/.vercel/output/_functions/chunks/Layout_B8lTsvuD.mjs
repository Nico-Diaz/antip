import { D as renderHead, F as createAstro, O as addAttribute, S as renderSlot, T as renderTemplate } from "./sequence_CYEvADDU.mjs";
import { t as createComponent } from "./compiler_DMisAhpY.mjs";
//#region src/layouts/Layout.astro
createAstro("https://astro.build");
var $$Layout = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Layout;
	return renderTemplate`<html lang="es" data-astro-cid-ju4pidww><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" href="/favicon.ico"><meta name="generator"${addAttribute(Astro.generator, "content")}><meta name="description" content="Panel Administrativo del Instituto Antipobreza"><title>Instituto Antipobreza - Login</title>${renderHead($$result)}</head><body data-astro-cid-ju4pidww>${renderSlot($$result, $$slots["default"])}</body></html>`;
}, "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/layouts/Layout.astro", void 0);
//#endregion
export { $$Layout as t };
