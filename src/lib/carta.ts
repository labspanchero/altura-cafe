import { CAFES, METODOS, type Cafe, type Metodo, type Perfil, type Receta } from "./cafes";
import { bindings } from "./entorno";

// La carta vive en el CMS de Webflow (sitio altura-cms, colección "Lotes"),
// cargada con el MCP de Webflow. Se lee con la Data API y se guarda en SQLite:
// cuando Webflow avisa un cambio (webhook) se vuelve a leer al instante; si no,
// cada 5 minutos. Si algo falla, se usa la carta local.
export const COLECCION = process.env.WEBFLOW_COLLECTION_ID ?? "6ab5febfaaaa32050b28006c";
const CACHE_SEG = 300;

const TUESTES: Record<string, Cafe["tueste"]> = {
  "2e480f01beae9d32347fcd2ae63fdd28": "Claro",
  bde9ec1e361560f34f9c8c1cfab82368: "Medio claro",
  d0bcbccdd724efd81772b646352dfaf6: "Medio",
  "64f580f3b3848cbfdfe5af4fb168b417": "Medio oscuro",
};

export type Fuente = "cms" | "local";
// cambiado: segundos Unix del último cambio real de contenido en el CMS.
export type Carta = { cafes: Cafe[]; fuente: Fuente; cambiado: number | null };

type Item = { fieldData: Record<string, unknown>; isDraft?: boolean; isArchived?: boolean };

const texto = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const numero = (v: unknown) => (typeof v === "number" ? v : Number(v));
const lista = (v: unknown) =>
  texto(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

function recetas(v: unknown): Receta[] {
  return texto(v)
    .split("\n")
    .map((l) => l.split("|").map((s) => s.trim()))
    .filter((p) => p.length === 6 && p[0] in METODOS)
    .map(([metodo, molienda, dosis, agua, temperatura, tiempo]) => ({
      metodo: metodo as Metodo,
      molienda,
      dosis,
      agua,
      temperatura,
      tiempo,
    }));
}

export function itemACafe(item: Item): Cafe | null {
  const f = item.fieldData;
  const cafe: Cafe = {
    id: texto(f.slug),
    lote: texto(f.lote),
    pais: texto(f.pais),
    region: texto(f.region),
    finca: texto(f.finca),
    productor: texto(f.productor),
    altitud: numero(f.altitud),
    variedad: texto(f.variedad),
    proceso: texto(f.proceso),
    secado: texto(f.secado),
    tueste: TUESTES[texto(f.tueste)] ?? "Medio",
    puntaje: numero(texto(f.puntaje).replace(",", ".")),
    cosecha: texto(f.cosecha),
    tinta: texto(f.tinta) || "#1c1710",
    tintaClara: texto(f["tinta-clara"]) || texto(f.tinta) || "#efe4cf",
    notas: lista(f["notas-de-cata"]),
    aroma: texto(f.aroma),
    perfil: lista(f.perfil).filter((p): p is Perfil => ["floral", "frutal", "chocolate", "caramelo"].includes(p)),
    sensorial: {
      acidez: numero(f.acidez),
      cuerpo: numero(f.cuerpo),
      dulzor: numero(f.dulzor),
      amargor: numero(f.amargor),
    },
    conLeche: f["va-con-leche"] === true,
    recetas: recetas(f.recetas),
    historia: texto(f.historia),
  };
  const valido =
    cafe.id && cafe.lote && cafe.pais && Number.isFinite(cafe.altitud) && Number.isFinite(cafe.puntaje) && cafe.recetas.length > 0;
  return valido ? cafe : null;
}

async function desdeCms(): Promise<Cafe[] | null> {
  const token = process.env.WEBFLOW_API_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://api.webflow.com/v2/collections/${COLECCION}/items?limit=100`, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    signal: AbortSignal.timeout(3500),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: Item[] };
  const cafes = (data.items ?? [])
    .filter((i) => !i.isArchived && !i.isDraft)
    .map(itemACafe)
    .filter((c): c is Cafe => c !== null);
  // Orden estable: el de la carta original; los lotes nuevos del CMS van al final.
  const orden = new Map(CAFES.map((c, i) => [c.id, i]));
  cafes.sort((a, b) => (orden.get(a.id) ?? 99) - (orden.get(b.id) ?? 99) || a.lote.localeCompare(b.lote));
  return cafes.length ? cafes : null;
}

type Fila = { datos: string; huella: string; leido: number; cambiado: number };
let memoria: Fila | null = null;

async function leerFila(): Promise<Fila | null> {
  const { DB } = bindings();
  if (!DB) return memoria;
  try {
    const { results } = await DB.prepare("SELECT datos, huella, leido, cambiado FROM carta WHERE id = 1").all<Fila>();
    return results[0] ?? null;
  } catch {
    return null;
  }
}

async function huellaDe(texto: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(b).slice(0, 12)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

// Lee el CMS y guarda la carta. Devuelve null si el CMS no respondió.
export async function refrescarCarta(): Promise<Carta | null> {
  const cafes = await desdeCms().catch(() => null);
  if (!cafes) return null;
  const datos = JSON.stringify(cafes);
  const huella = await huellaDe(datos);
  const ahora = Math.floor(Date.now() / 1000);
  const previa = await leerFila();
  const cambiado = previa && previa.huella === huella ? previa.cambiado : ahora;
  const fila = { datos, huella, leido: ahora, cambiado };
  const { DB } = bindings();
  if (!DB) memoria = fila;
  else
    await DB.prepare(
      "INSERT INTO carta (id, datos, huella, leido, cambiado) VALUES (1, ?1, ?2, ?3, ?4) ON CONFLICT(id) DO UPDATE SET datos = ?1, huella = ?2, leido = ?3, cambiado = ?4",
    )
      .bind(datos, huella, ahora, cambiado)
      .run()
      .catch(() => {});
  return { cafes, fuente: "cms", cambiado };
}

export async function versionCarta(): Promise<number | null> {
  return (await leerFila())?.cambiado ?? null;
}

export async function obtenerCarta(): Promise<Carta> {
  const fila = await leerFila();
  if (fila && Date.now() / 1000 - fila.leido < CACHE_SEG) {
    try {
      return { cafes: JSON.parse(fila.datos) as Cafe[], fuente: "cms", cambiado: fila.cambiado };
    } catch {
      // fila ilegible: se vuelve a leer el CMS
    }
  }
  const fresca = await refrescarCarta();
  if (fresca) return fresca;
  if (fila) return { cafes: JSON.parse(fila.datos) as Cafe[], fuente: "cms", cambiado: fila.cambiado };
  return { cafes: CAFES, fuente: "local", cambiado: null };
}
