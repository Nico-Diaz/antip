import { t as sequence } from "./chunks/sequence_CYEvADDU.mjs";
import { t as supabase } from "./chunks/supabase_OtmTd00b.mjs";
//#region src/middleware.ts
var protectedRoutes = ["/dashboard"];
var onRequest$1 = async (context, next) => {
	const { url, cookies, redirect } = context;
	const pathname = url.pathname;
	if (!protectedRoutes.some((route) => pathname.startsWith(route))) return next();
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (!accessToken || !refreshToken) return redirect(`/?redirect=${encodeURIComponent(pathname)}`);
	const { data: { user }, error } = await supabase.auth.getUser(accessToken);
	if (error || !user) {
		cookies.delete("sb-access-token", { path: "/" });
		cookies.delete("sb-refresh-token", { path: "/" });
		return redirect(`/?redirect=${encodeURIComponent(pathname)}`);
	}
	context.locals.user = user;
	return next();
};
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };
