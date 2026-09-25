"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CAFES, type Cafe } from "@/lib/cafes";

type Contexto = { cafes: Cafe[]; fuente: "cms" | "local"; cambiado: number | null; recien: boolean };
const CartaCtx = createContext<Contexto>({ cafes: CAFES, fuente: "local", cambiado: null, recien: false });

// La carta llega del servidor y se mantiene al día: cada pocos segundos se consulta
// si cambió en el CMS de Webflow y, si cambió, se actualiza sin recargar la página.
export function CartaProvider({ cafes: iniciales, fuente: fuenteInicial, cambiado: cambiadoInicial, children }: Omit<Contexto, "recien"> & { children: React.ReactNode }) {
  const [estado, setEstado] = useState<Contexto>({ cafes: iniciales, fuente: fuenteInicial, cambiado: cambiadoInicial, recien: false });

  useEffect(() => {
    if (fuenteInicial !== "cms") return;
    let ultimo = cambiadoInicial;
    let apagar: ReturnType<typeof setTimeout> | undefined;
    const revisar = async () => {
      if (document.hidden) return;
      try {
        const { cambiado } = (await (await fetch("api/carta/version", { cache: "no-store" })).json()) as { cambiado: number | null };
        if (!cambiado || cambiado === ultimo) return;
        const data = (await (await fetch("api/cafes", { cache: "no-store" })).json()) as { cafes: Cafe[]; fuente: "cms" | "local"; cambiado: number | null };
        if (!Array.isArray(data.cafes) || !data.cafes.length) return;
        ultimo = cambiado;
        setEstado({ cafes: data.cafes, fuente: data.fuente, cambiado, recien: true });
        clearTimeout(apagar);
        apagar = setTimeout(() => setEstado((e) => ({ ...e, recien: false })), 6000);
      } catch {
        // sin red: se reintenta en la próxima vuelta
      }
    };
    const t = setInterval(revisar, 6000);
    return () => {
      clearInterval(t);
      clearTimeout(apagar);
    };
  }, [fuenteInicial, cambiadoInicial]);

  return <CartaCtx.Provider value={estado}>{children}</CartaCtx.Provider>;
}

export function useCarta() {
  return useContext(CartaCtx);
}
