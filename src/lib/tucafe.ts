import { CAFES, METODOS, type Cafe, type Metodo, type Receta } from "./cafes";

// Café leído de un paquete (foto o texto) y receta calculada para él.
export type Leido = {
  tostador: string | null;
  pais: string | null;
  region: string | null;
  finca: string | null;
  variedad: string | null;
  proceso: string | null;
  altitud: number | null;
  tueste: "claro" | "medio" | "oscuro" | null;
  notas: string[];
  fechaTueste: string | null;
  esCafe: boolean;
};

const txt = (v: unknown, max = 80) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);

export function normalizar(crudo: unknown): Leido {
  const o = (crudo && typeof crudo === "object" ? crudo : {}) as Record<string, unknown>;
  const alt = Number(String(o.altitud ?? "").replace(/[^\d]/g, ""));
  const tueste = txt(o.tueste)?.toLowerCase() ?? null;
  return {
    tostador: txt(o.tostador),
    pais: txt(o.pais, 40),
    region: txt(o.region),
    finca: txt(o.finca),
    variedad: txt(o.variedad),
    proceso: txt(o.proceso, 40),
    altitud: Number.isFinite(alt) && alt >= 300 && alt <= 3000 ? alt : null,
    tueste: tueste?.startsWith("clar") ? "claro" : tueste?.startsWith("osc") ? "oscuro" : tueste ? "medio" : null,
    notas: Array.isArray(o.notas) ? o.notas.map((n) => txt(n, 30)).filter((n): n is string => !!n).slice(0, 5) : [],
    fechaTueste: txt(o.fechaTueste, 30),
    esCafe: o.esCafe !== false,
  };
}

// Receta por método según tueste y proceso: tuestes claros y lavados piden
// agua más caliente; los oscuros, menos temperatura y algo más de ratio.
export function recetaPara(l: Leido, metodo: Metodo): Receta {
  const t = l.tueste ?? "medio";
  const temp = t === "claro" ? 94 : t === "oscuro" ? 90 : 92;
  const natural = /natural|honey|miel|anaer/i.test(l.proceso ?? "");
  const m = METODOS[metodo];
  const base: Record<Metodo, { dosis: number; ratio: number; tiempo: string }> = {
    espresso: { dosis: 18, ratio: t === "oscuro" ? 1.8 : t === "claro" ? 2.3 : 2, tiempo: t === "claro" ? "0:30" : "0:27" },
    moka: { dosis: 16, ratio: 10, tiempo: "4:00" },
    aeropress: { dosis: 15, ratio: natural ? 15 : 14.5, tiempo: t === "oscuro" ? "1:30" : "2:00" },
    v60: { dosis: 15, ratio: t === "oscuro" ? 15 : natural ? 16 : 16.5, tiempo: t === "claro" ? "2:50" : "2:40" },
    chemex: { dosis: 30, ratio: t === "oscuro" ? 15 : 16, tiempo: "4:15" },
    prensa: { dosis: 30, ratio: 15.5, tiempo: "4:00" },
    coldbrew: { dosis: 100, ratio: 10, tiempo: "16 h" },
  };
  const b = base[metodo];
  const agua = Math.round(b.dosis * b.ratio);
  const temperatura = metodo === "moka" ? "Agua caliente" : metodo === "coldbrew" ? "Agua fría" : `${temp - (metodo === "prensa" ? 1 : 0)} °C`;
  return { metodo, molienda: m.molienda, dosis: `${b.dosis} g`, agua: `${agua} g`, temperatura, tiempo: b.tiempo };
}

export function metodoSugerido(l: Leido): Metodo {
  if (l.tueste === "oscuro") return "espresso";
  if (l.tueste === "claro") return "v60";
  return "aeropress";
}

// Lote de Altura más parecido: país, proceso, altitud y notas.
export function parecido(l: Leido, cafes: Cafe[] = CAFES): Cafe {
  const puntaje = (c: Cafe) => {
    let s = 0;
    if (l.pais && c.pais.toLowerCase() === l.pais.toLowerCase()) s += 5;
    if (l.proceso && c.proceso.toLowerCase().includes(l.proceso.toLowerCase().split(" ")[0])) s += 2;
    if (l.altitud) s -= Math.abs(c.altitud - l.altitud) / 250;
    const notas = l.notas.join(" ").toLowerCase();
    for (const n of c.notas) if (notas.includes(n.toLowerCase().split(" ")[0])) s += 1.5;
    if (l.tueste === "oscuro" && c.sensorial.cuerpo >= 4) s += 1;
    if (l.tueste === "claro" && c.sensorial.acidez >= 4) s += 1;
    return s;
  };
  return [...cafes].sort((a, b) => puntaje(b) - puntaje(a))[0];
}

// Calibración después de probar la taza (ajustes clásicos de extracción).
export type Resultado = "acido" | "amargo" | "equilibrado";
export function ajustes(r: Resultado, metodo: Metodo): string[] {
  if (r === "equilibrado") return ["Guarda esta receta: está extrayendo bien.", "Si quieres más cuerpo, sube 1 g de café sin cambiar el agua."];
  const esp = metodo === "espresso";
  if (r === "acido")
    return [
      "Le faltó extracción: muele un punto más fino.",
      esp ? "Si ya está fino, deja correr 3 a 5 segundos más." : "Sube la temperatura 2 °C o alarga el vertido unos 15 segundos.",
      "Revisa la dosis: un poco más de café por agua también ayuda.",
    ];
  return [
    "Se pasó de extracción: muele un punto más grueso.",
    esp ? "Corta la extracción 3 a 5 segundos antes." : "Baja la temperatura 2 °C o acorta el tiempo total.",
    "Si el tueste es oscuro, prueba con una proporción 1:15.",
  ];
}
