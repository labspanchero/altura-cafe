import { bindings } from "@/lib/entorno";
import type { Ruta } from "@/lib/ruta";

// Caché de rutas por lugar: SQLite de Webflow Cloud, o memoria del proceso si no hay base (desarrollo local).
export const CACHE_SEG = 86400;
const memoria = new Map<string, { ruta: Ruta; creado: number }>();

export async function leerRuta(clave: string, maxEdadSeg = CACHE_SEG): Promise<Ruta | null> {
  const ahora = Date.now() / 1000;
  const { DB } = bindings();
  if (!DB) {
    const m = memoria.get(clave);
    return m && ahora - m.creado <= maxEdadSeg ? m.ruta : null;
  }
  try {
    const { results } = await DB.prepare("SELECT datos, creado FROM rutas WHERE clave = ?").bind(clave).all<{ datos: string; creado: number }>();
    const fila = results[0];
    if (!fila || ahora - fila.creado > maxEdadSeg) return null;
    return JSON.parse(fila.datos) as Ruta;
  } catch {
    return null;
  }
}

export async function guardarRuta(clave: string, ruta: Ruta, conservarFecha = false) {
  const creado = Math.floor(Date.now() / 1000);
  const { DB } = bindings();
  if (!DB) {
    memoria.set(clave, { ruta, creado: conservarFecha ? (memoria.get(clave)?.creado ?? creado) : creado });
    return;
  }
  const sql = conservarFecha
    ? "UPDATE rutas SET datos = ?1 WHERE clave = ?2"
    : "INSERT INTO rutas (clave, datos, creado) VALUES (?2, ?1, ?3) ON CONFLICT(clave) DO UPDATE SET datos = excluded.datos, creado = excluded.creado";
  await DB.prepare(sql)
    .bind(JSON.stringify(ruta), clave, creado)
    .run()
    .catch(() => {});
}
