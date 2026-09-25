import { CAFES, METODOS } from "@/lib/cafes";
import { ipDe, superaLimite } from "@/lib/entorno";

type Mensaje = { role: "user" | "assistant"; content: string };

const MAX_MENSAJES = 12;
const MAX_CARACTERES = 500;
const LIMITE_POR_VENTANA = 15;
const VENTANA_SEG = 10 * 60;

const CARTA = CAFES.map((c) => ({
  lote: c.lote,
  cafe: `${c.pais} ${c.region}`,
  altitud: `${c.altitud} msnm`,
  variedad: c.variedad,
  proceso: c.proceso,
  tueste: c.tueste,
  notas: c.notas,
  aroma: c.aroma,
  sensorial: c.sensorial,
  recetas: c.recetas.map((r) => ({ ...r, metodo: METODOS[r.metodo].nombre })),
}));

const SISTEMA = `Eres el barista de Altura, una tostadería ficticia de café de especialidad.
Respondes en español neutro, breve (máximo 120 palabras), con precisión técnica para alguien que sabe de café. Escribe texto plano, sin markdown: nada de asteriscos, almohadillas ni negritas. Para listas usa guiones simples.
Solo hablas de la carta de Altura, del café en general y de cómo prepararlo. Si te preguntan otra cosa, vuelves amablemente al café.
Cuando recomiendes, nombra el lote (ej. ALT-07), la molienda y una receta de la carta.
Los lotes son de muestra y ficticios; si te preguntan si existen, dilo.
Carta: ${JSON.stringify(CARTA)}`;

function validar(body: unknown): Mensaje[] | null {
  if (!body || typeof body !== "object") return null;
  const mensajes = (body as { mensajes?: unknown }).mensajes;
  if (!Array.isArray(mensajes) || mensajes.length === 0) return null;
  const limpios: Mensaje[] = [];
  for (const m of mensajes.slice(-MAX_MENSAJES)) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string"
    ) {
      return null;
    }
    limpios.push({ role: m.role, content: m.content.slice(0, MAX_CARACTERES) });
  }
  return limpios;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "El barista está descansando: falta configurar la API." },
      { status: 503 },
    );
  }

  // Límite por visitante en el KV de Webflow Cloud (sobrevive entre isolates).
  if (await superaLimite(`barista:${ipDe(request)}`, LIMITE_POR_VENTANA, VENTANA_SEG)) {
    return Response.json(
      { error: "Muchas preguntas seguidas. Espera unos minutos y vuelve a intentar." },
      { status: 429 },
    );
  }

  const mensajes = validar(await request.json().catch(() => null));
  if (!mensajes) {
    return Response.json({ error: "Mensaje no válido." }, { status: 400 });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0.6,
      stream: true,
      messages: [{ role: "system", content: SISTEMA }, ...mensajes],
    }),
  });

  if (!res.ok || !res.body) {
    return Response.json(
      { error: "El barista no pudo responder. Intenta de nuevo en un momento." },
      { status: 502 },
    );
  }

  // Reenvía solo el texto de cada fragmento SSE de OpenAI.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let resto = "";
  const texto = res.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        resto += decoder.decode(chunk, { stream: true });
        const lineas = resto.split("\n");
        resto = lineas.pop() ?? "";
        for (const linea of lineas) {
          const dato = linea.trim();
          if (!dato.startsWith("data:")) continue;
          const json = dato.slice(5).trim();
          if (json === "[DONE]") continue;
          try {
            const delta = JSON.parse(json).choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // fragmento incompleto: se ignora
          }
        }
      },
    }),
  );

  return new Response(texto, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
