import { leerJson, superaLimite } from "@/lib/entorno";
import { COLECCION, refrescarCarta } from "@/lib/carta";
import { anotar } from "@/lib/eventos";

// Webhook del CMS de Webflow (collection_item_created/changed/deleted/published/unpublished).
// El aviso es solo una señal: no se usa nada de su contenido; la carta se vuelve a leer
// del CMS con el token propio. Un aviso falso, como mucho, provoca una lectura extra.
export async function POST(request: Request) {
  const cuerpo = await leerJson(request, 64_000);
  if (cuerpo === "grande") return Response.json({ ok: false }, { status: 413 });
  const coleccion = (cuerpo as { payload?: { collectionId?: unknown } } | null)?.payload?.collectionId;
  if (typeof coleccion === "string" && coleccion !== COLECCION) return Response.json({ ok: true, ignorado: true });
  if (await superaLimite("webhook:carta", 20, 60)) return Response.json({ ok: false }, { status: 429 });
  await anotar("webhooks", 1, true);
  const carta = await refrescarCarta();
  return Response.json({ ok: !!carta, cambiado: carta?.cambiado ?? null });
}
