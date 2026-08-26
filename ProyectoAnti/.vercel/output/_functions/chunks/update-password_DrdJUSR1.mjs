import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/update-password.ts
var update_password_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request, cookies }) => {
	try {
		const rawText = await request.text();
		if (!rawText) return new Response(JSON.stringify({ error: "Cuerpo de solicitud vacío" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { password, accessToken } = JSON.parse(rawText);
		if (!password || typeof password !== "string" || password.length < 6) return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const token = accessToken || cookies.get("sb-access-token")?.value;
		if (!token) return new Response(JSON.stringify({ error: "Sesión o token de recuperación no válido" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const { data: userData, error: userError } = await supabase.auth.getUser(token);
		if (userError || !userData.user) return new Response(JSON.stringify({ error: "Token inválido o expirado" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const { error: updateError } = await supabase.auth.admin ? await supabase.auth.updateUser({ password }) : await supabase.auth.updateUser({ password });
		if (updateError) return new Response(JSON.stringify({ error: updateError.message }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		return new Response(JSON.stringify({ message: "Contraseña actualizada correctamente." }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Update password error:", err);
		const errorMessage = err instanceof Error ? err.message : "Error al actualizar contraseña";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/update-password@_@ts
var page = () => update_password_exports;
//#endregion
export { page };
