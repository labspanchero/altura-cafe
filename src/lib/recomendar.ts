import { CAFES, METODOS, type Cafe, type Metodo, type Perfil } from "./cafes";

export type Respuestas = {
  metodo: Metodo;
  perfil: Perfil;
  acidez: "brillante" | "equilibrada" | "baja";
  leche: boolean;
};

const ACIDEZ_OBJETIVO = { brillante: 5, equilibrada: 3, baja: 1 } as const;

export function recomendar(r: Respuestas) {
  const puntuados = CAFES.map((cafe) => {
    let score = 0;
    if (cafe.perfil.includes(r.perfil)) score += 4;
    score -= Math.abs(cafe.sensorial.acidez - ACIDEZ_OBJETIVO[r.acidez]) * 1.2;
    if (cafe.recetas.some((x) => x.metodo === r.metodo)) score += 3;
    if (r.leche === cafe.conLeche) score += 2;
    if (r.leche && cafe.sensorial.cuerpo >= 4) score += 1;
    return { cafe, score };
  }).sort((a, b) => b.score - a.score);

  const elegido: Cafe = puntuados[0].cafe;
  const receta =
    elegido.recetas.find((x) => x.metodo === r.metodo) ?? elegido.recetas[0];
  const ajustado = receta.metodo !== r.metodo;

  return {
    cafe: elegido,
    receta,
    metodo: METODOS[receta.metodo],
    ajustado,
    alternativa: puntuados[1].cafe,
  };
}

export function validarRespuestas(body: unknown): Respuestas | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const metodos = Object.keys(METODOS);
  const perfiles = ["floral", "frutal", "chocolate", "caramelo"];
  const acideces = ["brillante", "equilibrada", "baja"];
  if (
    typeof b.metodo !== "string" || !metodos.includes(b.metodo) ||
    typeof b.perfil !== "string" || !perfiles.includes(b.perfil) ||
    typeof b.acidez !== "string" || !acideces.includes(b.acidez) ||
    typeof b.leche !== "boolean"
  ) {
    return null;
  }
  return b as unknown as Respuestas;
}
