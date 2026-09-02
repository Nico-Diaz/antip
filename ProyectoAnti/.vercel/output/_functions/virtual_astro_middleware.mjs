import { t as sequence } from "./chunks/sequence_CYEvADDU.mjs";
import { t as supabase } from "./chunks/supabase_OtmTd00b.mjs";
import { t as isUserAdmin } from "./chunks/auth_CoTxHK05.mjs";
//#region src/middleware.ts
var protectedRoutes = ["/dashboard", "/admin"];
var onRequest$1 = async (context, next) => {
	const { url, cookies, redirect } = context;
	const pathname = url.pathname;
	const accessToken = cookies.get("sb-access-token")?.value;
	const refreshToken = cookies.get("sb-refresh-token")?.value;
	if (pathname === "/" && accessToken) {
		const { data: { user: user2 } } = await supabase.auth.getUser(accessToken);
		if (user2) return redirect("/dashboard");
	}
	if (!protectedRoutes.some((route) => pathname.startsWith(route))) return next();
	if (!accessToken || !refreshToken) {
		console.warn("[Middleware] Sin tokens en cookies para ruta protegida:", pathname);
		return redirect(`/?redirect=${encodeURIComponent(pathname)}&error=${encodeURIComponent("Debe iniciar sesión para acceder al panel.")}`);
	}
	let user = null;
	let error = null;
	try {
		const res = await supabase.auth.getUser(accessToken);
		user = res.data?.user || null;
		error = res.error || null;
	} catch (e) {
		error = e;
	}
	if ((error || !user) && refreshToken) try {
		console.log("[Middleware] Intentando renovar sesión con refresh_token...");
		const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
		if (!refreshError && refreshData.session && refreshData.user) {
			user = refreshData.user;
			error = null;
			const sessionCookieOptions = {
				httpOnly: true,
				secure: true,
				sameSite: "lax",
				path: "/",
				maxAge: 604800
			};
			cookies.set("sb-access-token", refreshData.session.access_token, sessionCookieOptions);
			cookies.set("sb-refresh-token", refreshData.session.refresh_token, sessionCookieOptions);
		} else if (refreshError) console.error("[Middleware] Error al renovar token:", refreshError.message);
	} catch (refreshErr) {
		console.error("[Middleware] Excepción al renovar sesión:", refreshErr);
	}
	if (error || !user) {
		const reason = error ? error.message || String(error) : "Usuario no encontrado";
		console.warn("[Middleware] Acceso denegado:", reason);
		cookies.delete("sb-access-token", { path: "/" });
		cookies.delete("sb-refresh-token", { path: "/" });
		return redirect(`/?redirect=${encodeURIComponent(pathname)}&error=${encodeURIComponent("Sesión no válida: " + reason)}`);
	}
	if (pathname.startsWith("/admin")) {
		if (!await isUserAdmin(user)) return redirect("/dashboard");
	}
	context.locals.user = user;
	return next();
};
//#endregion
//#region \0virtual:astro:middleware
var onRequest = sequence(onRequest$1);
//#endregion
export { onRequest };
