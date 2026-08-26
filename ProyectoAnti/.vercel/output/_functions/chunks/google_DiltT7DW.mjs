import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/google.ts
var google_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url, redirect }) => {
	try {
		const next = url.searchParams.get("next") || "/dashboard";
		const callbackUrl = `${url.origin.replace(/\/$/, "")}/api/auth/callback?next=${encodeURIComponent(next)}`;
		const { data, error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: callbackUrl,
				skipBrowserRedirect: true
			}
		});
		if (error) {
			console.error("Google OAuth error:", error);
			return redirect(`/?error=${encodeURIComponent(error.message)}`);
		}
		if (data?.url) return redirect(data.url);
		return redirect("/?error=No+se+pudo+generar+la+URL+de+autenticacion");
	} catch (err) {
		console.error("Google endpoint error:", err);
		const msg = err instanceof Error ? err.message : "Error al conectar con Google";
		return redirect(`/?error=${encodeURIComponent(msg)}`);
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/google@_@ts
var page = () => google_exports;
//#endregion
export { page };
