import { bindings } from "./entorno";

// Contador global de personas que encontraron su café con el quiz (SQLite).
let respaldo = 0;

export async function leerEncontrados() {
  const { DB } = bindings();
  if (!DB) return respaldo;
  const { results } = await DB.prepare("SELECT total FROM contador WHERE clave = ?")
    .bind("encontrados")
    .all<{ total: number }>();
  return results[0]?.total ?? 0;
}

export async function sumarEncontrado() {
  const { DB } = bindings();
  if (!DB) {
    respaldo += 1;
    return;
  }
  await DB.prepare(
    "INSERT INTO contador (clave, total) VALUES (?, 1) ON CONFLICT(clave) DO UPDATE SET total = total + 1",
  )
    .bind("encontrados")
    .run();
}
