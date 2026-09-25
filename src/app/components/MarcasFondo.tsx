"use client";

import { useEffect, useRef } from "react";

// Marcas de exportación gigantes y gastadas detrás de las secciones de yute.
// Se desplazan apenas más lento que el scroll para dar profundidad.
const MARCAS = [
  { texto: ["PRODUCE OF", "ETHIOPIA"], top: "6%", left: "54%", giro: -8, tam: 13, vel: 0.12 },
  { texto: ["ALT-07"], top: "17%", left: "-4%", giro: 6, tam: 20, vel: 0.2 },
  { texto: ["60 KG NET"], top: "30%", left: "48%", giro: -4, tam: 11, vel: 0.1 },
  { texto: ["GUJI · 2150 M"], top: "43%", left: "2%", giro: 3, tam: 9, vel: 0.16 },
  { texto: ["GREEN COFFEE", "WASHED"], top: "54%", left: "52%", giro: -7, tam: 9, vel: 0.14 },
  { texto: ["LOT 07 · 2025/26"], top: "84%", left: "40%", giro: 4, tam: 8, vel: 0.12 },
  { texto: ["ALTURA", "EXPORT"], top: "92%", left: "-2%", giro: -5, tam: 12, vel: 0.18 },
];

export default function MarcasFondo() {
  const capa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = capa.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hijos = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const mover = () => {
      raf = 0;
      const y = window.scrollY;
      hijos.forEach((h, i) => {
        h.style.translate = `0 ${(y * MARCAS[i].vel).toFixed(1)}px`;
      });
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(mover);
    };
    window.addEventListener("scroll", pedir, { passive: true });
    mover();
    return () => {
      window.removeEventListener("scroll", pedir);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={capa} className="marcas-fondo" aria-hidden="true">
      {MARCAS.map((m) => (
        <span
          key={m.texto.join()}
          className="stencil marca-fondo"
          style={{ top: m.top, left: m.left, rotate: `${m.giro}deg`, fontSize: `${m.tam}vw` }}
        >
          {m.texto.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </span>
      ))}
    </div>
  );
}
