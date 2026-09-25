"use client";

import { useRef, useState } from "react";
import { METODOS, METODOS_ORDEN, type Cafe, type Metodo } from "@/lib/cafes";
import { ajustes, metodoSugerido, parecido, recetaPara, type Leido, type Resultado } from "@/lib/tucafe";
import { etapasDe } from "@/lib/etapas";
import { useCarta } from "./CartaContexto";
import MetodoIcono from "./MetodoIcono";
import Temporizador from "./Temporizador";
import { abrirFicha } from "./Pedido";

const TINTAS = [
  ["#1f4fd1", "#7a9bff"],
  ["#c8202f", "#ff6b76"],
  ["#0f7a3a", "#4fcf7e"],
  ["#6b2fb3", "#bb95f5"],
  ["#e5601c", "#ff9a5c"],
];

// Achica la foto en el navegador antes de enviarla (máx. 1280 px, JPEG).
async function comprimir(archivo: File) {
  const bmp = await createImageBitmap(archivo);
  const k = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.82);
}

export default function TraeTuCafe() {
  const { cafes } = useCarta();
  const [leido, setLeido] = useState<Leido | null>(null);
  const [vista, setVista] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<Metodo>("v60");
  const [preparando, setPreparando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function leer(payload: { imagen?: string; texto?: string }) {
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const res = await fetch("api/escanear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLeido(data.leido);
      setMetodo(metodoSugerido(data.leido));
      requestAnimationFrame(() => document.getElementById("tu-cafe-resultado")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "No pudimos leer el paquete. Inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const url = await comprimir(f);
      setVista(url);
      await leer({ imagen: url });
    } catch {
      setError("No pudimos abrir la foto. Prueba con otra.");
    }
  }

  const receta = leido ? recetaPara(leido, metodo) : null;
  const primo = leido ? parecido(leido, cafes) : null;
  const nombre = leido?.pais ?? leido?.tostador ?? "Tu café";
  const [tinta, clara] = TINTAS[(nombre.length + (leido?.region?.length ?? 0)) % TINTAS.length];
  const comoCafe: Cafe | null =
    leido && receta
      ? {
          ...(primo as Cafe),
          id: "tu-cafe",
          lote: "TU LOTE",
          pais: nombre,
          region: leido.region ?? "",
          notas: leido.notas.length ? leido.notas : ["su propio carácter"],
          tinta,
          tintaClara: clara,
          recetas: [receta],
        }
      : null;

  const datos: [string, string | null][] = leido
    ? [
        ["Tostador", leido.tostador],
        ["Región", [leido.region, leido.finca].filter(Boolean).join(" · ") || null],
        ["Altitud", leido.altitud ? `${leido.altitud.toLocaleString("es")} msnm` : null],
        ["Variedad", leido.variedad],
        ["Proceso", leido.proceso],
        ["Tueste", leido.tueste ? leido.tueste[0].toUpperCase() + leido.tueste.slice(1) : null],
        ["Tostado el", leido.fechaTueste],
      ]
    : [];

  return (
    <section className="tu-cafe" id="tu-cafe" aria-labelledby="tu-cafe-titulo">
      <div className="tu-cafe-interior">
        <div className="tu-cafe-cabeza">
          <h2 id="tu-cafe-titulo" className="stencil titulo-seccion">
            Trae tu café
          </h2>
          <p className="bajada">
            Sácale una foto al paquete que tienes en casa. Leemos la etiqueta, armamos su ficha y te damos la
            receta para tu método, con temporizador incluido.
          </p>
        </div>

        <div className="tu-cafe-entrada">
          <button type="button" className="tu-cafe-foto" onClick={() => input.current?.click()} disabled={cargando}>
            {vista ? <img src={vista} alt="Foto del paquete" /> : <span className="stencil">Foto del paquete</span>}
            <span className="dato">{cargando ? "Leyendo la etiqueta…" : vista ? "Cambiar foto" : "Abrir cámara o elegir foto"}</span>
          </button>
          <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={alElegirFoto} />
          <form
            className="tu-cafe-texto"
            onSubmit={(e) => {
              e.preventDefault();
              if (texto.trim()) leer({ texto });
            }}
          >
            <label htmlFor="etiqueta" className="dato">
              O escribe lo que dice el paquete
            </label>
            <textarea
              id="etiqueta"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={4}
              maxLength={1500}
              placeholder="Ej.: Colombia, Nariño, 2.100 m, Caturra, lavado, tueste claro, notas de mandarina y panela"
            />
            <button type="submit" className="sello" data-lleno="true" disabled={!texto.trim() || cargando}>
              {cargando ? "Leyendo…" : "Armar mi receta"}
            </button>
          </form>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {leido && receta && comoCafe && (
          <article className="tu-ficha" id="tu-cafe-resultado" style={{ "--tinta": tinta } as React.CSSProperties} aria-live="polite">
            <header className="tu-ficha-cabeza">
              <p className="dato tu-ficha-marca">Ficha de tu lote</p>
              <h3 className="stencil">{nombre}</h3>
              {leido.notas.length > 0 && (
                <ul className="notas notas-yute">
                  {leido.notas.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </header>

            <dl className="tabla-datos tu-ficha-datos">
              {datos
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} style={{ display: "contents" }}>
                    <dt className="dato">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>

            <div className="tu-ficha-metodo">
              <p className="dato">¿Con qué lo preparas?</p>
              <div className="opciones">
                {METODOS_ORDEN.map((m) => (
                  <button key={m} type="button" className="filtro filtro-yute" aria-pressed={metodo === m} onClick={() => { setMetodo(m); setResultado(null); }}>
                    <MetodoIcono metodo={m} /> {METODOS[m].nombre}
                  </button>
                ))}
              </div>
            </div>

            <div className="tu-ficha-receta">
              <p className="stencil receta-metodo metodo-con-icono">
                <MetodoIcono metodo={metodo} className="metodo-icono metodo-icono-grande" />
                {METODOS[metodo].nombre}
              </p>
              <p className="dato receta-molienda">
                Molienda {receta.molienda.toLowerCase()} · <span className="unidad">{METODOS[metodo].micras}</span>
              </p>
              <dl className="tabla-datos">
                <dt className="dato">Dosis</dt>
                <dd>{receta.dosis}</dd>
                <dt className="dato">Agua</dt>
                <dd>{receta.agua}</dd>
                <dt className="dato">Temp.</dt>
                <dd>{receta.temperatura}</dd>
                <dt className="dato">Tiempo</dt>
                <dd>{receta.tiempo}</dd>
              </dl>
              {etapasDe(receta) ? (
                <button type="button" className="sello" data-lleno="true" onClick={() => setPreparando(true)}>
                  Preparar ahora
                </button>
              ) : (
                <p className="dato">Se prepara de un día para otro: sin temporizador.</p>
              )}
            </div>

            <div className="tu-ficha-calibrar">
              <p className="dato">Después de probarlo, ¿cómo te salió?</p>
              <div className="opciones">
                {(
                  [
                    ["acido", "Ácido o aguado"],
                    ["amargo", "Amargo o seco"],
                    ["equilibrado", "Equilibrado"],
                  ] as [Resultado, string][]
                ).map(([k, n]) => (
                  <button key={k} type="button" className="filtro filtro-yute" aria-pressed={resultado === k} onClick={() => setResultado(k)}>
                    {n}
                  </button>
                ))}
              </div>
              {resultado && (
                <ul className="tu-ficha-ajustes">
                  {ajustes(resultado, metodo).map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </div>

            {primo && (
              <p className="tu-ficha-primo">
                En la carta de Altura se parece al{" "}
                <button type="button" className="lote-link dato" style={{ "--tinta": primo.tintaClara } as React.CSSProperties} onClick={() => abrirFicha(primo.id)}>
                  {primo.lote} · {primo.pais}
                </button>
                .
              </p>
            )}
            <p className="dato tu-ficha-aviso">
              Lectura automática con IA: revisa que los datos coincidan con tu paquete. La foto no se guarda.
            </p>
          </article>
        )}
      </div>
      {preparando && comoCafe && receta && (
        <Temporizador cafe={comoCafe} receta={receta} alCerrar={() => setPreparando(false)} />
      )}
    </section>
  );
}
