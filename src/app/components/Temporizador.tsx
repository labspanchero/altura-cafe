"use client";

import { useEffect, useRef, useState } from "react";
import { METODOS, type Cafe, type Receta } from "@/lib/cafes";
import { etapasDe, mmss } from "@/lib/etapas";
import MetodoIcono from "./MetodoIcono";

type Props = { cafe: Cafe; receta: Receta; alCerrar: () => void };

function bip(frecuencia = 880) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const a = new Ctx();
    const o = a.createOscillator();
    const v = a.createGain();
    o.frequency.value = frecuencia;
    v.gain.setValueAtTime(0.0001, a.currentTime);
    v.gain.exponentialRampToValueAtTime(0.25, a.currentTime + 0.02);
    v.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.35);
    o.connect(v).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.4);
    setTimeout(() => a.close(), 600);
  } catch {
    // sin audio
  }
}

export default function Temporizador({ cafe, receta, alCerrar }: Props) {
  const etapas = etapasDe(receta) ?? [];
  const total = etapas.at(-1)?.hasta ?? 0;
  const [t, setT] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const inicio = useRef(0);
  const acumulado = useRef(0);
  const etapaPrevia = useRef(0);
  const dialogo = useRef<HTMLDialogElement>(null);
  const bloqueo = useRef<{ release: () => Promise<void> } | null>(null);

  const idx = Math.max(0, etapas.findIndex((e) => t < e.hasta));
  const etapa = t >= total ? etapas.at(-1) : etapas[idx];
  const terminado = t >= total && total > 0;
  const enEtapa = etapa ? Math.min(1, (t - etapa.desde) / Math.max(1, etapa.hasta - etapa.desde)) : 0;

  // agua esperada en la balanza, interpolada dentro de la etapa
  const aguaPrev = idx > 0 ? etapas[idx - 1].agua ?? 0 : 0;
  const aguaAhora = etapa?.agua == null ? null : Math.round(aguaPrev + (etapa.agua - aguaPrev) * (etapa.agua > aguaPrev ? Math.min(1, enEtapa * 1.6) : 1));
  const aguaMax = Math.max(1, ...etapas.map((e) => e.agua ?? 0));
  const nivel = terminado ? 1 : aguaAhora != null ? aguaAhora / aguaMax : t / Math.max(1, total);

  useEffect(() => {
    const d = dialogo.current;
    d?.showModal();
    const esc = (e: Event) => {
      e.preventDefault();
      alCerrar();
    };
    d?.addEventListener("cancel", esc);
    return () => d?.removeEventListener("cancel", esc);
  }, [alCerrar]);

  useEffect(() => {
    if (!corriendo) return;
    inicio.current = performance.now();
    let raf = 0;
    const paso = () => {
      const s = acumulado.current + (performance.now() - inicio.current) / 1000;
      setT(Math.min(total, s));
      if (s >= total) {
        acumulado.current = total;
        setCorriendo(false);
        return;
      }
      raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      acumulado.current += (performance.now() - inicio.current) / 1000;
    };
  }, [corriendo, total]);

  // aviso al cambiar de etapa y al terminar
  useEffect(() => {
    const actual = terminado ? etapas.length : idx;
    if (actual !== etapaPrevia.current && t > 0) {
      bip(terminado ? 660 : 880);
      navigator.vibrate?.(terminado ? [120, 80, 120] : 90);
    }
    etapaPrevia.current = actual;
  }, [idx, terminado, t, etapas.length]);

  // pantalla encendida mientras corre
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (corriendo && nav.wakeLock) {
      nav.wakeLock.request("screen").then((b) => (bloqueo.current = b)).catch(() => {});
    }
    return () => {
      bloqueo.current?.release().catch(() => {});
      bloqueo.current = null;
    };
  }, [corriendo]);

  const reiniciar = () => {
    setCorriendo(false);
    acumulado.current = 0;
    etapaPrevia.current = 0;
    setT(0);
  };

  const R = 46;
  const C = 2 * Math.PI * R;

  return (
    <dialog ref={dialogo} className="preparar" aria-labelledby="preparar-titulo" style={{ "--tinta": cafe.tintaClara } as React.CSSProperties}>
      <div className="preparar-cabeza">
        <div>
          <h2 id="preparar-titulo" className="stencil">
            {METODOS[receta.metodo].nombre}
          </h2>
          <p className="dato">
            {cafe.pais} {cafe.lote} · {receta.dosis} · {receta.agua} · {receta.temperatura} · molienda {receta.molienda.toLowerCase()}
          </p>
        </div>
        <button type="button" className="preparar-cerrar dato" onClick={alCerrar}>
          Cerrar
        </button>
      </div>

      <div className="preparar-cuerpo">
        <div className="preparar-reloj">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={R} className="aro-fondo" />
            <circle
              cx="50"
              cy="50"
              r={R}
              className="aro"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - t / Math.max(1, total))}
              transform="rotate(-90 50 50)"
            />
            {etapas.slice(0, -1).map((e) => {
              const a = (e.hasta / total) * Math.PI * 2 - Math.PI / 2;
              return <line key={e.nombre} x1={50 + Math.cos(a) * 41} y1={50 + Math.sin(a) * 41} x2={50 + Math.cos(a) * 51} y2={50 + Math.sin(a) * 51} className="aro-marca" />;
            })}
          </svg>
          <div className="preparar-centro">
            <div className="preparar-cafetera" aria-hidden="true">
              <div className="preparar-liquido" style={{ transform: `scaleY(${nivel})` }} />
              <MetodoIcono metodo={receta.metodo} className="preparar-icono" />
            </div>
            <span className="stencil preparar-tiempo" aria-live="off">
              {mmss(t)}
            </span>
            <span className="dato">de {mmss(total)}</span>
          </div>
        </div>

        <div className="preparar-etapa" aria-live="polite">
          {terminado ? (
            <>
              <h3 className="stencil">¡Listo!</h3>
              <p>Tu {cafe.pais} está servido. Busca {cafe.notas.slice(0, 2).join(" y ").toLowerCase()} en la taza.</p>
            </>
          ) : (
            <>
              <h3 className="stencil">{etapa?.nombre}</h3>
              <p>{etapa?.indicacion}</p>
              {aguaAhora != null && (
                <p className="preparar-agua dato">
                  Balanza <strong className="stencil">{aguaAhora} g</strong>
                </p>
              )}
            </>
          )}
          <ol className="preparar-pasos">
            {etapas.map((e, i) => (
              <li key={e.nombre} data-estado={terminado || i < idx ? "hecho" : i === idx ? "actual" : "pendiente"} className="dato">
                <span>{mmss(e.desde)}</span> {e.nombre}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="preparar-acciones">
        {!terminado && (
          <button type="button" className="sello sello-claro" data-lleno="true" onClick={() => setCorriendo((c) => !c)}>
            {corriendo ? "Pausar" : t > 0 ? "Seguir" : "Empezar"}
          </button>
        )}
        <button type="button" className="sello sello-claro" onClick={reiniciar} disabled={t === 0}>
          Reiniciar
        </button>
      </div>
    </dialog>
  );
}
