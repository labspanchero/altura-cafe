"use client";

import { useEffect, useRef, useState } from "react";

// Contador en vivo de personas que encontraron su café con el quiz.
export default function ContadorVivo() {
  const [total, setTotal] = useState<number | null>(null);
  const [mostrado, setMostrado] = useState(0);
  const anterior = useRef(0);

  useEffect(() => {
    let vivo = true;
    const leer = () =>
      fetch("api/contador")
        .then((r) => r.json())
        .then((d) => vivo && typeof d.encontrados === "number" && setTotal(d.encontrados))
        .catch(() => {});
    leer();
    const t = setInterval(leer, 30000);
    const sumar = () => setTotal((n) => (n ?? 0) + 1);
    window.addEventListener("altura:encontrado", sumar);
    return () => {
      vivo = false;
      clearInterval(t);
      window.removeEventListener("altura:encontrado", sumar);
    };
  }, []);

  // El número sube contando, salvo con movimiento reducido.
  useEffect(() => {
    if (total === null) return;
    const desde = anterior.current;
    anterior.current = total;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || total - desde < 2) {
      setMostrado(total);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / 1200);
      setMostrado(Math.round(desde + (total - desde) * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  if (total === null) return null;
  return (
    <a className="contador-vivo" href="#pedido">
      <span className="contador-punto" aria-hidden="true" />
      {total === 0 ? (
        <span className="dato">Sé la primera persona en encontrar su café</span>
      ) : (
        <span className="dato">
          <strong className="stencil">{mostrado.toLocaleString("es")}</strong>{" "}
          {total === 1 ? "persona ya encontró su café" : "personas ya encontraron su café"} en Nerdearla
        </span>
      )}
    </a>
  );
}
