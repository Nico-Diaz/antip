import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/forgot-password.ts
var forgot_password_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request }) => {
	try {
		const rawText = await request.text();
		if (!rawText) return new Response(JSON.stringify({ error: "Cuerpo de solicitud vacío" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { email } = JSON.parse(rawText);
		if (!email || typeof email !== "string") return new Response(JSON.stringify({ error: "Ingrese un correo electrónico válido" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const redirectTo = `${new URL(request.url).origin.replace(/\/$/, "")}/reset-password`;
		const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
		if (error) return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		return new Response(JSON.stringify({ message: "Instrucciones para restablecer la contraseña enviadas al correo." }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Forgot password error:", err);
		const errorMessage = err instanceof Error ? err.message : "Error al solicitar restablecimiento";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/forgot-password@_@ts
var page = () => forgot_password_exports;
//#endregion
export { page };
