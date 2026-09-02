import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
import { t as isUserAdmin } from "./auth_CoTxHK05.mjs";
import { createClient } from "@supabase/supabase-js";
//#region src/pages/api/videos/storage.ts
var storage_exports = /* @__PURE__ */ __exportAll({
	POST: () => POST,
	prerender: () => false
});
var POST = async ({ request, cookies }) => {
	try {
		const accessToken = cookies.get("sb-access-token")?.value;
		if (!accessToken) return new Response(JSON.stringify({ error: "No autenticado" }), {
			status: 401,
			headers: { "Content-Type": "application/json" }
		});
		const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
		const isAdmin = await isUserAdmin(user);
		if (userError || !user || !isAdmin) return new Response(JSON.stringify({ error: "No tienes permisos" }), {
			status: 403,
			headers: { "Content-Type": "application/json" }
		});
		const file = (await request.formData()).get("file");
		if (!file) return new Response(JSON.stringify({ error: "No se envió ningún archivo de video" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const cleanFileName = file.name.replace(/[^a border-zA-Z0-9._-]/g, "_");
		const fileName = `${Date.now()}_${cleanFileName}`;
		const arrayBuffer = await file.arrayBuffer();
		const fileBuffer = new Uint8Array(arrayBuffer);
		const authSupabase = createClient("https://ueyzxcqouniqqhlgarso.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleXp4Y3FvdW5pcXFobGdhcnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTE3NTIsImV4cCI6MjEwMzE2Nzc1Mn0.t0l6ylyNVEjqTo-GzrzWA_IsawhqvYvn3zdUU239vv8", { global: { headers: { Authorization: `Bearer ${accessToken}` } } });
		const { data: uploadData, error: uploadError } = await authSupabase.storage.from("videos").upload(fileName, fileBuffer, {
			contentType: file.type || "video/mp4",
			upsert: true
		});
		if (uploadError) {
			console.error("[Supabase Storage Upload Error Details]:", uploadError);
			const details = uploadError.message || JSON.stringify(uploadError);
			throw new Error(`Error en Supabase Storage (${details}). Asegúrese de haber creado el bucket 'videos' con acceso público.`);
		}
		const { data: publicUrlData } = authSupabase.storage.from("videos").getPublicUrl(fileName);
		const publicUrl = publicUrlData.publicUrl;
		return new Response(JSON.stringify({
			success: true,
			publicUrl,
			fileName
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("[Error Storage API]:", err);
		const errorMessage = err?.message || String(err) || "Error al subir el archivo";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/videos/storage@_@ts
var page = () => storage_exports;
//#endregion
export { page };
