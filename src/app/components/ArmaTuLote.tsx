"use client";

import { useEffect, useState } from "react";
import { texturaArpillera } from "@/lib/arpillera";
import { METODOS, METODOS_ORDEN, type Cafe, type Metodo } from "@/lib/cafes";
import { CANTIDADES, ORIGENES, PROCESOS, TUESTES, notas, perfil, recetaDe, type Config } from "@/lib/armar";
import { etapasDe } from "@/lib/etapas";
import MetodoIcono from "./MetodoIcono";
import Temporizador from "./Temporizador";

const SENSORIAL = [
  ["acidez", "Acidez"],
  ["cuerpo", "Cuerpo"],
  ["dulzor", "Dulzor"],
  ["amargor", "Amargor"],
] as const;

function Opciones<T extends string>({
  nombre,
  valor,
  opciones,
  alCambiar,
}: {
  nombre: string;
  valor: T;
  opciones: { v: T; n: string; d?: string; icono?: React.ReactNode }[];
  alCambiar: (v: T) => void;
}) {
  return (
    <div className="arma-opciones" role="radiogroup" aria-label={nombre}>
      {opciones.map((o) => (
        <label key={o.v} className="arma-opcion" data-activa={valor === o.v}>
          <input type="radio" name={nombre} value={o.v} checked={valor === o.v} onChange={() => alCambiar(o.v)} />
          {o.icono}
          <span className="dato arma-opcion-nombre">{o.n}</span>
          {o.d && <span className="arma-opcion-desc">{o.d}</span>}
        </label>
      ))}
    </div>
  );
}

