import { bindings, ipDe, leerJson, superaLimite, superaTopeDiario } from "@/lib/entorno";
import { validarConfig } from "@/lib/armar";

// Pedido de demostración: se guarda en SQLite, no se cobra ni se envía.
let respaldo = 1000;

export async function POST(request: Request) {
  if (await superaLimite(`pedido:${ipDe(request)}`, 6, 600)) {
    return Response.json({ error: "Hiciste varios pedidos seguidos. Espera unos minutos." }, { status: 429 });
  }
  const cuerpo = await leerJson(request, 4_000);
  if (cuerpo === "grande") return Response.json({ error: "El mensaje es demasiado grande." }, { status: 413 });
  if (await superaTopeDiario("pedidos", 2000)) {
    return Response.json({ error: "Hoy recibimos muchos pedidos de demostración. Vuelve mañana." }, { status: 429 });
  }
  const config = validarConfig(cuerpo);
  if (!config) return Response.json({ error: "Falta elegir alguna opción de tu lote." }, { status: 400 });

  const { DB } = bindings();
  try {
    let numero: number;
    if (DB) {
      await DB.prepare("INSERT INTO pedidos (config) VALUES (?)").bind(JSON.stringify(config)).run();
      const { results } = await DB.prepare("SELECT MAX(numero) AS n FROM pedidos").all<{ n: number }>();
      numero = 1000 + (results[0]?.n ?? 0);
    } else {
      numero = ++respaldo;
    }
    return Response.json({ numero: `ALT-${numero}`, config });
  } catch {
    return Response.json({ error: "No pudimos registrar tu pedido. Inténtalo de nuevo." }, { status: 500 });
  }
}
