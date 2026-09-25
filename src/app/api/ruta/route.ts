import { bindings, ipDe, leerJson, superaLimite, superaTopeDiario } from "@/lib/entorno";
import { claveLugar, limpiarRuta, limpiarUrl, normalizarLugar, type Ruta } from "@/lib/ruta";

// Ruta del café: búsqueda web con OpenAI (fuentes reales), caché de 24 h por lugar.
const CACHE_SEG = 86400;
const esquema = {
  type: "object",
  additionalProperties: false,
  required: ["ciudad", "paradas", "consejo"],
  properties: {
    ciudad: { type: "string" },
    consejo: { type: "string" },
    paradas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["nombre", "barrio", "direccion", "destacado", "puntaje", "fuentePuntaje", "fuente"],
        properties: {
          nombre: { type: "string" },
          barrio: { type: "string" },
          direccion: { type: "string" },
          destacado: { type: "string" },
          puntaje: { type: ["number", "null"] },
          fuentePuntaje: { type: ["string", "null"] },
          fuente: { type: "string" },
        },
      },
    },
  },
};

async function desdeCache(clave: string): Promise<Ruta | null> {
  const { DB } = bindings();
  if (!DB) return null;
  try {
    const { results } = await DB.prepare("SELECT datos, creado FROM rutas WHERE clave = ?").bind(clave).all<{ datos: string; creado: number }>();
    const fila = results[0];
    if (!fila || Date.now() / 1000 - fila.creado > CACHE_SEG) return null;
    return JSON.parse(fila.datos) as Ruta;
  } catch {
    return null;
  }
}

async function guardar(clave: string, ruta: Ruta) {
  const { DB } = bindings();
  if (!DB) return;
  await DB.prepare("INSERT INTO rutas (clave, datos, creado) VALUES (?, ?, ?) ON CONFLICT(clave) DO UPDATE SET datos = excluded.datos, creado = excluded.creado")
    .bind(clave, JSON.stringify(ruta), Math.floor(Date.now() / 1000))
    .run()
    .catch(() => {});
}

export async function POST(request: Request) {
  const cuerpo = await leerJson(request, 1_000);
  if (cuerpo === "grande") return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  const lugar = normalizarLugar((cuerpo as { lugar?: unknown } | null)?.lugar);
  if (!lugar) return Response.json({ error: "Escribe una ciudad o un barrio." }, { status: 400 });

  const clave = claveLugar(lugar);
  const guardada = await desdeCache(clave);
  if (guardada) return Response.json({ ruta: guardada, cache: true });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ error: "La ruta del café no está disponible ahora." }, { status: 503 });
  if (await superaLimite(`ruta:${ipDe(request)}`, 4, 600)) {
    return Response.json({ error: "Buscaste varias rutas seguidas. Espera unos minutos." }, { status: 429 });
  }
  if (await superaTopeDiario("ruta", 150)) {
    return Response.json({ error: "Hoy armamos muchas rutas. Vuelve mañana." }, { status: 429 });
  }

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(17_000),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      tools: [{ type: "web_search", search_context_size: "low" }],
      max_output_tokens: 1400,
      input:
        `Arma una ruta a pie de 4 a 6 cafeterías de especialidad que existan hoy en "${lugar}". Usa búsqueda web y no inventes nada. ` +
        "Para cada una: nombre, barrio, dirección, qué la destaca (máximo 100 caracteres, en español neutro), " +
        "puntaje solo si aparece en una fuente (y el nombre de esa fuente, por ejemplo Google o TripAdvisor); si no, null. " +
        "fuente: la URL donde confirmaste que existe. Ordénalas para caminar de una a la siguiente. " +
        "consejo: una frase útil para quien pasea (máximo 160 caracteres). Si el lugar no existe o no hay datos, devuelve paradas vacías.",
      text: { format: { type: "json_schema", name: "ruta_cafe", strict: true, schema: esquema } },
    }),
  }).catch(() => null);
  if (!res?.ok) return Response.json({ error: "No pudimos armar la ruta. Intenta de nuevo en un momento." }, { status: 502 });

  type Salida = { type: string; content?: { type: string; text?: string; annotations?: { type: string; url?: string }[] }[] };
  const data = (await res.json().catch(() => null)) as { output?: Salida[] } | null;
  const mensaje = data?.output?.find((o) => o.type === "message")?.content?.find((c) => c.type === "output_text");
  const citas = new Set((mensaje?.annotations ?? []).map((a) => limpiarUrl(a.url)).filter((u): u is string => !!u));
  let crudo: unknown = null;
  try {
    crudo = JSON.parse(mensaje?.text ?? "null");
  } catch {
    // respuesta inválida
  }
  const ruta = limpiarRuta(crudo, lugar, citas);
  if (!ruta) return Response.json({ error: `No encontramos cafeterías de especialidad con fuentes confiables en "${lugar}". Prueba con otro barrio o ciudad.` }, { status: 404 });
  await guardar(clave, ruta);
  return Response.json({ ruta, cache: false });
}
