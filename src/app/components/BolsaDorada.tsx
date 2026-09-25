"use client";

import { useId, useRef } from "react";

// Bolsa de pie dorada, la misma estética del saco de la historia, con datos variables.
const BOLSA = "M78 72 Q78 62 90 62 L390 62 Q402 62 402 72 L404 150 Q412 420 408 700 Q406 742 372 748 L108 748 Q74 742 72 700 Q68 420 76 150Z";
const CURVAS = Array.from({ length: 9 }, (_, i) => {
  const y = 520 + i * 26;
  return `M40 ${y} C120 ${y - 18 - (i % 3) * 6} 180 ${y + 22} 250 ${y + 4} S380 ${y - 20 + (i % 2) * 10} 460 ${y + 6}`;
});

type Props = {
  nombre: string;
  titulo: string;
  subtitulo: string;
  datos: [string, string][];
  pie: string;
  tinta: string;
  sellos: [string, string][];
};

export default function BolsaDorada({ nombre, titulo, subtitulo, datos, pie, tinta, sellos }: Props) {
  const u = useId().replace(/:/g, "");
  const giro = useRef<HTMLDivElement>(null);
  const id = (k: string) => `${k}-${u}`;
  const tamNombre = Math.min(30, Math.floor(560 / Math.max(nombre.length + 4, 1)));

  const inclinar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !giro.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    giro.current.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * 18}deg`);
    giro.current.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * 12}deg`);
    giro.current.style.setProperty("--brillo", `${((e.clientX - r.left) / r.width) * 420}px`);
  };
  const soltar = () => {
    giro.current?.style.setProperty("--ry", "0deg");
    giro.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <div className="bolsa bolsa-dorada" onPointerMove={inclinar} onPointerLeave={soltar}>
      <div className="bolsa-giro" ref={giro}>
        <svg className="bolsa-cara" viewBox="0 0 480 780" role="img" aria-label={`Bolsa de ${nombre}: ${titulo}, ${subtitulo}`}>
          <defs>
            <clipPath id={id("rec")}>
              <path d={BOLSA} />
            </clipPath>
            <linearGradient id={id("oro")} x1="0" y1="0" x2="1" y2="0.35">
              <stop offset="0" stopColor="#9c7630" />
              <stop offset="0.22" stopColor="#e8cf8a" />
              <stop offset="0.4" stopColor="#c9a04f" />
              <stop offset="0.58" stopColor="#f6e6b4" />
              <stop offset="0.78" stopColor="#b88c3c" />
              <stop offset="1" stopColor="#7d5a22" />
            </linearGradient>
            <linearGradient id={id("oroT")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#c9a04f" />
              <stop offset="0.5" stopColor="#f3dfa2" />
              <stop offset="1" stopColor="#b88c3c" />
            </linearGradient>
            <linearGradient id={id("luz")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1c1710" stopOpacity="0.2" />
              <stop offset="0.18" stopColor="#1c1710" stopOpacity="0" />
              <stop offset="0.62" stopColor="#fff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#1c1710" stopOpacity="0.24" />
            </linearGradient>
            <linearGradient id={id("brillo")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <ellipse cx="240" cy="760" rx="170" ry="14" fill="#1c1710" opacity="0.22" />
          <path d={BOLSA} fill={`url(#${id("oro")})`} />
          <g clipPath={`url(#${id("rec")})`}>
            <path d="M60 520 Q240 500 420 520 V760 H60Z" fill="#17120c" />
            <path d="M60 520 Q240 500 420 520" stroke={`url(#${id("oroT")})`} strokeWidth="2.5" fill="none" />
            {CURVAS.map((d) => (
              <path key={d} d={d} fill="none" stroke="#e8cf8a" strokeWidth="1" opacity="0.14" />
            ))}
            <rect className="bolsa-brillo" x="-60" y="60" width="140" height="460" fill={`url(#${id("brillo")})`} />
            {Array.from({ length: 40 }).map((_, i) => (
              <path key={i} d={`M${84 + i * 8} 66 V98`} stroke="#1c1710" strokeWidth="1" opacity="0.1" />
            ))}
            {/* etiqueta en la tinta del origen, curvada */}
            <path d="M60 396 Q240 380 420 396 V504 Q240 490 60 504Z" fill={tinta} />
            <path d="M60 396 Q240 380 420 396 M60 504 Q240 490 420 504" stroke="#e8cf8a" strokeWidth="1.5" fill="none" opacity="0.8" />
            <rect x="60" y="60" width="360" height="700" fill={`url(#${id("luz")})`} />
          </g>
          <path d={BOLSA} fill="none" stroke="#5a3f14" strokeWidth="2.5" />
          <path d="M86 138 H394 M86 143 H394" stroke="#1c1710" strokeWidth="1.5" opacity="0.5" />
          <circle cx="240" cy="182" r="11" fill="none" stroke="#1c1710" strokeWidth="1.6" opacity="0.7" />
          <circle cx="240" cy="182" r="5" fill="none" stroke="#1c1710" strokeWidth="1.2" opacity="0.7" />

          <g stroke="#1c1710" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="240" cy="262" r="40" strokeWidth="2.5" />
            <circle cx="240" cy="262" r="33" strokeWidth="1" opacity="0.6" />
            <path d="M214 278 L234 246 L244 260 L251 252 L267 278" strokeWidth="3" />
            <circle cx="258" cy="244" r="4" strokeWidth="2" />
            <path d="M220 278 H261" strokeWidth="2" />
          </g>
          <text x="240" y="344" textAnchor="middle" className="dato" fontSize={tamNombre} fill="#1c1710" letterSpacing="6">
            {nombre.toUpperCase()}
          </text>
          <text x="240" y="366" textAnchor="middle" className="dato" fontSize="10.5" fill="#1c1710" letterSpacing="3" opacity="0.7">
            ALTURA · LOTE A PEDIDO
          </text>

          <text x="100" y="430" className="stencil" fontSize="38" fill="#f4ecdc">
            {titulo.toUpperCase()}
          </text>
          <text x="101" y="454" className="dato" fontSize="13" fill="#f4ecdc" letterSpacing="1.5">
            {subtitulo.toUpperCase()}
          </text>
          <path d="M270 404 V488" stroke="#f4ecdc" strokeWidth="1" opacity="0.5" />
          {datos.slice(0, 3).map(([k, v], i) => (
            <g key={k}>
              <text x="282" y={414 + i * 30} className="dato" fontSize="8.5" fill="#f4ecdc" opacity="0.75" letterSpacing="1.2">
                {k.toUpperCase()}
              </text>
              <text x="282" y={427 + i * 30} className="dato" fontSize="11.5" fill="#f4ecdc" letterSpacing="0.5">
                {v.toUpperCase()}
              </text>
            </g>
          ))}
          <text x="101" y="486" className="dato" fontSize="10.5" fill="#f4ecdc" letterSpacing="2" opacity="0.85">
            {pie.toUpperCase()}
          </text>

          {sellos.slice(0, 6).map(([arriba, valor], i) => {
            const n = Math.min(sellos.length, 6);
            const porFila = n <= 3 ? n : 3;
            const fila = Math.floor(i / 3);
            const enFila = Math.min(porFila, n - fila * 3);
            const cx = 240 + ((i % 3) - (enFila - 1) / 2) * 84;
            const cy = 596 + fila * 70;
            return (
              <g key={arriba} className="sello-pop" style={{ "--i": i } as React.CSSProperties}>
                <circle cx={cx} cy={cy} r="30" fill="#17120c" stroke={`url(#${id("oroT")})`} strokeWidth="2" />
                <circle cx={cx} cy={cy} r="25" fill="none" stroke="#e8cf8a" strokeWidth="0.8" strokeDasharray="2 2.5" opacity="0.8" />
                <text x={cx} y={cy - 6} textAnchor="middle" className="dato" fontSize="7.5" fill="#e8cf8a" letterSpacing="1">
                  {arriba}
                </text>
                <text x={cx} y={cy + 9} textAnchor="middle" className="stencil" fontSize={valor.length > 8 ? 10 : valor.length > 6 ? 12 : 15} fill="#f3dfa2">
                  {valor}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
