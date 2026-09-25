import { recomendar, validarRespuestas } from "@/lib/recomendar";
import { ipDe, leerJson, superaLimite } from "@/lib/entorno";
import { sumarEncontrado } from "@/lib/contador";
import { obtenerCarta } from "@/lib/carta";

export async function POST(request: Request) {
  const body = await leerJson(request, 1_000);
  if (body === "grande") return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  const respuestas = validarRespuestas(body);
  if (!respuestas) {
    return Response.json(
      { error: "Faltan respuestas o alguna no es válida." },
      { status: 400 },
    );
  }
  // Cuenta una vez por visitante cada 12 h para que el número sea honesto.
  try {
    if (!(await superaLimite(`encontro:${ipDe(request)}`, 1, 43200))) await sumarEncontrado();
  } catch {
    // el contador no debe romper la recomendación
  }
  const { cafes } = await obtenerCarta();
  return Response.json(recomendar(respuestas, cafes));
}
