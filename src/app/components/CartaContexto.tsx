"use client";

import { createContext, useContext } from "react";
import { CAFES, type Cafe } from "@/lib/cafes";

type Contexto = { cafes: Cafe[]; fuente: "cms" | "local" };
const CartaCtx = createContext<Contexto>({ cafes: CAFES, fuente: "local" });

export function CartaProvider({ cafes, fuente, children }: Contexto & { children: React.ReactNode }) {
  return <CartaCtx.Provider value={{ cafes, fuente }}>{children}</CartaCtx.Provider>;
}

export function useCarta() {
  return useContext(CartaCtx);
}
