import { bindings } from "./entorno";

// Métricas del panel en vivo guardadas en SQLite (fallan en silencio: nunca rompen una respuesta).
const memoria = new Map<string, { valor: number; cuando: number }>();

export async function anotar(clave: string, valor: number, sumar = false) {
  const cuando = Math.floor(Date.now() / 1000);
  const { DB } = bindings();
  if (!DB) {
    const previo = memoria.get(clave)?.valor ?? 0;
    memoria.set(clave, { valor: sumar ? previo + valor : valor, cuando });
    return;
  }
  const sql = sumar
    ? "INSERT INTO eventos (clave, valor, cuando) VALUES (?1, ?2, ?3) ON CONFLICT(clave) DO UPDATE SET valor = eventos.valor + ?2, cuando = ?3"
    : "INSERT INTO eventos (clave, valor, cuando) VALUES (?1, ?2, ?3) ON CONFLICT(clave) DO UPDATE SET valor = ?2, cuando = ?3";
  await DB.prepare(sql).bind(clave, valor, cuando).run().catch(() => {});
}

export async function leerEventos(): Promise<Record<string, { valor: number; cuando: number }>> {
  const { DB } = bindings();
  if (!DB) return Object.fromEntries(memoria);
  try {
    const { results } = await DB.prepare("SELECT clave, valor, cuando FROM eventos").all<{ clave: string; valor: number; cuando: number }>();
    return Object.fromEntries(results.map((r) => [r.clave, { valor: r.valor, cuando: r.cuando }]));
  } catch {
    return {};
  }
}
