import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { E as maybeRenderHead, T as renderTemplate, b as renderComponent } from "./sequence_CYEvADDU.mjs";
import { t as createComponent } from "./compiler_DMisAhpY.mjs";
import { t as renderScript } from "./script_DclYlCSm.mjs";
import { t as $$Layout } from "./Layout_B8lTsvuD.mjs";
//#region src/pages/reset-password.astro
var reset_password_exports = /* @__PURE__ */ __exportAll({
	default: () => $$ResetPassword,
	file: () => $$file,
	url: () => $$url
});
var $$ResetPassword = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "Layout", $$Layout, {}, { "default": async ($$result) => renderTemplate`${maybeRenderHead($$result)}<main class="h-[100dvh] overflow-hidden w-full flex flex-col md:flex-row"><!-- Mitad Izquierda (Logo y Branding) --><div class="hidden md:flex w-1/2 bg-[#06203D] flex-col items-center justify-center p-12"><div class="max-w-lg text-center"><img src="/Logo-Instituto-Antipobreza-Argentina.png" alt="Logo Instituto Antipobreza" class="w-full h-auto object-contain mx-auto mb-8"><h2 class="text-3xl font-bold text-white mb-4">Instituto Antipobreza Argentina</h2><p class="text-slate-300 text-lg">Restablezca la contraseña de su cuenta para volver a ingresar de manera segura.</p></div></div><!-- Mitad Derecha (Formulario) --><div class="w-full md:w-1/2 bg-white flex flex-1 items-center justify-center p-8 sm:p-12"><div class="w-full max-w-md"><div class="md:hidden text-center mb-8"><img src="/Logo-Instituto-Antipobreza-Argentina.png" alt="Logo Instituto Antipobreza" class="w-full h-auto object-contain mx-auto mb-4"></div><div class="mb-10 text-center md:text-left"><h1 class="text-3xl font-bold text-[#06203D] mb-3">Nueva Contraseña</h1><p class="text-slate-500">Ingrese su nueva contraseña para actualizar las credenciales de acceso.</p></div><form id="reset-form" class="space-y-6" novalidate><div><label for="new-password" class="block text-sm font-semibold text-[#06203D] mb-2">Nueva Contraseña</label><input type="password" id="new-password" name="newPassword" required autocomplete="new-password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[#06203D] focus:outline-none focus:ring-2 focus:ring-[#0073CF] focus:bg-white transition-all shadow-sm" placeholder="••••••••"></div><div><label for="confirm-password" class="block text-sm font-semibold text-[#06203D] mb-2">Confirmar Nueva Contraseña</label><input type="password" id="confirm-password" name="confirmPassword" required autocomplete="new-password" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-[#06203D] focus:outline-none focus:ring-2 focus:ring-[#0073CF] focus:bg-white transition-all shadow-sm" placeholder="••••••••"></div><div class="pt-4"><button type="submit" id="submit-btn" class="w-full bg-[#06203D] hover:bg-[#0073CF] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"><span>Actualizar Contraseña</span></button></div></form><div id="reset-message" class="hidden mt-4 p-4 rounded-lg text-sm" role="alert"></div><p class="mt-6 text-center text-sm text-slate-500"><a href="/" class="font-semibold text-[#0073CF] hover:underline">Volver a Iniciar Sesión</a></p></div></div></main>${renderScript($$result, "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/reset-password.astro?astro&type=script&index=0&lang.ts")}` })}`;
}, "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/reset-password.astro", void 0);
var $$file = "C:/Users/ndiaz/Documents/workspace/GitHub/masters/AntiPobrez/ProyectoAnti/src/pages/reset-password.astro";
var $$url = "/reset-password";
//#endregion
//#region \0virtual:astro:page:src/pages/reset-password@_@astro
var page = () => reset_password_exports;
//#endregion
export { page };
