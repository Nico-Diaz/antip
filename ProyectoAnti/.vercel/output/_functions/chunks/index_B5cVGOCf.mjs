import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { E as maybeRenderHead, F as createAstro, O as addAttribute, T as renderTemplate, b as renderComponent, k as createRenderInstruction } from "./sequence_CYEvADDU.mjs";
import { t as createComponent } from "./compiler_DMisAhpY.mjs";
import { t as $$Layout } from "./Layout_w9nw11YJ.mjs";
//#region node_modules/astro/dist/runtime/server/render/script.js
async function renderScript(result, id) {
	const inlined = result.inlinedScripts.get(id);
	let content = "";
	if (inlined != null) {
		if (inlined) content = `<script type="module">${inlined}<\/script>`;
	} else {
		const resolved = await result.resolve(id);
		content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
	}
	return createRenderInstruction({
		type: "script",
		id,
		content
	});
}
//#endregion
//#region src/pages/index.astro
var pages_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Index,
	file: () => $$file,
	url: () => ""
});
createAstro("https://astro.build");
var $$Index = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Index;
	const redirectParam = Astro.url.searchParams.get("redirect");
	const redirect = redirectParam && redirectParam !== "/" ? redirectParam : "/dashboard";
	const error = Astro.url.searchParams.get("error");
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="h-[100dvh] overflow-hidden w-full flex flex-col md:flex-row"><!-- Mitad Izquierda (Logo y Branding) --><div class="hidden md:flex w-1/2 bg-[#06203D] flex-col items-center justify-center p-12"><div class="max-w-lg text-center"><img src="/Logo-Instituto-Antipobreza-Argentina.png" alt="Logo Instituto Antipobreza" class="w-full h-auto object-contain mx-auto mb-8"><h2 class="text-3xl font-bold text-white mb-4">Instituto Antipobreza Argentina</h2><p class="text-slate-300 text-lg">Acceda a las herramientas internas del Instituto Antipobreza de manera segura y eficiente.</p></div></div><!-- Mitad Derecha (Formulario) --><div class="w-full md:w-1/2 bg-white flex flex-1 items-center justify-center p-8 sm:p-12"><div class="w-full max-w-md"><!-- Encabezado Móvil --><div class="md:hidden text-center mb-8"><img src="/Logo-Instituto-Antipobreza-Argentina.png" alt="Logo Instituto Antipobreza" class="w-full h-auto object-contain mx-auto mb-4"></div><div class="mb-10 text-center md:text-left"><h1 id="auth-title" class="text-3xl font-bold text-[#06203D] mb-3">Iniciar Sesión</h1><p id="auth-subtitle" class="text-slate-500">Ingrese sus credenciales para acceder al panel</p></div>${error && renderTemplate`<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">${decodeURIComponent(error)}</div>`}<!-- Formulario Email/Password --><form id="login-form" class="space-y-6"${addAttribute(redirect, "data-redirect")} data-mode="login" novalidate><div><label for="email" class="block text-sm font-semibold text-[#06203D] mb-2">Correo Electrónico</label><input type="email" id="email" name="email" required autocomplete="email" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[#06203D] focus:outline-none focus:ring-2 focus:ring-[#0073CF] focus:bg-white transition-all shadow-sm" placeholder="correo@institutoantipobreza.org"></div><div><label for="password" class="block text-sm font-semibold text-[#06203D] mb-2">Contraseña</label><input type="password" id="password" name="password" required autocomplete="current-password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[#06203D] focus:outline-none focus:ring-2 focus:ring-[#0073CF] focus:bg-white transition-all shadow-sm" placeholder="••••••••"></div><div class="pt-4"><button type="submit" id="login-btn" class="w-full bg-[#06203D] hover:bg-[#0073CF] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><span id="submit-label">Ingresar</span></button></div></form><div id="login-error" class="hidden mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert"></div></div></div></main>${renderScript($$result, "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/index.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/index.astro", void 0);
var $$file = "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/index.astro";
//#endregion
//#region \0virtual:astro:page:src/pages/index@_@astro
var page = () => pages_exports;
//#endregion
export { page };
