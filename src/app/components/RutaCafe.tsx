"use client";

import { useEffect, useRef, useState } from "react";
import { mapsParada, type Ruta } from "@/lib/ruta";

const PASOS = ["Buscando cafeterías de especialidad…", "Confirmando que existen hoy…", "Revisando puntajes y fuentes…", "Trazando la ruta a pie…"];
const SUGERENCIAS = ["Palermo, Buenos Aires", "Ciudad de México", "Medellín", "Madrid"];

function dominio(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "fuente";
  }
}

export default function RutaCafe() {
  const [lugar, setLugar] = useState("");
  const [ruta, setRuta] = useState<Ruta | null>(null);
  const [cargando, setCargando] = useState(false);
  const [paso, setPaso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const campo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cargando) return;
    const t = setInterval(() => setPaso((p) => Math.min(PASOS.length - 1, p + 1)), 1600);
    return () => clearInterval(t);
  }, [cargando]);

  // El botón de la portada lleva aquí y deja el campo listo.
  useEffect(() => {
    const alClic = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[data-enfocar="ruta"]');
      if (!a) return;
      setTimeout(() => campo.current?.focus({ preventScroll: true }), 900);
    };
    document.addEventListener("click", alClic);
    return () => document.removeEventListener("click", alClic);
  }, []);

  async function buscar(valor: string) {
    const q = valor.trim();
    if (q.length < 2 || cargando) return;
    setLugar(q);
    setCargando(true);
    setPaso(0);
    setError(null);
    setRuta(null);
    try {
      const res = await fetch("api/ruta", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lugar: q }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRuta(data.ruta);
      requestAnimationFrame(() => document.getElementById("ruta-resultado")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "No pudimos armar la ruta. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className="ruta" id="ruta" aria-labelledby="ruta-titulo">
      <div className="ruta-interior">
        <h2 id="ruta-titulo" className="stencil titulo-seccion">
          Ruta del café
        </h2>
        <p className="bajada">
          ¿De paseo en otra ciudad? Escribe dónde estás y armamos una ruta a pie por cafeterías de especialidad, con
          fuentes reales para cada parada.
        </p>

        <form
          className="ruta-buscar"
          onSubmit={(e) => {
            e.preventDefault();
            buscar(lugar);
          }}
        >
          <label htmlFor="ruta-lugar" className="sr-only">
            Ciudad o barrio
          </label>
          <svg viewBox="0 0 24 24" className="ruta-pin" aria-hidden="true">
            <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="12" cy="10" r="2.6" fill="currentColor" />
          </svg>
          <input
            id="ruta-lugar"
            ref={campo}
            type="text"
            value={lugar}
            maxLength={80}
            onChange={(e) => setLugar(e.target.value)}
            placeholder="Ciudad o barrio"
            autoComplete="off"
          />
          <button type="submit" className="sello" data-lleno="true" disabled={cargando || lugar.trim().length < 2}>
            {cargando ? "Buscando…" : "Armar mi ruta"}
          </button>
        </form>
        {!ruta && !cargando && (
          <div className="ruta-sugerencias">
            {SUGERENCIAS.map((s) => (
              <button key={s} type="button" className="filtro filtro-yute" onClick={() => buscar(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {cargando && (
          <p className="ruta-cargando dato" aria-live="polite">
            <span className="contador-punto" aria-hidden="true" /> {PASOS[paso]}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {ruta && (
          <div className="ruta-resultado" id="ruta-resultado" aria-live="polite">
            <div className="ruta-cabeza">
              <h3 className="stencil">{ruta.ciudad}</h3>
              <a className="sello" data-lleno="true" href={ruta.maps} target="_blank" rel="noopener noreferrer">
                Abrir ruta en Google Maps
              </a>
            </div>
            {ruta.consejo && <p className="ruta-consejo">{ruta.consejo}</p>}
            <ol className="ruta-paradas">
              {ruta.paradas.map((p, i) => (
                <li key={p.nombre + i} className="ruta-parada" style={{ "--i": i } as React.CSSProperties}>
                  <span className="ruta-numero stencil" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="ruta-ficha">
                    <div className="ruta-ficha-cabeza">
                      <h4 className="stencil">{p.nombre}</h4>
                      {p.puntaje !== null && (
                        <span className="ruta-puntaje dato" title={p.fuentePuntaje ? `Puntaje según ${p.fuentePuntaje}` : "Puntaje"}>
                          ★ {p.puntaje.toLocaleString("es")}
                          {p.fuentePuntaje && <small> · {p.fuentePuntaje}</small>}
                        </span>
                      )}
                    </div>
                    <p className="dato ruta-direccion">
                      {p.direccion}
                      {p.barrio && ` · ${p.barrio}`}
                    </p>
                    {p.destacado && <p className="ruta-destacado">{p.destacado}</p>}
                    <p className="ruta-links dato">
                      <a href={mapsParada(p, ruta.ciudad)} target="_blank" rel="noopener noreferrer">
                        Cómo llegar
                      </a>
                      <a href={p.fuente} target="_blank" rel="noopener noreferrer nofollow">
                        Fuente: {dominio(p.fuente)}
                      </a>
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="dato ruta-aviso">
              Resultados de una búsqueda web con IA. Revisa horarios antes de ir; los puntajes solo aparecen cuando una
              fuente los publica.
            </p>
            <button type="button" className="sello" onClick={() => { setRuta(null); setLugar(""); campo.current?.focus(); }}>
              Buscar otra ciudad
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
