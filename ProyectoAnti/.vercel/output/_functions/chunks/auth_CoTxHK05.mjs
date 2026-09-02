import { t as supabase } from "./supabase_OtmTd00b.mjs";
//#region src/lib/auth.ts
/**
* Verifica si un usuario tiene el rol de Administrador.
* Comprueba:
* 1. Correo maestro del sistema ('admin@antipobreza.org')
* 2. Metadatos de usuario en Supabase Auth (user_metadata o app_metadata: is_admin / isAdmin)
* 3. Tabla 'profiles' en Supabase DB (columna is_admin o isAdmin)
*/
async function isUserAdmin(user) {
	if (!user) return false;
	if (user.email === "admin@antipobreza.org") return true;
	if (user.user_metadata?.is_admin === true || user.user_metadata?.isAdmin === true || user.user_metadata?.is_admin === "true" || user.user_metadata?.isAdmin === "true" || user.app_metadata?.is_admin === true || user.app_metadata?.isAdmin === true) return true;
	try {
		const { data, error } = await supabase.from("profiles").select("is_admin, isAdmin").eq("id", user.id).maybeSingle();
		if (!error && data) {
			if (data.is_admin === true || data.isAdmin === true || data.is_admin === 1 || data.isAdmin === 1) return true;
		}
	} catch (e) {}
	return false;
}
//#endregion
export { isUserAdmin as t };
