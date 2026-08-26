import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/pages/api/auth/me.ts
var me_exports = /* @__PURE__ */ __exportAll({ GET: () => GET });
var GET = async ({ cookies }) => {
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (!accessToken || !refreshToken) return new Response(JSON.stringify({ user: null }), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
	const { data: { user }, error } = await supabase.auth.getUser(accessToken);
	if (error || !user) {
		cookies.delete("sb-access-token", { path: "/" });
		cookies.delete("sb-refresh-token", { path: "/" });
		return new Response(JSON.stringify({ user: null }), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	}
	return new Response(JSON.stringify({ user }), {
		status: 200,
		headers: { "Content-Type": "application/json" }
	});
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/auth/me@_@ts
var page = () => me_exports;
//#endregion
export { page };
