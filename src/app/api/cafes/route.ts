import { obtenerCarta } from "@/lib/carta";

export async function GET() {
  const { cafes, fuente, cambiado } = await obtenerCarta();
  return Response.json({ cafes, fuente, cambiado, nota: "Lotes de muestra, ficticios." }, { headers: { "Cache-Control": "no-store" } });
}
