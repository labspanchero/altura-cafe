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

export function bindings(): { DB?: D1; LIMITES?: KV } {
  try {
    const { env } = getCloudflareContext();
    return env as unknown as { DB?: D1; LIMITES?: KV };
  } catch {
    // Fuera del runtime de Workers (next dev / next start) no hay bindings.
    return {};
  }
}

// Límite por clave con ventana fija. Usa KV si existe; si no, memoria del isolate.
const memoria = new Map<string, { n: number; hasta: number }>();

export async function superaLimite(clave: string, max: number, ventanaSeg: number) {
  const { LIMITES } = bindings();
  if (LIMITES) {
    const actual = Number((await LIMITES.get(clave)) ?? 0);
    if (actual >= max) return true;
    // KV exige un TTL mínimo de 60 s.
    await LIMITES.put(clave, String(actual + 1), { expirationTtl: Math.max(60, ventanaSeg) });
    return false;
  }
  const ahora = Date.now();
  const m = memoria.get(clave);
  if (!m || m.hasta < ahora) {
    memoria.set(clave, { n: 1, hasta: ahora + ventanaSeg * 1000 });
    return false;
  }
  m.n += 1;
  return m.n > max;
}

export function ipDe(request: Request) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
}
