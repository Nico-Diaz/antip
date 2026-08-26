import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/callback.ts
var callback_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	prerender: () => false
});
var GET = async ({ url, cookies, redirect }) => {
	const code = url.searchParams.get("code");
	const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");
	const next = url.searchParams.get("next") || "/dashboard";
	if (errorParam) {
		console.error("Callback error:", errorParam);
		return redirect(`/?error=${encodeURIComponent(errorParam)}`);
	}
	if (code) {
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);
		if (!error && data.session) {
			cookies.set("sb-access-token", data.session.access_token, {
				httpOnly: true,
				secure: url.protocol === "https:",
				sameSite: "lax",
				path: "/",
				maxAge: 604800
			});
			cookies.set("sb-refresh-token", data.session.refresh_token, {
				httpOnly: true,
				secure: url.protocol === "https:",
				sameSite: "lax",
				path: "/",
				maxAge: 604800
			});
			return redirect(next);
		}
		if (error) {
			console.error("Exchange code error:", error);
			return redirect(`/?error=${encodeURIComponent(error.message)}`);
		}
	}
	return redirect("/?error=No+se+recibio+el+codigo+de+autenticacion");
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/callback@_@ts
var page = () => callback_exports;
//#endregion
export { page };
