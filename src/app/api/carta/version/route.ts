import { versionCarta } from "@/lib/carta";

// Consulta liviana: cuándo cambió la carta por última vez en el CMS.
export async function GET() {
  return Response.json({ cambiado: await versionCarta() }, { headers: { "Cache-Control": "no-store" } });
}
