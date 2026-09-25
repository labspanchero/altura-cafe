"use client";

import { useRef, useState } from "react";
import { CAFES, METODOS, type Cafe, type Metodo, type Receta } from "@/lib/cafes";
import MetodoIcono from "./MetodoIcono";

export function abrirFicha(id: string) {
  window.dispatchEvent(new CustomEvent("altura:abrir-ficha", { detail: id }));
}

const POR_LOTE = new Map(CAFES.map((c) => [c.lote, c]));

function ConLotes({ texto }: { texto: string }) {
  const partes = texto.split(/(ALT-\d{2})/g);
  return (
    <>
      {partes.map((p, i) => {
        const cafe = POR_LOTE.get(p);
        return cafe ? (
          <button
            key={i}
            type="button"
            className="lote-link dato"
            style={{ "--tinta": cafe.tintaClara } as React.CSSProperties}
            onClick={() => abrirFicha(cafe.id)}
            title={`Ver la ficha de ${cafe.pais}`}
          >
            {p} · {cafe.pais}
          </button>
        ) : (
          <span key={i}>{p}</span>
        );
      })}
    </>
  );
}

type Resultado = {
  cafe: Cafe;
  receta: Receta;
  metodo: { nombre: string; molienda: string; micras: string };
  ajustado: boolean;
  alternativa: Cafe;
};

const PREGUNTAS = [
  {
    id: "metodo",
    texto: "¿Cómo lo preparas?",
    opciones: (["espresso", "moka", "aeropress", "v60", "chemex", "prensa", "coldbrew"] as Metodo[]).map(
      (m) => ({ v: m, n: METODOS[m].nombre }),
    ),
  },
  {
    id: "perfil",
    texto: "¿Qué sabores buscas?",
    opciones: [
      { v: "floral", n: "Floral" },
      { v: "frutal", n: "Frutal" },
      { v: "chocolate", n: "Chocolate y nuez" },
      { v: "caramelo", n: "Caramelo y panela" },
    ],
  },
  {
    id: "acidez",
    texto: "¿Cuánta acidez te gusta?",
    opciones: [
      { v: "brillante", n: "Brillante" },
      { v: "equilibrada", n: "Equilibrada" },
      { v: "baja", n: "Baja" },
    ],
  },
  {
    id: "leche",
    texto: "¿Le agregas leche?",
    opciones: [
      { v: "no", n: "No, solo" },
      { v: "si", n: "Sí" },
    ],
  },
] as const;

