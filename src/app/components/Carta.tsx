"use client";

import { useState } from "react";
import { CAFES, METODOS, type Cafe, type Perfil } from "@/lib/cafes";

const FILTROS: { id: "todos" | Perfil | "leche"; nombre: string }[] = [
  { id: "todos", nombre: "Todos" },
  { id: "floral", nombre: "Floral" },
  { id: "frutal", nombre: "Frutal" },
  { id: "chocolate", nombre: "Chocolate" },
  { id: "caramelo", nombre: "Caramelo" },
  { id: "leche", nombre: "Va con leche" },
];

const SENSORIAL: { k: keyof Cafe["sensorial"]; n: string }[] = [
  { k: "acidez", n: "Acidez" },
  { k: "cuerpo", n: "Cuerpo" },
  { k: "dulzor", n: "Dulzor" },
  { k: "amargor", n: "Amargor" },
];

function coincide(cafe: Cafe, filtro: (typeof FILTROS)[number]["id"]) {
  if (filtro === "todos") return true;
  if (filtro === "leche") return cafe.conLeche;
  return cafe.perfil.includes(filtro);
}

export function Ficha({ cafe }: { cafe: Cafe }) {
  return (
    <article
      className="ficha"
      id={`ficha-${cafe.id}`}
      aria-labelledby={`ficha-titulo-${cafe.id}`}
      style={{ "--tinta": cafe.tinta } as React.CSSProperties}
    >
      <header className="ficha-cabeza">
        <div>
          <h3 id={`ficha-titulo-${cafe.id}`} className="stencil">
            {cafe.pais}
          </h3>
          <p className="dato ficha-region">
            {cafe.region} · {cafe.lote} · Cosecha {cafe.cosecha}
          </p>
        </div>
        <div className="ficha-puntaje">
          <span className="stencil">{cafe.puntaje.toLocaleString("es")}</span>
          <span className="dato">Puntos SCA</span>
        </div>
      </header>
      <div className="ficha-cuerpo">
        <section className="ficha-bloque ficha-origen" aria-label="Origen">
          <h4 className="dato">Origen</h4>
          <dl className="tabla-datos">
            <dt className="dato">Finca</dt>
            <dd>{cafe.finca}</dd>
            <dt className="dato">Productor</dt>
            <dd>{cafe.productor}</dd>
            <dt className="dato">Altitud</dt>
            <dd>{cafe.altitud.toLocaleString("es")} msnm</dd>
            <dt className="dato">Variedad</dt>
            <dd>{cafe.variedad}</dd>
            <dt className="dato">Proceso</dt>
            <dd>{cafe.proceso}</dd>
            <dt className="dato">Secado</dt>
            <dd>{cafe.secado}</dd>
            <dt className="dato">Tueste</dt>
            <dd>{cafe.tueste}</dd>
          </dl>
        </section>
        <section className="ficha-bloque ficha-taza" aria-label="En taza">
          <h4 className="dato">En taza</h4>
          <ul className="notas">
            {cafe.notas.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p style={{ margin: "0 0 10px" }}>
            <strong>Aroma:</strong> {cafe.aroma}.
          </p>
          <p style={{ margin: 0, color: "var(--paper-dim)" }}>{cafe.historia}</p>
        </section>
        <section className="ficha-bloque ficha-sensorial" aria-label="Perfil sensorial">
          <h4 className="dato">Perfil sensorial</h4>
          {SENSORIAL.map(({ k, n }) => (
            <div className="medidor" key={k}>
              <span className="dato">{n}</span>
              <span className="medidor-escala" role="img" aria-label={`${n}: ${cafe.sensorial[k]} de 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    data-lleno={i < cafe.sensorial[k]}
                    style={{ "--i": i } as React.CSSProperties}
                  />
                ))}
              </span>
              <span className="dato">{cafe.sensorial[k]}</span>
            </div>
          ))}
        </section>
        <section className="ficha-bloque ficha-recetas" aria-label="Molienda y recetas">
          <h4 className="dato">Molienda y receta recomendadas</h4>
          <div className="recetas">
            {cafe.recetas.map((r) => (
              <div className="receta" key={r.metodo}>
                <p className="stencil receta-metodo">{METODOS[r.metodo].nombre}</p>
                <span className="dato receta-molienda">
                  Molienda {r.molienda.toLowerCase()} ·{" "}
                  <span className="unidad">{METODOS[r.metodo].micras}</span>
                </span>
                <dl className="tabla-datos">
                  <dt className="dato">Dosis</dt>
                  <dd>{r.dosis}</dd>
                  <dt className="dato">Agua</dt>
                  <dd>{r.agua}</dd>
                  <dt className="dato">Temp.</dt>
                  <dd>{r.temperatura}</dd>
                  <dt className="dato">Tiempo</dt>
                  <dd>{r.tiempo}</dd>
                </dl>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}

export default function Carta() {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todos");
  const [elegido, setElegido] = useState<string>(CAFES[0].id);
  const cafe = CAFES.find((c) => c.id === elegido) ?? CAFES[0];

  return (
    <section className="bodega" id="carta" aria-labelledby="carta-titulo">
      <div className="bodega-interior">
        <h2 id="carta-titulo" className="stencil titulo-seccion">
          La carta
        </h2>
        <p className="bajada">
          Seis lotes en la bodega. Elige un saco para ver su ficha completa:
          origen, proceso, notas, perfil sensorial, molienda y receta.
        </p>
        <p className="aviso-ficticio">
          Lotes de muestra, ficticios. Orígenes, variedades y procesos son
          reales; fincas, productores y puntajes son ilustrativos.
        </p>

        <div className="filtros" role="group" aria-label="Filtrar por perfil">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="filtro"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
            >
              {f.nombre}
            </button>
          ))}
        </div>

        <div className="pared">
          {CAFES.map((c) => {
            const visible = coincide(c, filtro);
            return (
              <button
                key={c.id}
                type="button"
                className="pila"
                aria-pressed={c.id === elegido}
                aria-controls={`ficha-${c.id}`}
                data-apagada={!visible}
                disabled={!visible}
                onClick={() => {
                  setElegido(c.id);
                  requestAnimationFrame(() =>
                    document
                      .getElementById("ficha-ancla")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                  );
                }}
                style={{ "--tinta": c.tinta } as React.CSSProperties}
              >
                <span className="dato pila-lote">{c.lote}</span>
                <span className="stencil pila-pais">{c.pais}</span>
                <span className="dato pila-pie">
                  {c.proceso.split(",")[0]} · {c.altitud.toLocaleString("es")} msnm
                  <br />
                  {c.notas[0]}
                </span>
              </button>
            );
          })}
        </div>

        <div id="ficha-ancla" style={{ scrollMarginTop: 80 }} />
        <Ficha key={cafe.id} cafe={cafe} />
      </div>
    </section>
  );
}
