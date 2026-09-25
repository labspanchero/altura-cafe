import { recomendar, validarRespuestas } from "@/lib/recomendar";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const respuestas = validarRespuestas(body);
  if (!respuestas) {
    return Response.json(
      { error: "Faltan respuestas o alguna no es válida." },
      { status: 400 },
    );
  }
  return Response.json(recomendar(respuestas));
}