export default function ArmaTuLote() {
  const [c, setC] = useState<Config>({ origen: "colombia", proceso: "lavado", tueste: "medio", metodo: "v60", cantidad: 250, nombre: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedido, setPedido] = useState<{ numero: string; config: Config } | null>(null);
  const [preparando, setPreparando] = useState(false);
  const set = <K extends keyof Config>(k: K, v: Config[K]) => setC((x) => ({ ...x, [k]: v }));

  const o = ORIGENES[c.origen];
  const pf = perfil(c);
  const nt = notas(c);
  const receta = recetaDe(c);
  const nombre = c.nombre.trim() || "Mi lote";
  const comoCafe = {
    id: "mi-lote",
    lote: "MI LOTE",
    pais: nombre,
    region: o.region,
    notas: nt,
    tinta: o.tinta,
    tintaClara: o.clara,
    recetas: [receta],
  } as unknown as Cafe;

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch("api/pedido", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...c, nombre }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPedido(data);
      requestAnimationFrame(() => document.getElementById("arma-gracias")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "No pudimos registrar tu pedido.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="arma" id="arma" aria-labelledby="arma-titulo" style={{ "--tinta": o.tinta } as React.CSSProperties}>
      <div className="arma-interior">
        <h2 id="arma-titulo" className="stencil titulo-seccion">
          Arma tu lote
        </h2>
        <p className="bajada">
          Elige la cereza, el proceso y el tueste. Te mostramos cómo va a saber y cómo prepararlo, y lo embolsamos con tu nombre.
        </p>

        {pedido ? (
          <div className="arma-gracias" id="arma-gracias" aria-live="polite">
            <div className="arma-saco-grande">
              <SacoMiLote nombre={pedido.config.nombre} c={pedido.config} />
            </div>
            <div>
              <h3 className="stencil">¡Gracias por tu pedido!</h3>
              <p className="dato arma-numero">
                Orden <strong className="stencil">{pedido.numero}</strong>
              </p>
              <p>
                Tu lote <strong>{pedido.config.nombre}</strong>: {ORIGENES[pedido.config.origen].nombre}, proceso{" "}
                {PROCESOS[pedido.config.proceso].nombre.toLowerCase()}, tueste {TUESTES[pedido.config.tueste].nombre.toLowerCase()},{" "}
                molido para {METODOS[pedido.config.metodo].nombre} · {pedido.config.cantidad >= 1000 ? "1 kg" : `${pedido.config.cantidad} g`}.
              </p>
              <ol className="arma-estado dato">
                <li data-hecho="true">Pedido recibido</li>
                <li>Tostado</li>
                <li>Molienda y empaque</li>
                <li>Despacho</li>
              </ol>
              <p className="arma-demo dato">Pedido de demostración: no se cobra ni se envía nada.</p>
              <div className="resultado-acciones">
                {etapasDe(receta) && (
                  <button type="button" className="sello" data-lleno="true" onClick={() => setPreparando(true)}>
                    Ver cómo prepararlo
                  </button>
                )}
                <button type="button" className="sello" onClick={() => setPedido(null)}>
                  Armar otro lote
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form className="arma-grilla" onSubmit={pedir}>
            <div className="arma-pasos">
              <fieldset>
                <legend className="dato">1 · La cereza</legend>
                <Opciones
                  nombre="origen"
                  valor={c.origen}
                  alCambiar={(v) => set("origen", v)}
                  opciones={(Object.keys(ORIGENES) as (keyof typeof ORIGENES)[]).map((k) => ({
                    v: k,
                    n: ORIGENES[k].nombre,
                    d: `${ORIGENES[k].altitud.toLocaleString("es")} msnm`,
                    icono: <span className="arma-punto" style={{ background: ORIGENES[k].tinta }} aria-hidden="true" />,
                  }))}
                />
              </fieldset>
              <fieldset>
                <legend className="dato">2 · El proceso</legend>
                <Opciones
                  nombre="proceso"
                  valor={c.proceso}
                  alCambiar={(v) => set("proceso", v)}
                  opciones={(Object.keys(PROCESOS) as (keyof typeof PROCESOS)[]).map((k) => ({ v: k, n: PROCESOS[k].nombre, d: PROCESOS[k].desc }))}
                />
              </fieldset>
              <fieldset>
                <legend className="dato">3 · El tueste</legend>
                <Opciones
                  nombre="tueste"
                  valor={c.tueste}
                  alCambiar={(v) => set("tueste", v)}
                  opciones={(Object.keys(TUESTES) as (keyof typeof TUESTES)[]).map((k) => ({
                    v: k,
                    n: TUESTES[k].nombre,
                    d: TUESTES[k].desc,
                    icono: <span className={`arma-tueste arma-tueste-${k}`} aria-hidden="true" />,
                  }))}
                />
              </fieldset>
              <fieldset>
                <legend className="dato">4 · Tu método (define la molienda)</legend>
                <Opciones
                  nombre="metodo"
                  valor={c.metodo}
                  alCambiar={(v) => set("metodo", v as Metodo)}
                  opciones={METODOS_ORDEN.map((m) => ({ v: m, n: METODOS[m].nombre, d: METODOS[m].molienda, icono: <MetodoIcono metodo={m} /> }))}
                />
              </fieldset>
              <fieldset>
                <legend className="dato">5 · Cantidad y nombre</legend>
                <Opciones
                  nombre="cantidad"
                  valor={String(c.cantidad)}
                  alCambiar={(v) => set("cantidad", Number(v) as Config["cantidad"])}
                  opciones={CANTIDADES.map((q) => ({ v: String(q), n: q >= 1000 ? "1 kg" : `${q} g` }))}
                />
                <label className="arma-nombre">
                  <span className="dato">Nombre de tu lote</span>
                  <input type="text" value={c.nombre} maxLength={22} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej.: Lote Nerdearla" />
                </label>
              </fieldset>
            </div>

            <aside className="arma-vista" aria-live="polite">
              <SacoMiLote nombre={nombre} c={c} />
              <ul className="notas notas-yute">
                {nt.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              {SENSORIAL.map(([k, n]) => (
                <div className="medidor" key={k}>
                  <span className="dato">{n}</span>
                  <span className="medidor-escala medidor-yute" role="img" aria-label={`${n}: ${pf[k]} de 5`}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} data-lleno={i < pf[k]} />
                    ))}
                  </span>
                  <span className="dato">{pf[k]}</span>
                </div>
              ))}
              <p className="dato arma-receta">
                {METODOS[c.metodo].nombre}: molienda {receta.molienda.toLowerCase()} · {receta.dosis} · {receta.agua} · {receta.temperatura} · {receta.tiempo}
              </p>
              <button type="submit" className="sello" data-lleno="true" disabled={enviando}>
                {enviando ? "Embolsando…" : "Hacer mi pedido"}
              </button>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <p className="dato arma-demo">Demostración: no se cobra ni se envía nada.</p>
            </aside>
          </form>
        )}
      </div>
      {preparando && <Temporizador cafe={comoCafe} receta={receta} alCerrar={() => setPreparando(false)} />}
    </section>
  );
}

