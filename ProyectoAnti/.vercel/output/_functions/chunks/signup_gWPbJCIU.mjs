import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/signup.ts
var signup_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var sessionCookieOptions = {
	httpOnly: true,
	secure: true,
	sameSite: "lax",
	path: "/",
	maxAge: 604800
};
var POST = async ({ request, cookies }) => {
	try {
		const rawText = await request.text();
		if (!rawText) return new Response(JSON.stringify({ error: "Cuerpo de solicitud vacío" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { email, password } = JSON.parse(rawText);
		if (!email || !password) return new Response(JSON.stringify({ error: "Complete todos los campos" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (typeof email !== "string" || typeof password !== "string" || password.length < 6) return new Response(JSON.stringify({ error: "La contraseña debe tener al menos 6 caracteres" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const origin = new URL(request.url).origin.replace(/\/$/, "");
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: origin }
		});
		if (error) {
			let friendlyError = error.message;
			const msgLower = error.message.toLowerCase();
			if (msgLower.includes("already registered") || msgLower.includes("already exists") || msgLower.includes("unique constraint")) friendlyError = "Ya existe una cuenta registrada con este correo electrónico.";
			return new Response(JSON.stringify({ error: friendlyError }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}
		if (data.user && data.user.identities && data.user.identities.length === 0) return new Response(JSON.stringify({ error: "Ya existe una cuenta registrada con este correo electrónico." }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		if (data.session) {
			cookies.set("sb-access-token", data.session.access_token, sessionCookieOptions);
			cookies.set("sb-refresh-token", data.session.refresh_token, sessionCookieOptions);
		}
		return new Response(JSON.stringify({
			user: data.user,
			session: data.session
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("Signup error:", err);
		const errorMessage = err instanceof Error ? err.message : "Error al procesar el registro";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/signup@_@ts
var page = () => signup_exports;
//#endregion
export { page };
