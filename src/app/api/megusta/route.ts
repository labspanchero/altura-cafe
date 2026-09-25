import { CAFES } from "@/lib/cafes";
import { bindings, ipDe, superaLimite } from "@/lib/entorno";

// Contador compartido de "me gusta" por lote, en SQLite de Webflow Cloud.
const respaldo = new Map<string, number>();
const IDS = new Set(CAFES.map((c) => c.id));

async function conteos() {
  const { DB } = bindings();
  const base = Object.fromEntries(CAFES.map((c) => [c.id, 0])) as Record<string, number>;
  if (!DB) {
    for (const [k, v] of respaldo) base[k] = v;
    return { conteos: base, persistente: false };
  }
  const { results } = await DB.prepare("SELECT lote, total FROM me_gusta").all<{ lote: string; total: number }>();
  for (const r of results) if (r.lote in base) base[r.lote] = r.total;
  return { conteos: base, persistente: true };
}

export async function GET() {
  try {
    return Response.json(await conteos(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "No pudimos leer los me gusta." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!IDS.has(id)) return Response.json({ error: "Lote desconocido." }, { status: 400 });

  // Un me gusta por lote y por visitante cada 24 h.
  if (await superaLimite(`mg:${ipDe(request)}:${id}`, 1, 86400)) {
    return Response.json({ ...(await conteos()), repetido: true });
  }

  const { DB } = bindings();
  try {
    if (DB) {
      await DB.prepare(
        "INSERT INTO me_gusta (lote, total) VALUES (?, 1) ON CONFLICT(lote) DO UPDATE SET total = total + 1",
      )
        .bind(id)
        .run();
    } else {
      respaldo.set(id, (respaldo.get(id) ?? 0) + 1);
    }
    return Response.json(await conteos());
  } catch {
    return Response.json({ error: "No pudimos guardar tu me gusta." }, { status: 500 });
  }
}
