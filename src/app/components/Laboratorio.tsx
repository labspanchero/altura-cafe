"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { conTransicion } from "@/lib/transicion";
import Pedido from "./Pedido";
import TraeTuCafe from "./TraeTuCafe";
import RutaCafe from "./RutaCafe";

// Las herramientas con IA en una sola sección con pestañas. Los paneles quedan montados
// (no pierden estado) y los enlaces de siempre (#ruta, #barista, #tu-cafe…) abren su pestaña.
type Id = "ruta" | "barista" | "escanear";
const PESTANAS: { id: Id; n: string; corto: string; d: string; icono: React.ReactNode }[] = [
  {
    id: "ruta",
    n: "Ruta del café",
    corto: "Ruta",
    d: "Cafeterías donde estés",
    icono: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 42s12-10.6 12-20.5a12 12 0 1 0-24 0C12 31.4 24 42 24 42z" />
        <circle cx="24" cy="21" r="4.5" />
      </svg>
    ),
  },
  {
    id: "barista",
    n: "Barista y quiz",
    corto: "Barista",
    d: "Encuentra tu café",
    icono: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" />
      </svg>
    ),
  },
  {
    id: "escanear",
    n: "Escanea tu café",
    corto: "Escanear",
    d: "Foto del paquete → receta",
    icono: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M6 16v-6a4 4 0 0 1 4-4h6M32 6h6a4 4 0 0 1 4 4v6M42 32v6a4 4 0 0 1-4 4h-6M16 42h-6a4 4 0 0 1-4-4v-6" />
        <rect x="14" y="17" width="20" height="16" rx="2" />
        <circle cx="24" cy="25" r="4.5" />
      </svg>
    ),
  },
];
const ANCLAS: Record<string, Id> = {
  ruta: "ruta",
  "ruta-lugar": "ruta",
  barista: "barista",
  pedido: "barista",
  pregunta: "barista",
  "quiz-titulo": "barista",
  "tu-cafe": "escanear",
};

export default function Laboratorio() {
  const [activa, setActiva] = useState<Id>("ruta");

  useEffect(() => {
    const desdeHash = () => {
      const id = ANCLAS[location.hash.slice(1)];
      if (id) setActiva(id);
    };
    desdeHash();
    // En captura: la pestaña se muestra antes de que el navegador salte al ancla.
    const alClic = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='#']");
      const id = a && ANCLAS[(a.getAttribute("href") ?? "").slice(1)];
      if (id) flushSync(() => setActiva(id));
    };
    document.addEventListener("click", alClic, true);
    window.addEventListener("hashchange", desdeHash);
    return () => {
      document.removeEventListener("click", alClic, true);
      window.removeEventListener("hashchange", desdeHash);
    };
  }, []);

  function elegir(id: Id) {
    if (id === activa) return;
    conTransicion(() => setActiva(id));
    requestAnimationFrame(() => {
      const lab = document.getElementById("laboratorio");
      if (lab && lab.getBoundingClientRect().top < 0) lab.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function teclas(e: React.KeyboardEvent, i: number) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const sig = PESTANAS[(i + d + PESTANAS.length) % PESTANAS.length].id;
    elegir(sig);
    document.getElementById(`lab-tab-${sig}`)?.focus();
  }

  return (
    <section className="laboratorio" id="laboratorio" aria-labelledby="lab-titulo">
      <div className="lab-cabeza">
        <h2 id="lab-titulo" className="stencil titulo-seccion">
          El laboratorio
        </h2>
        <p className="bajada">Herramientas con IA para encontrar, preparar y salir a buscar tu próximo café.</p>
      </div>
      <div className="lab-pestanas" role="tablist" aria-label="Herramientas">
        {PESTANAS.map((p, i) => (
          <button
            key={p.id}
            id={`lab-tab-${p.id}`}
            type="button"
            role="tab"
            className="lab-pestana"
            aria-selected={activa === p.id}
            aria-controls={`lab-panel-${p.id}`}
            aria-label={p.n}
            tabIndex={activa === p.id ? 0 : -1}
            onClick={() => elegir(p.id)}
            onKeyDown={(e) => teclas(e, i)}
          >
            {p.icono}
            <span className="lab-pestana-texto">
              <span className="stencil lab-largo">{p.n}</span>
              <span className="stencil lab-corto" aria-hidden="true">
                {p.corto}
              </span>
              <span className="dato">{p.d}</span>
            </span>
          </button>
        ))}
      </div>
      {PESTANAS.map((p) => (
        <div key={p.id} id={`lab-panel-${p.id}`} role="tabpanel" aria-labelledby={`lab-tab-${p.id}`} className="lab-panel" hidden={activa !== p.id}>
          {p.id === "ruta" ? <RutaCafe /> : p.id === "barista" ? <Pedido /> : <TraeTuCafe />}
        </div>
      ))}
    </section>
  );
}
