import { bindings } from "@/lib/entorno";
import { leerEventos } from "@/lib/eventos";
import { versionCarta } from "@/lib/carta";

// Panel en vivo de "Cómo está hecho": mediciones reales de la app, sin datos de visitantes.
// Se guarda 5 s en memoria para que muchas pestañas abiertas no multipliquen las consultas.
let cache: { hasta: number; datos: unknown } | null = null;

async function contar(tabla: "rutas" | "pedidos") {
  const { DB } = bindings();
  if (!DB) return null;
  try {
    const { results } = await DB.prepare(`SELECT COUNT(*) AS n FROM ${tabla}`).all<{ n: number }>();
    return results[0]?.n ?? 0;
  } catch {
    return null;
  }
}

export async function GET() {
  if (cache && cache.hasta > Date.now()) return Response.json(cache.datos, { headers: { "Cache-Control": "no-store" } });
  const { DB } = bindings();
  let dbMs: number | null = null;
  if (DB) {
    const t0 = performance.now();
    await DB.prepare("SELECT 1").all().catch(() => null);
    dbMs = Math.round(performance.now() - t0);
  }
  const [eventos, cambiado, rutas, pedidos] = await Promise.all([leerEventos(), versionCarta(), contar("rutas"), contar("pedidos")]);
  const datos = {
    dbMs,
    cmsMs: eventos.cms_ms?.valor ?? null,
    cmsLeido: eventos.cms_ms?.cuando ?? null,
    webhooks: eventos.webhooks?.valor ?? 0,
    ultimoWebhook: eventos.webhooks?.cuando ?? null,
    cartaCambiada: cambiado,
    rutas,
    pedidos,
    ahora: Math.floor(Date.now() / 1000),
  };
  cache = { hasta: Date.now() + 5000, datos };
  return Response.json(datos, { headers: { "Cache-Control": "no-store" } });
}