function SacoMiLote({ nombre, c }: { nombre: string; c: Config }) {
  const o = ORIGENES[c.origen];
  const [trama, setTrama] = useState("");
  useEffect(() => setTrama(texturaArpillera()), []);
  const forma = "M14 34 Q24 6 58 18 L242 18 Q276 6 286 34 L292 352 Q292 376 266 378 L34 378 Q8 376 8 352Z";
  const largo = nombre.length;
  const tam = Math.min(56, Math.floor(420 / Math.max(largo, 1)));
  return (
    <svg className="arma-saco" viewBox="0 0 300 380" role="img" aria-label={`Saco de ${nombre}`}>
      <defs>
        <pattern id="trama-arma" width="64" height="64" patternUnits="userSpaceOnUse">
          <rect width="64" height="64" fill="#a67f47" />
          {trama && <image href={trama} width="64" height="64" />}
        </pattern>
        <radialGradient id="volumen-arma" cx="45%" cy="38%" r="75%">
          <stop offset="0" stopColor="#fff3dc" stopOpacity="0.18" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1c1710" stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <path d={forma} fill="url(#trama-arma)" />
      <path d={forma} fill="url(#volumen-arma)" stroke="var(--ink)" strokeWidth="4" />
      <path d="M14 50 Q150 62 286 50" stroke="var(--ink)" strokeWidth="2" strokeDasharray="8 6" fill="none" />
      <text x="150" y="110" textAnchor="middle" className="stencil" fontSize={tam} fill="var(--ink)" textLength={largo > 8 ? 250 : undefined} lengthAdjust="spacingAndGlyphs">
        {nombre.toUpperCase()}
      </text>
      <g stroke={o.tinta} fill="none" strokeWidth="4">
        <rect x="36" y="140" width="228" height="54" />
        <rect x="36" y="210" width="108" height="46" transform="rotate(-3 90 233)" />
        <rect x="156" y="212" width="108" height="46" transform="rotate(3 210 235)" />
      </g>
      <text x="150" y="178" textAnchor="middle" className="stencil" fontSize="30" fill={o.tinta}>
        {o.nombre.toUpperCase()}
      </text>
      <text x="90" y="241" textAnchor="middle" className="stencil" fontSize="20" fill={o.tinta} transform="rotate(-3 90 233)">
        {PROCESOS[c.proceso].nombre.toUpperCase()}
      </text>
      <text x="210" y="243" textAnchor="middle" className="stencil" fontSize="20" fill={o.tinta} transform="rotate(3 210 235)">
        {TUESTES[c.tueste].nombre.toUpperCase()}
      </text>
      <text x="150" y="312" textAnchor="middle" className="dato" fontSize="18" fill="var(--ink)">
        {METODOS[c.metodo].nombre.toUpperCase()} · {c.cantidad >= 1000 ? "1 KG" : `${c.cantidad} G`}
      </text>
      <text x="150" y="340" textAnchor="middle" className="dato" fontSize="14" fill="var(--ink-soft)">
        {o.region.toUpperCase()} · {o.altitud} MSNM
      </text>
    </svg>
  );
}
