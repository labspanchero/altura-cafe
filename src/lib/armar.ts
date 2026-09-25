import { METODOS, type Metodo } from "./cafes";
import { recetaPara, type Leido } from "./tucafe";

// "Arma tu lote": opciones, perfil estimado y validación del pedido.
export const ORIGENES = {
  etiopia: { nombre: "Etiopía", region: "Guji", altitud: 2150, tinta: "#1f4fd1", clara: "#7a9bff", base: { acidez: 4.5, cuerpo: 2, dulzor: 3.5, amargor: 1 }, notas: ["Jazmín", "Bergamota", "Durazno"] },
  kenia: { nombre: "Kenia", region: "Nyeri", altitud: 1850, tinta: "#c8202f", clara: "#ff6b76", base: { acidez: 4.5, cuerpo: 3, dulzor: 3, amargor: 1.5 }, notas: ["Grosella negra", "Pomelo", "Tomate"] },
  panama: { nombre: "Panamá", region: "Boquete", altitud: 1650, tinta: "#e5601c", clara: "#ff9a5c", base: { acidez: 4, cuerpo: 2.5, dulzor: 4.5, amargor: 1 }, notas: ["Mango", "Jazmín", "Té negro"] },
  colombia: { nombre: "Colombia", region: "Huila", altitud: 1750, tinta: "#0f7a3a", clara: "#4fcf7e", base: { acidez: 3, cuerpo: 3, dulzor: 4, amargor: 2 }, notas: ["Panela", "Naranja", "Cacao"] },
  guatemala: { nombre: "Guatemala", region: "Huehuetenango", altitud: 1700, tinta: "#6b2fb3", clara: "#bb95f5", base: { acidez: 3, cuerpo: 4, dulzor: 3.5, amargor: 2.5 }, notas: ["Chocolate con leche", "Manzana roja", "Almendra"] },
  brasil: { nombre: "Brasil", region: "Mogiana", altitud: 1150, tinta: "#d9a90b", clara: "#f2c94c", base: { acidez: 1.5, cuerpo: 4.5, dulzor: 3.5, amargor: 3 }, notas: ["Maní tostado", "Chocolate", "Caramelo"] },
} as const;

export const PROCESOS = {
  lavado: { nombre: "Lavado", desc: "Taza limpia y brillante", ajuste: { acidez: 0.6, cuerpo: -0.3, dulzor: 0, amargor: 0 }, nota: "Taza limpia" },
  honey: { nombre: "Honey", desc: "Más dulzor y textura", ajuste: { acidez: -0.2, cuerpo: 0.4, dulzor: 0.8, amargor: 0 }, nota: "Miel" },
  natural: { nombre: "Natural", desc: "Fruta madura y cuerpo", ajuste: { acidez: -0.4, cuerpo: 0.7, dulzor: 0.9, amargor: 0.2 }, nota: "Frutos rojos maduros" },
} as const;

export const TUESTES = {
  claro: { nombre: "Claro", desc: "Resalta el origen", ajuste: { acidez: 0.8, cuerpo: -0.6, dulzor: -0.2, amargor: -0.8 } },
  medio: { nombre: "Medio", desc: "Equilibrio", ajuste: { acidez: 0, cuerpo: 0.3, dulzor: 0.4, amargor: 0.3 } },
  oscuro: { nombre: "Oscuro", desc: "Cuerpo y chocolate", ajuste: { acidez: -1.5, cuerpo: 1, dulzor: -0.2, amargor: 1.8 } },
} as const;

export const CANTIDADES = [250, 500, 1000] as const;

export type Origen = keyof typeof ORIGENES;
export type Proceso = keyof typeof PROCESOS;
export type Tueste = keyof typeof TUESTES;
export type Config = { origen: Origen; proceso: Proceso; tueste: Tueste; metodo: Metodo; cantidad: (typeof CANTIDADES)[number]; nombre: string };

const clamp = (v: number) => Math.max(1, Math.min(5, Math.round(v)));

export function perfil(c: Config) {
  const o = ORIGENES[c.origen].base;
  const p = PROCESOS[c.proceso].ajuste;
  const t = TUESTES[c.tueste].ajuste;
  return {
    acidez: clamp(o.acidez + p.acidez + t.acidez),
    cuerpo: clamp(o.cuerpo + p.cuerpo + t.cuerpo),
    dulzor: clamp(o.dulzor + p.dulzor + t.dulzor),
    amargor: clamp(o.amargor + p.amargor + t.amargor),
  };
}

export function notas(c: Config) {
  const base: string[] = [...ORIGENES[c.origen].notas];
  if (c.tueste === "oscuro") return ["Cacao amargo", base[base.length - 1], "Caramelo tostado"];
  if (c.proceso !== "lavado") base[2] = PROCESOS[c.proceso].nota;
  return base;
}

export function recetaDe(c: Config) {
  const leido: Leido = {
    tostador: "Altura",
    pais: ORIGENES[c.origen].nombre,
    region: ORIGENES[c.origen].region,
    finca: null,
    variedad: null,
    proceso: PROCESOS[c.proceso].nombre,
    altitud: ORIGENES[c.origen].altitud,
    tueste: c.tueste,
    notas: notas(c),
    fechaTueste: null,
    esCafe: true,
  };
  return recetaPara(leido, c.metodo);
}

export function validarConfig(b: unknown): Config | null {
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  const nombre = typeof o.nombre === "string" ? o.nombre.replace(/[^\p{L}\p{N} .'-]/gu, "").trim().slice(0, 22) : "";
  if (
    typeof o.origen !== "string" || !(o.origen in ORIGENES) ||
    typeof o.proceso !== "string" || !(o.proceso in PROCESOS) ||
    typeof o.tueste !== "string" || !(o.tueste in TUESTES) ||
    typeof o.metodo !== "string" || !(o.metodo in METODOS) ||
    !CANTIDADES.includes(o.cantidad as never)
  )
    return null;
  return { ...(o as unknown as Config), nombre: nombre || "Mi café" };
}
