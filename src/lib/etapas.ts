import type { Metodo, Receta } from "./cafes";

export type Etapa = { nombre: string; desde: number; hasta: number; agua: number | null; indicacion: string };

// "2:45" → 165 s. Devuelve null para tiempos que no son de reloj (ej. "16 h").
export function segundos(tiempo: string): number | null {
  const m = tiempo.trim().match(/^(\d+):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

const gramos = (v: string) => {
  const n = Number(v.replace(/[^\d.,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

// Etapas de preparación derivadas de la receta: el total y el agua salen de la carta.
export function etapasDe(r: Receta): Etapa[] | null {
  const total = segundos(r.tiempo);
  if (!total) return null;
  const agua = gramos(r.agua);
  const dosis = gramos(r.dosis);
  const t = (f: number) => Math.round(total * f);
  const g = (f: number) => Math.round(agua * f);
  const floracion = Math.min(agua, Math.round(dosis * 2.5));

  const porMetodo: Record<Metodo, () => Etapa[]> = {
    v60: () => [
      { nombre: "Floración", desde: 0, hasta: 40, agua: floracion, indicacion: `Vierte ${floracion} g en círculos y deja que el café libere gas.` },
      { nombre: "Primer vertido", desde: 40, hasta: t(0.5), agua: g(0.6), indicacion: `Vierte en espiral lenta hasta ${g(0.6)} g.` },
      { nombre: "Segundo vertido", desde: t(0.5), hasta: t(0.72), agua, indicacion: `Completa hasta ${agua} g sin tocar las paredes.` },
      { nombre: "Drenado", desde: t(0.72), hasta: total, agua, indicacion: "Gira el cono con suavidad y deja que termine de filtrar." },
    ],
    chemex: () => [
      { nombre: "Floración", desde: 0, hasta: 45, agua: floracion, indicacion: `Vierte ${floracion} g y espera que el café se hinche.` },
      { nombre: "Primer vertido", desde: 45, hasta: t(0.45), agua: g(0.55), indicacion: `Vierte en el centro hasta ${g(0.55)} g.` },
      { nombre: "Segundo vertido", desde: t(0.45), hasta: t(0.7), agua, indicacion: `Completa hasta ${agua} g.` },
      { nombre: "Drenado", desde: t(0.7), hasta: total, agua, indicacion: "El filtro grueso tarda: espera a que caiga la última gota." },
    ],
    aeropress: () => [
      { nombre: "Vertido", desde: 0, hasta: 15, agua, indicacion: `Vierte los ${agua} g de una vez.` },
      { nombre: "Infusión", desde: 15, hasta: Math.max(20, total - 30), agua, indicacion: "Revuelve tres veces, coloca el émbolo y espera." },
      { nombre: "Presionar", desde: Math.max(20, total - 30), hasta: total, agua, indicacion: "Presiona parejo, unos 30 segundos, hasta el siseo." },
    ],
    prensa: () => [
      { nombre: "Vertido", desde: 0, hasta: 20, agua, indicacion: `Vierte los ${agua} g sobre el café molido grueso.` },
      { nombre: "Infusión", desde: 20, hasta: Math.max(30, total - 40), agua, indicacion: "Tapa sin presionar y deja reposar." },
      { nombre: "Romper la costra", desde: Math.max(30, total - 40), hasta: Math.max(35, total - 20), agua, indicacion: "Revuelve la superficie y retira la espuma." },
      { nombre: "Prensar y servir", desde: Math.max(35, total - 20), hasta: total, agua, indicacion: "Baja el émbolo despacio y sirve enseguida." },
    ],
    espresso: () => [
      { nombre: "Preinfusión", desde: 0, hasta: Math.min(6, total), agua: null, indicacion: "Las primeras gotas: el café se humedece." },
      { nombre: "Extracción", desde: Math.min(6, total), hasta: total, agua, indicacion: `Busca ${agua} g en la taza, con un chorro fino y color avellana.` },
    ],
    moka: () => [
      { nombre: "Calentar", desde: 0, hasta: t(0.6), agua: null, indicacion: "Fuego medio con la tapa abierta. Espera a que empiece a subir." },
      { nombre: "Sube el café", desde: t(0.6), hasta: t(0.9), agua: null, indicacion: "Baja el fuego: el chorro debe ser parejo y color miel." },
      { nombre: "Retirar", desde: t(0.9), hasta: total, agua: null, indicacion: "Cuando empiece a borbotear, sácala del fuego y enfría la base." },
    ],
    coldbrew: () => [],
  };
  const etapas = porMetodo[r.metodo]();
  return etapas.length ? etapas : null;
}

export function mmss(s: number) {
  const v = Math.max(0, Math.round(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`;
}
