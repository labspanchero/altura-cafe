"use client";

import { useEffect, useState } from "react";
import { METODOS, type Cafe, type Perfil } from "@/lib/cafes";
import { useCarta } from "./CartaContexto";
import Temporizador from "./Temporizador";
import { etapasDe } from "@/lib/etapas";
import { texturaArpillera } from "@/lib/arpillera";
import MetodoIcono from "./MetodoIcono";

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

function esClara(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

export function SiluetaSaco({ className = "pila-saco" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 300 400" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M14 34 Q24 6 58 18 L242 18 Q276 6 286 34 L292 368 Q292 392 266 394 L34 394 Q8 392 8 368Z"
        className="saco-cuerpo"
      />
      <path d="M14 50 Q150 62 286 50" className="saco-costura" />
    </svg>
  );
}

function coincide(cafe: Cafe, filtro: (typeof FILTROS)[number]["id"]) {
  if (filtro === "todos") return true;
  if (filtro === "leche") return cafe.conLeche;
  return cafe.perfil.includes(filtro);
}

function Corazon({ lleno }: { lleno: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="corazon" aria-hidden="true">
      <path
        d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.6-1.8 4.8-9.3 9.4-9.3 9.4z"
        fill={lleno ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type MeGusta = { conteos: Record<string, number>; mios: Set<string>; dar: (id: string) => void };

function useMeGusta(): MeGusta {
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [mios, setMios] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      setMios(new Set(JSON.parse(localStorage.getItem("altura:megusta") ?? "[]")));
    } catch {
      // sin almacenamiento local
    }
    fetch("api/megusta")
      .then((r) => r.json())
      .then((d) => d.conteos && setConteos(d.conteos))
      .catch(() => {});
  }, []);
  const dar = (id: string) => {
    if (mios.has(id)) return;
    const nuevos = new Set(mios).add(id);
    setMios(nuevos);
    setConteos((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    try {
      localStorage.setItem("altura:megusta", JSON.stringify([...nuevos]));
    } catch {
      // sin almacenamiento local
    }
    fetch("api/megusta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
      .then((r) => r.json())
      .then((d) => d.conteos && setConteos(d.conteos))
      .catch(() => {});
  };
  return { conteos, mios, dar };
}

export function Ficha({ cafe, meGusta }: { cafe: Cafe; meGusta?: MeGusta }) {
  const [preparando, setPreparando] = useState<Cafe["recetas"][number] | null>(null);
  return (
    <article
      className="ficha"
      id={`ficha-${cafe.id}`}
      aria-labelledby={`ficha-titulo-${cafe.id}`}
      style={{ "--tinta": cafe.tinta, "--clara": cafe.tintaClara } as React.CSSProperties}
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
        {meGusta && (
          <button
            type="button"
            className="me-gusta"
            aria-pressed={meGusta.mios.has(cafe.id)}
            onClick={() => meGusta.dar(cafe.id)}
            disabled={meGusta.mios.has(cafe.id)}
          >
            <Corazon lleno={meGusta.mios.has(cafe.id)} />
            <span className="dato">
              {meGusta.mios.has(cafe.id) ? "Te gusta" : "Me gusta"} · {meGusta.conteos[cafe.id] ?? 0}
            </span>
          </button>
        )}
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
                <p className="stencil receta-metodo metodo-con-icono">
                  <MetodoIcono metodo={r.metodo} className="metodo-icono metodo-icono-grande" />
                  {METODOS[r.metodo].nombre}
                </p>
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
                {etapasDe(r) ? (
                  <button type="button" className="sello sello-claro receta-preparar" onClick={() => setPreparando(r)}>
                    Preparar ahora
                  </button>
                ) : (
                  <p className="dato receta-sin-reloj">Se prepara de un día para otro: sin temporizador.</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
      {preparando && <Temporizador cafe={cafe} receta={preparando} alCerrar={() => setPreparando(null)} />}
    </article>
  );
}

function inclinar(e: React.PointerEvent<HTMLButtonElement>) {
  if (e.pointerType !== "mouse") return;
  const r = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5;
  const y = (e.clientY - r.top) / r.height - 0.5;
  e.currentTarget.style.setProperty("--ry", `${x * 22}deg`);
  e.currentTarget.style.setProperty("--rx", `${-y * 18}deg`);
  e.currentTarget.style.setProperty("--lx", `${(x + 0.5) * 100}%`);
  e.currentTarget.style.setProperty("--ly", `${(y + 0.5) * 100}%`);
}

function soltar(e: React.PointerEvent<HTMLButtonElement>) {
  e.currentTarget.style.setProperty("--ry", "0deg");
  e.currentTarget.style.setProperty("--rx", "0deg");
}

export default function Carta() {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todos");
  const { cafes: CAFES, fuente } = useCarta();
  const [elegido, setElegido] = useState<string>(CAFES[0].id);
  const cafe = CAFES.find((c) => c.id === elegido) ?? CAFES[0];
  const meGusta = useMeGusta();

  // La trama de arpillera se genera una vez y la comparten todos los sacos.
  useEffect(() => {
    const url = texturaArpillera();
    if (url) document.documentElement.style.setProperty("--arpillera", `url(${url})`);
  }, []);

  useEffect(() => {
    const abrir = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (!CAFES.some((c) => c.id === id)) return;
      setFiltro("todos");
      setElegido(id);
      requestAnimationFrame(() =>
        document.getElementById("ficha-ancla")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    };
    window.addEventListener("altura:abrir-ficha", abrir);
    return () => window.removeEventListener("altura:abrir-ficha", abrir);
  }, [CAFES]);

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
        {fuente === "cms" && (
          <p className="fuente-cms dato">
            <span className="contador-punto" aria-hidden="true" /> Carta servida en vivo desde el CMS de Webflow
          </p>
        )}
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
                data-apagada={!visible}
                disabled={!visible}
                onClick={(e) => {
                  const irAFicha = () => {
                    setElegido(c.id);
                    requestAnimationFrame(() =>
                      document
                        .getElementById("ficha-ancla")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
                    );
                  };
                  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return irAFicha();
                  e.currentTarget
                    .animate(
                      [
                        { transform: "perspective(700px) rotateY(0deg)" },
                        { transform: "perspective(700px) rotateY(180deg)" },
                      ],
                      { duration: 450, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
                    )
                    .finished.then(irAFicha);
                }}
                onPointerMove={inclinar}
                onPointerLeave={soltar}
                style={{ "--tinta": c.tinta } as React.CSSProperties}
              >
                <SiluetaSaco />
                <span className="dato pila-lote" style={{ color: esClara(c.tinta) ? "var(--ink)" : "#fff" }}>
                  {c.lote}
                </span>
                <span className="stencil pila-pais">{c.pais}</span>
                <span className="dato pila-pie">
                  {c.proceso.split(",")[0]} · {c.altitud.toLocaleString("es")} msnm
                  <br />
                  {c.notas[0]}
                  {(meGusta.conteos[c.id] ?? 0) > 0 && (
                    <span className="pila-megusta">
                      <Corazon lleno={meGusta.mios.has(c.id)} /> {meGusta.conteos[c.id]}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div id="ficha-ancla" style={{ scrollMarginTop: 80 }} />
        <Ficha key={cafe.id} cafe={cafe} meGusta={meGusta} />
        <Comparador key={`cmp-${cafe.id}`} base={cafe} />
      </div>
    </section>
  );
}

function Comparador({ base }: { base: Cafe }) {
  const { cafes: CAFES } = useCarta();
  const [otroId, setOtroId] = useState<string | null>(null);
  const otro = CAFES.find((c) => c.id === otroId) ?? null;
  const filas: { n: string; v: (c: Cafe) => string }[] = [
    { n: "Altitud", v: (c) => `${c.altitud.toLocaleString("es")} msnm` },
    { n: "Variedad", v: (c) => c.variedad },
    { n: "Proceso", v: (c) => c.proceso },
    { n: "Tueste", v: (c) => c.tueste },
    { n: "Puntaje", v: (c) => `${c.puntaje.toLocaleString("es")} pts` },
    { n: "Notas", v: (c) => c.notas.join(", ") },
    { n: "Métodos", v: (c) => c.recetas.map((r) => METODOS[r.metodo].nombre).join(", ") },
  ];

  return (
    <section className="comparador" aria-labelledby="comparador-titulo">
      <div className="comparador-cabeza">
        <h3 id="comparador-titulo" className="stencil">
          Comparar {base.pais} con
        </h3>
        <div className="filtros" role="group" aria-label="Elegir lote para comparar" style={{ margin: 0 }}>
          {CAFES.filter((c) => c.id !== base.id).map((c) => (
            <button
              key={c.id}
              type="button"
              className="filtro"
              aria-pressed={otroId === c.id}
              onClick={() => setOtroId(otroId === c.id ? null : c.id)}
              style={{ "--tinta": c.tintaClara } as React.CSSProperties}
            >
              {c.pais}
            </button>
          ))}
        </div>
      </div>

      {otro && (
        <div className="comparacion" key={otro.id}>
          <div className="comparacion-fila comparacion-titulos">
            <span />
            <span className="stencil" style={{ color: base.tintaClara }}>{base.pais}</span>
            <span className="stencil" style={{ color: otro.tintaClara }}>{otro.pais}</span>
          </div>
          {filas.map((f) => (
            <div className="comparacion-fila" key={f.n}>
              <span className="dato">{f.n}</span>
              <span>{f.v(base)}</span>
              <span>{f.v(otro)}</span>
            </div>
          ))}
          {SENSORIAL.map(({ k, n }) => (
            <div className="comparacion-fila comparacion-medidor" key={k}>
              <span className="dato">{n}</span>
              {[base, otro].map((c) => (
                <span
                  key={c.id}
                  className="medidor-escala"
                  role="img"
                  aria-label={`${c.pais}, ${n}: ${c.sensorial[k]} de 5`}
                  style={{ "--lote": c.tintaClara } as React.CSSProperties}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} data-lleno={i < c.sensorial[k]} style={{ "--i": i } as React.CSSProperties} />
                  ))}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