function Quiz() {
  const [resp, setResp] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const completo = PREGUNTAS.every((p) => resp[p.id]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!completo) return;
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("api/recomendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...resp, leche: resp.leche === "si" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultado(data);
    } catch {
      setError("No pudimos armar tu recomendación. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <h2 className="stencil titulo-seccion" id="quiz-titulo">
        Encuentra tu café
      </h2>
      <p className="bajada" style={{ marginBottom: 28 }}>
        Cuatro preguntas y te decimos qué lote pedir, cómo molerlo y con qué receta.
      </p>
      <form className="planilla" onSubmit={enviar} aria-labelledby="quiz-titulo">
        {PREGUNTAS.map((p) => (
          <fieldset key={p.id}>
            <legend className="dato">{p.texto}</legend>
            <div className="opciones">
              {p.opciones.map((o) => (
                <label className="opcion" key={o.v}>
                  <input
                    type="radio"
                    name={p.id}
                    value={o.v}
                    checked={resp[p.id] === o.v}
                    onChange={() => setResp((r) => ({ ...r, [p.id]: o.v }))}
                  />
                  <span className={p.id === "metodo" ? "opcion-metodo" : undefined}>
                    {p.id === "metodo" && <MetodoIcono metodo={o.v as Metodo} />}
                    {o.n}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button className="sello" data-lleno="true" type="submit" disabled={!completo || cargando}>
          {cargando ? "Buscando lote…" : "Recomiéndame un lote"}
        </button>
        {!completo && (
          <p className="dato" style={{ margin: "10px 0 0", fontSize: 14 }}>
            Responde las cuatro preguntas para ver tu lote.
          </p>
        )}
        {error && <p className="error" role="alert">{error}</p>}
      </form>

      {resultado && (
        <div
          className="resultado"
          aria-live="polite"
          style={{ "--tinta": resultado.cafe.tintaClara } as React.CSSProperties}
        >
          <h3 className="stencil">
            {resultado.cafe.pais} {resultado.cafe.lote}
          </h3>
          <p className="dato">
            {resultado.cafe.region} · {resultado.cafe.notas.join(", ")}
          </p>
          <p>
            <span className="resultado-metodo">
              <MetodoIcono metodo={resultado.receta.metodo} className="metodo-icono metodo-icono-grande" />
              <span className="stencil">{resultado.metodo.nombre}</span>
            </span>
            Prepáralo en <strong>{resultado.metodo.nombre}</strong> con molienda{" "}
            <strong>{resultado.receta.molienda.toLowerCase()}</strong> ({resultado.metodo.micras}):{" "}
            {resultado.receta.dosis} de café, {resultado.receta.agua} de agua a{" "}
            {resultado.receta.temperatura}, {resultado.receta.tiempo}.
          </p>
          {resultado.ajustado && (
            <p style={{ color: "var(--paper-dim)" }}>
              Este lote no tiene receta para el método que elegiste, así que te
              proponemos el que mejor le queda.
            </p>
          )}
          <p style={{ color: "var(--paper-dim)" }}>
            Si quieres otra opción, prueba el {resultado.alternativa.pais} {resultado.alternativa.lote}.
          </p>
          <button type="button" className="sello sello-claro" onClick={() => abrirFicha(resultado.cafe.id)}>
            Ver la ficha completa
          </button>
        </div>
      )}
    </div>
  );
}

type Msj = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "¿Qué lote me recomiendas para espresso con leche?",
  "¿Qué diferencia hay entre lavado y natural?",
  "Tengo una V60, ¿cómo preparo el Geisha?",
];

function Barista() {
  const [mensajes, setMensajes] = useState<Msj[]>([
    {
      role: "assistant",
      content:
        "Hola, soy el barista de Altura. Pregúntame por cualquier lote de la carta, por procesos o por cómo ajustar tu receta.",
    },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lista = useRef<HTMLDivElement>(null);

  async function preguntar(pregunta: string) {
    const limpia = pregunta.trim();
    if (!limpia || cargando) return;
    const nuevos: Msj[] = [...mensajes, { role: "user", content: limpia }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);
    setError(null);
    requestAnimationFrame(() => lista.current?.scrollTo({ top: 1e6, behavior: "smooth" }));
    try {
      const res = await fetch("api/barista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: nuevos.slice(1) }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error);
      }
      setMensajes((m) => [...m, { role: "assistant", content: "" }]);
      setCargando(false);
      const lector = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        const trozo = dec.decode(value, { stream: true });
        setMensajes((m) => {
          const copia = m.slice();
          const ult = copia[copia.length - 1];
          copia[copia.length - 1] = { ...ult, content: ult.content + trozo };
          return copia;
        });
        lista.current?.scrollTo({ top: 1e6 });
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "El barista no pudo responder. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="barista" id="barista">
      <div className="barista-cabeza">
        <h2 className="stencil">Pregúntale al barista</h2>
        <p>Barista con IA que responde solo sobre la carta de Altura y sobre cómo preparar café.</p>
      </div>
      <div className="conversacion" ref={lista} aria-live="polite">
        {mensajes.map((m, i) => (
          <p key={i} className="burbuja" data-rol={m.role}>
            <span className="sr-only">{m.role === "user" ? "Tú: " : "Barista: "}</span>
            {m.role === "assistant" ? <ConLotes texto={m.content} /> : m.content}
          </p>
        ))}
        {cargando && (
          <p className="burbuja dato" data-rol="assistant">
            Moliendo la respuesta…
          </p>
        )}
      </div>
      {mensajes.length === 1 && (
        <div className="sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" onClick={() => preguntar(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          preguntar(texto);
        }}
      >
        <label htmlFor="pregunta" className="sr-only">
          Tu pregunta para el barista
        </label>
        <input
          id="pregunta"
          type="text"
          value={texto}
          maxLength={500}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Ej.: molienda para prensa"
          autoComplete="off"
        />
        <button className="sello" type="submit" disabled={!texto.trim() || cargando}>
          Enviar
        </button>
      </form>
    </div>
  );
}

export default function Pedido() {
  return (
    <section className="pedido" id="pedido">
      <div className="pedido-interior">
        <Quiz />
        <Barista />
      </div>
    </section>
  );
}
