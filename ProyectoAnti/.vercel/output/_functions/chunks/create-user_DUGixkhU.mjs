import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/create-user.ts
var create_user_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var ADMIN_EMAIL = "admin@antipobreza.org";
var POST = async ({ request, cookies }) => {
	try {
		const accessToken = cookies.get("sb-access-token")?.value;
		if (!accessToken) return new Response(JSON.stringify({ error: "No autenticado" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
		if (userError || !user) return new Response(JSON.stringify({ error: "Usuario no válido" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		if (user.email !== ADMIN_EMAIL) return new Response(JSON.stringify({ error: "No tienes permisos para crear usuarios" }), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const rawText = await request.text();
		if (!rawText) return new Response(JSON.stringify({ error: "Cuerpo de solicitud vacío" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { email, password, full_name } = JSON.parse(rawText);
		if (!email || !password) return new Response(JSON.stringify({ error: "Email y contraseña son requeridos" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (typeof password !== "string" || password.length < 6) return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { data, error } = await supabase.auth.admin.createUser({
			email,
			password,
			email_confirm: true,
			user_metadata: { full_name: full_name || "" }
		});
		if (error) return new Response(JSON.stringify({ error: error.message }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		return new Response(JSON.stringify({
			success: true,
			user: {
				id: data.user?.id,
				email: data.user?.email,
				full_name: full_name || ""
			}
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		const error = err instanceof Error ? err.message : "Error desconocido";
		return new Response(JSON.stringify({ error }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/create-user@_@ts
var page = () => create_user_exports;
//#endregion
export { page };
