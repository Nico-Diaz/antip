import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/logout.ts
var logout_exports = /* @__PURE__ */ __exportAll({ POST: () => POST });
var POST = async ({ cookies, redirect }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (accessToken && refreshToken) try {
		await supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: refreshToken
		});
		await supabase.auth.signOut();
	} catch (e) {
		console.error("Error in signOut:", e);
	}
	cookies.delete("sb-access-token", { path: "/" });
	cookies.delete("sb-refresh-token", { path: "/" });
	return redirect("/");
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/logout@_@ts
var page = () => logout_exports;
//#endregion
export { page };
