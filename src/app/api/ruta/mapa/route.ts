import { ipDe, leerJson, superaLimite } from "@/lib/entorno";
import { guardarRuta, leerRuta } from "@/lib/rutaCache";
import { claveLugar, filtrarCercanas, normalizarLugar, type Ruta } from "@/lib/ruta";

// Ubica en el mapa las paradas de una ruta ya armada (solo las que están en caché).
// Nominatim (OpenStreetMap) pide como máximo 1 consulta por segundo y un User-Agent identificable:
// https://operations.osmfoundation.org/policies/nominatim/ — por eso va en serie y el resultado se guarda.
const UA = "AlturaCafe/1.0 (+https://altura-cafe.webflow.io/)";
const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocodificar(q: string): Promise<{ lat: number; lon: number } | null> {
  const u = new URL("https://nominatim.openstreetmap.org/search");
  u.searchParams.set("q", q);
  u.searchParams.set("format", "jsonv2");
  u.searchParams.set("limit", "1");
  const res = await fetch(u, { headers: { "User-Agent": UA, "Accept-Language": "es" }, signal: AbortSignal.timeout(5_000) }).catch(() => null);
  if (!res?.ok) return null;
  const [r] = ((await res.json().catch(() => [])) as { lat: string; lon: string }[]) ?? [];
  if (!r) return null;
  const lat = Number(r.lat);
  const lon = Number(r.lon);
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
}

export async function POST(request: Request) {
  const cuerpo = await leerJson(request, 1_000);
  if (cuerpo === "grande") return Response.json({ error: "Solicitud demasiado grande." }, { status: 413 });
  const lugar = normalizarLugar((cuerpo as { lugar?: unknown } | null)?.lugar);
  if (!lugar) return Response.json({ error: "Lugar inválido." }, { status: 400 });

  const clave = claveLugar(lugar);
  const ruta = await leerRuta(clave, 2 * 86400);
  if (!ruta) return Response.json({ error: "Primero arma la ruta." }, { status: 404 });
  if (ruta.ubicada) return Response.json({ paradas: ruta.paradas, cache: true });

  if (await superaLimite(`mapa:${ipDe(request)}`, 6, 600)) {
    return Response.json({ error: "Espera unos minutos para ver más mapas." }, { status: 429 });
  }

  const centro = await geocodificar(lugar);
  const paradas = [];
  for (const p of ruta.paradas) {
    await espera(1_050);
    const punto = (await geocodificar([p.direccion, p.barrio, ruta.ciudad].filter(Boolean).join(", "))) ?? null;
    paradas.push(punto ? { ...p, ...punto } : p);
  }
  const listas = filtrarCercanas(paradas, centro);
  const nueva: Ruta = { ...ruta, paradas: listas, ubicada: true };
  await guardarRuta(clave, nueva, true);
  return Response.json({ paradas: listas, cache: false });
}
