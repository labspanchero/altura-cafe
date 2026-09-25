import { CAFES } from "@/lib/cafes";

export function GET() {
  return Response.json({ cafes: CAFES, nota: "Lotes de muestra, ficticios." });
}
