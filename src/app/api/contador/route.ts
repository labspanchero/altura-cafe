import { leerEncontrados } from "@/lib/contador";

export async function GET() {
  try {
    return Response.json({ encontrados: await leerEncontrados() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ encontrados: null }, { status: 200 });
  }
}
