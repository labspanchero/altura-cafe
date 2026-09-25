// "Ruta del café": validación del lugar, limpieza de la respuesta de la IA
// (solo paradas con fuente) y link de Google Maps a pie.
export type Parada = {
  nombre: string;
  barrio: string;
  direccion: string;
  destacado: string;
  puntaje: number | null;
  fuentePuntaje: string | null;
  fuente: string;
};
export type Ruta = { ciudad: string; consejo: string; paradas: Parada[]; maps: string };

export function normalizarLugar(v: unknown) {
  if (typeof v !== "string") return null;
  const t = v.replace(/[^\p{L}\p{N} ,.'-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  return t.length >= 2 ? t : null;
}

export function claveLugar(lugar: string) {
  return lugar.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/[^a-z0-9]+/g, "-");
}

// La IA a veces devuelve la fuente como markdown "([sitio](url))": se extrae la URL y se limpia.
export function limpiarUrl(v: unknown) {
  if (typeof v !== "string") return null;
  const m = v.match(/https?:\/\/[^\s)\]]+/);
  if (!m) return null;
  try {
    const u = new URL(m[0]);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    u.searchParams.delete("utm_source");
    return u.toString();
  } catch {
    return null;
  }
}

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function mapsRuta(paradas: Parada[], ciudad: string) {
  const q = (p: Parada) => `${p.nombre}, ${p.direccion}, ${ciudad}`;
  const u = new URL("https://www.google.com/maps/dir/");
  u.searchParams.set("api", "1");
  u.searchParams.set("travelmode", "walking");
  u.searchParams.set("origin", q(paradas[0]));
  u.searchParams.set("destination", q(paradas[paradas.length - 1]));
  if (paradas.length > 2) u.searchParams.set("waypoints", paradas.slice(1, -1).map(q).join("|"));
  return u.toString();
}

export function mapsParada(p: Parada, ciudad: string) {
  const u = new URL("https://www.google.com/maps/search/");
  u.searchParams.set("api", "1");
  u.searchParams.set("query", `${p.nombre}, ${p.direccion}, ${ciudad}`);
  return u.toString();
}

export function limpiarRuta(crudo: unknown, lugar: string, citas: Set<string>): Ruta | null {
  if (!crudo || typeof crudo !== "object") return null;
  const o = crudo as Record<string, unknown>;
  const ciudad = txt(o.ciudad, 60) || lugar;
  const lista = Array.isArray(o.paradas) ? o.paradas : [];
  const paradas: Parada[] = [];
  for (const p of lista) {
    if (!p || typeof p !== "object") continue;
    const r = p as Record<string, unknown>;
    const fuente = limpiarUrl(r.fuente);
    const nombre = txt(r.nombre, 60);
    const direccion = txt(r.direccion, 90);
    if (!fuente || !nombre || !direccion) continue;
    // Si la búsqueda devolvió citas, la fuente tiene que ser una de ellas.
    if (citas.size && ![...citas].some((c) => new URL(c).hostname === new URL(fuente).hostname)) continue;
    const puntaje = typeof r.puntaje === "number" && r.puntaje > 0 && r.puntaje <= 100 ? r.puntaje : null;
    paradas.push({
      nombre,
      barrio: txt(r.barrio, 40),
      direccion,
      destacado: txt(r.destacado, 140),
      puntaje,
      fuentePuntaje: puntaje !== null ? txt(r.fuentePuntaje, 40) || null : null,
      fuente,
    });
    if (paradas.length === 6) break;
  }
  if (paradas.length < 2) return null;
  return { ciudad, consejo: txt(o.consejo, 200), paradas, maps: mapsRuta(paradas, ciudad) };
}
