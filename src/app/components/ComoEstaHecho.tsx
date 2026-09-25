"use client";

import { useEffect, useState } from "react";
import { useCarta } from "./CartaContexto";

// "Cómo está hecho": diagrama de la arquitectura con datos en vivo de la propia app.
type Nodo = { titulo: string; sub: string; items: string[] };
const COLUMNAS: { etiqueta: string; nodos: Nodo[] }[] = [
  {
    etiqueta: "Webflow",
    nodos: [
      { titulo: "CMS de Webflow", sub: "Colección «Lotes»", items: ["6 lotes con su ficha completa", "Se edita desde Webflow, sin tocar código"] },
      { titulo: "Webhooks", sub: "Aviso al instante", items: ["Lote creado, cambiado, borrado o publicado", "La página abierta se actualiza sola"] },
    ],
  },
  {
    etiqueta: "Webflow Cloud",
    nodos: [
      { titulo: "Next.js 16", sub: "Sobre Cloudflare Workers", items: ["Página y 12 servicios propios", "Deploy automático en cada push"] },
      { titulo: "SQLite + KV", sub: "Datos en el borde", items: ["Carta, pedidos, me gusta y rutas", "Límites por visitante y topes diarios"] },
    ],
  },
  {
    etiqueta: "Servicios",
    nodos: [
      { titulo: "OpenAI", sub: "Tres usos distintos", items: ["Barista en streaming", "Lee la foto de tu paquete", "Busca cafeterías en la web, con fuentes"] },
      { titulo: "OpenStreetMap", sub: "Mapa y direcciones", items: ["Ubica cada parada de la ruta", "Mapa sin claves ni rastreo"] },
    ],
  },
];

const CIFRAS = [
  ["~1 s", "de Webflow a tu pantalla"],
  ["0", "claves en el navegador"],
  ["20", "pruebas automáticas en cada cambio"],
  ["24 h", "de caché por ruta armada"],
];

function hace(seg: number) {
  if (seg < 60) return "hace segundos";
  const m = Math.floor(seg / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  return h < 24 ? `hace ${h} h` : `hace ${Math.floor(h / 24)} d`;
}

export default function ComoEstaHecho() {
  const { fuente, cambiado, cafes } = useCarta();
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => setAhora(Date.now() / 1000);
    tic();
    const t = setInterval(tic, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="hecho" id="como-esta-hecho" aria-labelledby="hecho-titulo">
      <div className="hecho-interior">
        <h2 id="hecho-titulo" className="stencil titulo-seccion">
          Cómo está hecho
        </h2>
        <p className="bajada">
          Todo corre en Webflow Cloud. El contenido vive en el CMS de Webflow; la inteligencia y el mapa llegan desde servicios
          externos, siempre a través del servidor.
        </p>

        <p className="hecho-vivo dato" aria-live="polite">
          <span className="contador-punto" aria-hidden="true" />
          {fuente === "cms"
            ? `En vivo: ${cafes.length} lotes desde el CMS de Webflow${cambiado && ahora ? ` · último cambio ${hace(Math.max(0, ahora - cambiado))}` : ""}`
            : "La carta se sirve desde la copia local (el CMS no respondió)"}
        </p>

        <ol className="hecho-flujo">
          {COLUMNAS.map((c, i) => (
            <li key={c.etiqueta} className="hecho-columna" style={{ "--i": i } as React.CSSProperties}>
              <span className="hecho-etiqueta dato">{c.etiqueta}</span>
              {c.nodos.map((n) => (
                <div key={n.titulo} className="hecho-nodo">
                  <h3 className="stencil">{n.titulo}</h3>
                  <p className="dato hecho-sub">{n.sub}</p>
                  <ul>
                    {n.items.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {i < COLUMNAS.length - 1 && <span className="hecho-flecha" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <dl className="hecho-cifras">
          {CIFRAS.map(([n, t]) => (
            <div key={t}>
              <dt className="stencil">{n}</dt>
              <dd className="dato">{t}</dd>
            </div>
          ))}
        </dl>

        <p className="hecho-calidad dato">
          Calidad: GitHub Actions revisa estilo, tipos, pruebas y build en cada push, y después prueba el sitio publicado.
          Seguridad: límites por visitante, topes diarios de IA, tamaño máximo de cada pedido y cabeceras de seguridad estrictas.
        </p>
      </div>
    </section>
  );
}
