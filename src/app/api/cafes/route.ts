import { obtenerCarta } from "@/lib/carta";

export async function GET() {
  const { cafes, fuente } = await obtenerCarta();
  return Response.json({ cafes, fuente, nota: "Lotes de muestra, ficticios." });
}
