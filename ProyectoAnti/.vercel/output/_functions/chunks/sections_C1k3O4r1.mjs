import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import { t as supabase } from "./supabase_OtmTd00b.mjs";
import { t as isUserAdmin } from "./auth_CoTxHK05.mjs";
//#region src/pages/api/videos/sections.ts
var sections_exports = /* @__PURE__ */ __exportAll({
	DELETE: () => DELETE,
	GET: () => GET,
	POST: () => POST
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
		const rawText = await request.text();
		if (!rawText) return new Response(JSON.stringify({ error: "Cuerpo de solicitud vacío" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { title, description } = JSON.parse(rawText);
		if (!title) return new Response(JSON.stringify({ error: "El título es requerido" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		const { data: sections, error: orderError } = await supabase.from("sections").select("display_order").order("display_order", { ascending: false }).limit(1);
		const maxOrder = sections && sections.length > 0 ? sections[0].display_order : -1;
		const { data, error } = await supabase.from("sections").insert({
			title,
			description: description || "",
			display_order: maxOrder + 1
		}).select();
		if (error) throw error;
		return new Response(JSON.stringify({
			success: true,
			section: data?.[0]
		}), {
			status: 201,
			headers: { "Content-Type": "application/json" }
		});
	} catch (err) {
		console.error("[Error API Sections POST]:", err);
		const errorMessage = err?.message || String(err) || "Error al crear la sección";
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
	}
};
var GET = async ({ cookies }) => {
	try {
		const { data, error } = await supabase.from("sections").select("*").order("display_order", { ascending: true });
		if (error) throw error;
		return new Response(JSON.stringify({ sections: data }), {
			status: 200,
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
var DELETE = async ({ cookies, url }) => {
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
		const sectionId = url.searchParams.get("id");
		if (!sectionId) return new Response(JSON.stringify({ error: "ID de sección requerido" }), {
			status: 400,
			headers: { "Content-Type": "application/json" }
		});
		await supabase.from("videos").delete().eq("section_id", sectionId);
		const { error } = await supabase.from("sections").delete().eq("id", sectionId);
		if (error) throw error;
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
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
//#region \0virtual:astro:page:src/pages/api/videos/sections@_@ts
var page = () => sections_exports;
//#endregion
export { page };
