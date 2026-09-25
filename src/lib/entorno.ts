import { getCloudflareContext } from "@opennextjs/cloudflare";

// Tipos mínimos de los bindings de Webflow Cloud que usa la app.
type D1 = {
  prepare(sql: string): {
    bind(...v: unknown[]): { run(): Promise<unknown>; all<T>(): Promise<{ results: T[] }> };
    all<T>(): Promise<{ results: T[] }>;
  };
};
type KV = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
};
// D1 admite parámetros numerados (?1, ?2) y RETURNING.

export function bindings(): { DB?: D1; LIMITES?: KV } {
  try {
    const { env } = getCloudflareContext();
    return env as unknown as { DB?: D1; LIMITES?: KV };
  } catch {
    // Fuera del runtime de Workers (next dev / next start) no hay bindings.
    return {};
  }
}

// Límite por clave con ventana fija, atómico en SQLite (sin límite diario de
// escrituras como KV). Si la base falla, cae a memoria del isolate: nunca
// rompe la ruta que lo llama (falla abierto).
const memoria = new Map<string, { n: number; hasta: number }>();

function enMemoria(clave: string, max: number, ventanaSeg: number) {
  const ahora = Date.now();
  const m = memoria.get(clave);
  if (!m || m.hasta < ahora) {
    if (memoria.size > 5000) memoria.clear();
    memoria.set(clave, { n: 1, hasta: ahora + ventanaSeg * 1000 });
    return false;
  }
  m.n += 1;
  return m.n > max;
}

export async function superaLimite(clave: string, max: number, ventanaSeg: number) {
  const { DB } = bindings();
  if (!DB) return enMemoria(clave, max, ventanaSeg);
  const ahora = Math.floor(Date.now() / 1000);
  try {
    const { results } = await DB.prepare(
      `INSERT INTO limites (clave, n, hasta) VALUES (?1, 1, ?2 + ?3)
       ON CONFLICT(clave) DO UPDATE SET
         n = CASE WHEN limites.hasta <= ?2 THEN 1 ELSE limites.n + 1 END,
         hasta = CASE WHEN limites.hasta <= ?2 THEN ?2 + ?3 ELSE limites.hasta END
       RETURNING n`,
    )
      .bind(clave, ahora, ventanaSeg)
      .all<{ n: number }>();
    // Limpieza ocasional de ventanas vencidas.
    if (Math.random() < 0.02) await DB.prepare("DELETE FROM limites WHERE hasta < ?").bind(ahora - 3600).run().catch(() => {});
    return (results[0]?.n ?? 1) > max;
  } catch {
    return enMemoria(clave, max, ventanaSeg);
  }
}

// Tope global diario (todas las IP juntas) para lo que cuesta dinero.
export function superaTopeDiario(nombre: string, max: number) {
  const dia = new Date().toISOString().slice(0, 10);
  return superaLimite(`tope:${nombre}:${dia}`, max, 86400);
}

// Lee el cuerpo como JSON con un tamaño máximo, sin cargar payloads enormes.
export async function leerJson(request: Request, maxBytes: number): Promise<unknown | "grande"> {
  const declarado = Number(request.headers.get("content-length") ?? 0);
  if (declarado > maxBytes) return "grande";
  const texto = await request.text().catch(() => "");
  if (texto.length > maxBytes) return "grande";
  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

export function ipDe(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
}
