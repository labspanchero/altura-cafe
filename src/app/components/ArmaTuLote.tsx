"use client";

import { useState } from "react";
import BolsaDorada from "./BolsaDorada";
import { METODOS, METODOS_ORDEN, type Cafe } from "@/lib/cafes";
import { CANTIDADES, ORIGENES, PROCESOS, TUESTES, moliendaPedido, nombreMetodo, notas, perfil, recetaDe, type Config, type MetodoPedido } from "@/lib/armar";
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
  const nombre = c.nombre.trim() || "Mi café";
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
          Arma tu café
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
                Tu café <strong>{pedido.config.nombre}</strong>: {ORIGENES[pedido.config.origen].nombre}, proceso{" "}
                {PROCESOS[pedido.config.proceso].nombre.toLowerCase()}, tueste {TUESTES[pedido.config.tueste].nombre.toLowerCase()},{" "}
                {pedido.config.metodo === "grano" ? "en grano" : `molido para ${METODOS[pedido.config.metodo].nombre}`} · {pedido.config.cantidad >= 1000 ? "1 kg" : `${pedido.config.cantidad} g`}.
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
                  Armar otro café
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
                <legend className="dato">4 · Molienda: en grano o para tu método</legend>
                <Opciones
                  nombre="metodo"
                  valor={c.metodo}
                  alCambiar={(v) => set("metodo", v as MetodoPedido)}
                  opciones={[
                    {
                      v: "grano" as MetodoPedido,
                      n: "En grano",
                      d: "Lo mueles en casa",
                      icono: (
                        <svg viewBox="0 0 64 64" className="metodo-icono" aria-hidden="true">
                          <ellipse cx="32" cy="32" rx="16" ry="23" transform="rotate(28 32 32)" fill="none" stroke="currentColor" strokeWidth="3" />
                          <path d="M26 12 C40 24 22 38 38 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      ),
                    },
                    ...METODOS_ORDEN.map((m) => ({ v: m as MetodoPedido, n: METODOS[m].nombre, d: METODOS[m].molienda, icono: <MetodoIcono metodo={m} /> })),
                  ]}
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
                  <span className="dato">Nombre de tu café</span>
                  <input type="text" value={c.nombre} maxLength={22} onChange={(e) => set("nombre", e.target.value)} placeholder="Ej.: Café Nerdearla" />
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
                {c.metodo === "grano" ? "En grano. Muélelo justo antes de preparar; receta sugerida en V60" : METODOS[c.metodo].nombre}: molienda {receta.molienda.toLowerCase()} · {receta.dosis} · {receta.agua} · {receta.temperatura} · {receta.tiempo}
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
  const cantidad = c.cantidad >= 1000 ? "1 kg" : `${c.cantidad} g`;
  return (
    <BolsaDorada
      nombre={nombre}
      titulo={o.nombre}
      subtitulo={`${o.region} · ${PROCESOS[c.proceso].nombre}`}
      datos={[
        ["Altitud", `${o.altitud.toLocaleString("es")} msnm`],
        ["Tueste", TUESTES[c.tueste].nombre],
        ["Notas", notas(c).slice(0, 2).join(" · ")],
      ]}
      pie={`${nombreMetodo(c.metodo)} · ${cantidad} · ${moliendaPedido(c.metodo)}`}
      tinta={o.tinta}
      sellos={[
        ["ORIGEN", o.nombre.toUpperCase()],
        ["PROCESO", PROCESOS[c.proceso].nombre.toUpperCase()],
        ["TUESTE", TUESTES[c.tueste].nombre.toUpperCase()],
        [c.metodo === "grano" ? "FORMATO" : "MÉTODO", c.metodo === "grano" ? "GRANO" : nombreMetodo(c.metodo).toUpperCase()],
        ["PESO", cantidad.toUpperCase()],
      ]}
    />
  );
}
