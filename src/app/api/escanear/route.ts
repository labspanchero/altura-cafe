import { ipDe, superaLimite } from "@/lib/entorno";
import { normalizar } from "@/lib/tucafe";

// Lee la etiqueta de un paquete de café (foto o texto) con un modelo con visión.
const PROMPT = `Eres un catador que lee etiquetas de paquetes de café de especialidad.
Devuelve SOLO un JSON con estas claves (usa null si no aparece, no inventes):
{"esCafe": boolean, "tostador": string|null, "pais": string|null, "region": string|null, "finca": string|null,
 "variedad": string|null, "proceso": string|null, "altitud": number|null (msnm; si hay rango usa el promedio),
 "tueste": "claro"|"medio"|"oscuro"|null, "notas": string[] (notas de cata tal como aparecen, sin cambiar número ni género; máximo 5, en español),
 "fechaTueste": string|null}
Traduce al español neutro los nombres de proceso (washed→Lavado, natural→Natural, honey→Honey) y de país.
Si la imagen o el texto no es de un paquete de café, devuelve {"esCafe": false}.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "La lectura de paquetes no está disponible ahora." }, { status: 503 });

  if (await superaLimite(`escanear:${ipDe(request)}`, 8, 600)) {
    return Response.json({ error: "Probaste varias veces seguidas. Espera unos minutos." }, { status: 429 });
  }

  const body = (await request.json().catch(() => null)) as { imagen?: unknown; texto?: unknown } | null;
  const imagen = typeof body?.imagen === "string" && body.imagen.startsWith("data:image/") ? body.imagen : null;
  const texto = typeof body?.texto === "string" ? body.texto.slice(0, 1500).trim() : "";
  if (!imagen && !texto) return Response.json({ error: "Envía una foto del paquete o escribe lo que dice." }, { status: 400 });
  if (imagen && imagen.length > 2_500_000) return Response.json({ error: "La foto es muy pesada." }, { status: 413 });

  const contenido = imagen
    ? [
        { type: "text", text: "Lee la etiqueta de este paquete de café." },
        { type: "image_url", image_url: { url: imagen, detail: "high" } },
      ]
    : [{ type: "text", text: `Texto de la etiqueta:\n${texto}` }];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_tokens: 400,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PROMPT },
        { role: "user", content: contenido },
      ],
    }),
  });
  if (!res.ok) return Response.json({ error: "No pudimos leer la etiqueta. Intenta con otra foto." }, { status: 502 });

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  let crudo: unknown = null;
  try {
    crudo = JSON.parse(data.choices?.[0]?.message?.content ?? "null");
  } catch {
    // respuesta no JSON
  }
  const leido = normalizar(crudo);
  if (!leido.esCafe) return Response.json({ error: "No parece un paquete de café. Prueba con la etiqueta de frente." }, { status: 422 });
  return Response.json({ leido });
}
