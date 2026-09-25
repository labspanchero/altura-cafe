import { CAFES, METODOS, type Cafe, type Metodo, type Perfil, type Receta } from "./cafes";
import { bindings } from "./entorno";

// La carta vive en el CMS de Webflow (sitio altura-cms, colección "Lotes"),
// cargada con el MCP de Webflow. Se lee con la Data API, se cachea en KV y,
// si algo falla, se usa la carta local.
const COLECCION = process.env.WEBFLOW_COLLECTION_ID ?? "6ab5febfaaaa32050b28006c";
const CACHE_CLAVE = "carta:v2";
const CACHE_SEG = 300;

const TUESTES: Record<string, Cafe["tueste"]> = {
  "2e480f01beae9d32347fcd2ae63fdd28": "Claro",
  bde9ec1e361560f34f9c8c1cfab82368: "Medio claro",
  d0bcbccdd724efd81772b646352dfaf6: "Medio",
  "64f580f3b3848cbfdfe5af4fb168b417": "Medio oscuro",
};

export type Fuente = "cms" | "local";
export type Carta = { cafes: Cafe[]; fuente: Fuente };

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

export async function obtenerCarta(): Promise<Carta> {
  const { LIMITES } = bindings();
  try {
    const cache = await LIMITES?.get(CACHE_CLAVE);
    if (cache) return { cafes: JSON.parse(cache) as Cafe[], fuente: "cms" };
  } catch {
    // cache ilegible: se ignora
  }
  try {
    const cafes = await desdeCms();
    if (cafes) {
      await LIMITES?.put(CACHE_CLAVE, JSON.stringify(cafes), { expirationTtl: CACHE_SEG }).catch(() => {});
      return { cafes, fuente: "cms" };
    }
  } catch {
    // el CMS no respondió a tiempo: carta local
  }
  return { cafes: CAFES, fuente: "local" };
}
