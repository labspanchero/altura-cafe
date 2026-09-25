"use client";

import { useEffect, useRef, useState } from "react";
import { METODOS, METODOS_ORDEN } from "@/lib/cafes";
import MetodoIcono from "./MetodoIcono";
import dynamic from "next/dynamic";
import { Cereza, Cosecha, Planta, Procesos, Secado } from "./Ilustraciones";

const GranoTueste = dynamic(() => import("./three/GranoTueste"), { ssr: false });
const TazaLlena = dynamic(() => import("./three/TazaLlena"), { ssr: false });

type Etapa = {
  id: string;
  titulo: string;
  variable: [string, string];
  texto: string[];
  ilustracion?: React.ReactNode;
  estampa: { texto: string[]; x: number; y: number; giro: number; ancho: number };
};

const ETAPAS: Etapa[] = [
  {
    id: "planta",
    titulo: "La planta",
    variable: ["Altitud", "2.150 msnm"],
    texto: [
      "Todo empieza en un arbusto de Coffea arabica que tarda de tres a cuatro años en dar su primera cosecha.",
      "Mientras más alto crece, más frío hace de noche y más lento madura la fruta. Esa lentitud concentra azúcares y ácidos, y por eso los cafés de altura suelen tener más acidez y notas más complejas.",
    ],
    ilustracion: <Planta />,
    estampa: { texto: ["ORIGEN", "ETIOPÍA"], x: 60, y: 190, giro: -4, ancho: 200 },
  },
  {
    id: "cereza",
    titulo: "La cereza",
    variable: ["Variedad", "Heirloom"],
    texto: [
      "El café es la semilla de una fruta roja. Debajo de la piel hay pulpa dulce, una capa pegajosa llamada mucílago y el pergamino, que envuelve dos granos.",
      "La variedad (Geisha, Bourbon, SL28, Caturra) define el techo de sabor que puede alcanzar la taza.",
    ],
    ilustracion: <Cereza />,
    estampa: { texto: ["HEIRLOOM"], x: 262, y: 200, giro: 6, ancho: 150 },
  },
  {
    id: "cosecha",
    titulo: "La cosecha",
    variable: ["Cosecha", "2025/26"],
    texto: [
      "En los cafés de especialidad se recolecta a mano y se hacen varias pasadas por la misma planta, porque las cerezas no maduran todas al mismo tiempo.",
      "Solo entran las maduras. Una verde aporta astringencia y una sobremadura, sabor a fermento.",
    ],
    ilustracion: <Cosecha />,
    estampa: { texto: ["COSECHA", "2025/26"], x: 270, y: 278, giro: -3, ancho: 170 },
  },
  {
    id: "proceso",
    titulo: "El proceso",
    variable: ["Proceso", "Lavado"],
    texto: [
      "Después de la cosecha hay que separar el grano de la fruta. Cuánta fruta queda pegada durante el secado cambia todo.",
      "El lavado da tazas limpias y brillantes. El honey suma dulzor y el natural, fruta madura y cuerpo.",
    ],
    ilustracion: <Procesos />,
    estampa: { texto: ["LAVADO"], x: 70, y: 300, giro: 5, ancho: 170 },
  },
  {
    id: "secado",
    titulo: "El secado",
    variable: ["Secado", "12 días"],
    texto: [
      "El grano en pergamino se seca al sol en camas elevadas y se remueve varias veces al día para que el secado sea parejo.",
      "Cuando llega a 10–12% de humedad se puede guardar sin que se arruine. Un secado apurado se nota en la taza.",
    ],
    ilustracion: <Secado />,
    estampa: { texto: ["HUMEDAD 11%"], x: 60, y: 388, giro: -2, ancho: 210 },
  },
  {
    id: "saco",
    titulo: "Trilla y saco",
    variable: ["Lote", "ALT-07 · 60 kg"],
    texto: [
      "En la trilla se quita el pergamino, se clasifica el grano por tamaño y densidad y se eliminan los defectos a mano.",
      "El café verde viaja en sacos de yute de 60 kg con el estarcido del origen. Cada saco es un lote con nombre, finca y fecha.",
    ],
    estampa: { texto: ["LOTE ALT-07", "60 KG NETO"], x: 205, y: 462, giro: 4, ancho: 230 },
  },
  {
    id: "tueste",
    titulo: "El tueste",
    variable: ["Tueste", "Claro"],
    texto: [
      "En el tostador el grano pierde agua, se dora y alrededor de los 196 °C cruje: es el primer crack.",
      "Un tueste claro conserva la acidez y las flores del origen. Uno más oscuro suma cuerpo, chocolate y amargor, pero borra el origen.",
    ],
    ilustracion: <GranoTueste />,
    estampa: { texto: ["TUESTE CLARO"], x: 55, y: 565, giro: 3, ancho: 210 },
  },
  {
    id: "molienda",
    titulo: "La molienda",
    variable: ["Molienda", "según el método"],
    texto: [
      "El tamaño de partícula decide qué tan rápido pasa el agua y cuánto extrae. Muy fina para el método da una taza amarga y muy gruesa, una ácida y aguada.",
      "Mueve el molinillo para ver qué molienda pide cada método.",
    ],
    estampa: { texto: ["MEDIA FINA"], x: 282, y: 384, giro: -6, ancho: 158 },
  },
  {
    id: "taza",
    titulo: "La taza",
    variable: ["Puntaje", "88,5 pts"],
    texto: [
      "Con una buena extracción, entre el 18% y el 22% del café se disuelve en el agua, y la taza llega equilibrada.",
      "Arriba de 80 puntos en la escala de cata SCA un café se considera de especialidad. Lo que viene después es la carta: cada lote con su ficha completa.",
    ],
    ilustracion: <TazaLlena />,
    estampa: { texto: ["88,5 PTS"], x: 282, y: 592, giro: -4, ancho: 158 },
  },
];

function Molinillo() {
  const [paso, setPaso] = useState(3);
  const metodo = METODOS[METODOS_ORDEN[paso]];
  const radio = 1.6 + paso * 1.25;
  const cols = Math.floor(520 / (radio * 2.6 + 4));
  const filas = Math.max(2, Math.floor(116 / (radio * 2.6 + 4)));

  return (
    <div className="molinillo">
      <svg className="particulas" viewBox="0 0 520 120" aria-hidden="true">
        {Array.from({ length: cols * filas }).map((_, i) => {
          const c = i % cols;
          const f = Math.floor(i / cols);
          const jitter = ((i * 37) % 7) - 3;
          const paso2 = 520 / cols;
          return (
            <circle
              key={i}
              cx={paso2 / 2 + c * paso2 + jitter * 0.6}
              cy={120 / filas / 2 + f * (120 / filas) + jitter * 0.4}
              r={radio * (0.8 + ((i * 13) % 5) / 12)}
              fill="#3a1f10"
            />
          );
        })}
      </svg>
      <label htmlFor="molienda" className="sr-only">
        Tamaño de molienda
      </label>
      <input
        id="molienda"
        type="range"
        min={0}
        max={METODOS_ORDEN.length - 1}
        value={paso}
        onChange={(e) => setPaso(Number(e.target.value))}
        aria-valuetext={`${metodo.molienda} para ${metodo.nombre}`}
      />
      <div className="molinillo-lectura" aria-live="polite">
        <span className="metodo-con-icono">
          <MetodoIcono metodo={METODOS_ORDEN[paso]} className="metodo-icono metodo-icono-grande" />
          <span className="stencil">{metodo.nombre}</span>
        </span>
        <span className="dato">
          {metodo.molienda} · <span className="unidad">{metodo.micras}</span>
        </span>
      </div>
    </div>
  );
}

// Sellos de la bolsa: uno por etapa, chicos y redondos.
const SELLOS: Record<string, [string, string]> = {
  planta: ["ORIGEN", "ETIOPÍA"],
  cereza: ["VARIEDAD", "HEIRLOOM"],
  cosecha: ["COSECHA", "25/26"],
  proceso: ["PROCESO", "LAVADO"],
  secado: ["HUMEDAD", "11%"],
  saco: ["LOTE", "ALT-07"],
  tueste: ["TUESTE", "CLARO"],
  molienda: ["MOLIENDA", "M. FINA"],
  taza: ["SCA", "88,5"],
};

// Bolsa de pie: cuerpo con leve cintura y fuelle abajo.
const BOLSA = "M78 72 Q78 62 90 62 L390 62 Q402 62 402 72 L404 150 Q412 420 408 700 Q406 742 372 748 L108 748 Q74 742 72 700 Q68 420 76 150Z";
const CURVAS = Array.from({ length: 9 }, (_, i) => {
  const y = 520 + i * 26;
  return `M40 ${y} C120 ${y - 18 - (i % 3) * 6} 180 ${y + 22} 250 ${y + 4} S380 ${y - 20 + (i % 2) * 10} 460 ${y + 6}`;
});

function Monograma({ tinta, y = 262 }: { tinta: string; y?: number }) {
  return (
    <g stroke={tinta} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="240" cy={y} r="40" strokeWidth="2.5" />
      <circle cx="240" cy={y} r="33" strokeWidth="1" opacity="0.6" />
      <path d={`M214 ${y + 16} L234 ${y - 16} L244 ${y - 2} L251 ${y - 10} L267 ${y + 16}`} strokeWidth="3" />
      <circle cx="258" cy={y - 18} r="4" strokeWidth="2" />
      <path d={`M220 ${y + 16} H261`} strokeWidth="2" />
    </g>
  );
}

function Saco({ activa }: { activa: number }) {
  const tira = useRef<HTMLDivElement>(null);
  const solapa = useRef<SVGGElement>(null);
  const boca = useRef<SVGPathElement>(null);
  const cierre = useRef<SVGGElement>(null);
  const zipAbierto = useRef<SVGPathElement>(null);
  const zipCerrado = useRef<SVGPathElement>(null);
  const giro = useRef<HTMLDivElement>(null);
  const [volteada, setVolteada] = useState(false);

  // Cierre continuo: abierta al empezar la historia, doblada y sellada en "Trilla y saco".
  useEffect(() => {
    let raf = 0;
    const actualizar = () => {
      raf = 0;
      const ini = document.getElementById("etapa-planta");
      const fin = document.getElementById("etapa-saco");
      if (!ini || !fin) return;
      const centro = window.innerHeight / 2;
      const a = ini.getBoundingClientRect().top + ini.offsetHeight / 2 - centro;
      const b = fin.getBoundingClientRect().top + fin.offsetHeight / 2 - centro;
      const t = Math.min(1, Math.max(0, a / (a - b || 1)));
      const c = t * t * (3 - 2 * t);
      boca.current?.setAttribute("opacity", String(Math.max(0, 1 - c * 1.6)));
      const doblez = Math.max(0, (c - 0.3) / 0.7);
      solapa.current?.setAttribute("transform", `translate(0 62) scale(1 ${doblez.toFixed(3)}) translate(0 -62)`);
      solapa.current?.setAttribute("opacity", doblez > 0.02 ? "1" : "0");
      const sello = Math.max(0, (c - 0.82) / 0.18);
      cierre.current?.setAttribute("opacity", String(sello));
      zipAbierto.current?.setAttribute("opacity", String(1 - sello));
      zipCerrado.current?.setAttribute("opacity", String(sello));
    };
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(actualizar);
    };
    actualizar();
    window.addEventListener("scroll", pedir, { passive: true });
    window.addEventListener("resize", pedir);
    return () => {
      window.removeEventListener("scroll", pedir);
      window.removeEventListener("resize", pedir);
      cancelAnimationFrame(raf);
    };
  }, []);
  useEffect(() => {
    const t = tira.current;
    const chip = t?.querySelector<HTMLElement>('[data-activa="true"]');
    if (t && chip) t.scrollTo({ left: t.scrollLeft + chip.getBoundingClientRect().left - t.getBoundingClientRect().left, behavior: "smooth" });
  }, [activa]);

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
    <div className="saco" aria-hidden="true">
      <div className="bolsa" onPointerMove={inclinar} onPointerLeave={soltar} onClick={() => setVolteada((v) => !v)}>
        <div className="bolsa-giro" ref={giro} data-volteada={volteada}>
          <svg className="bolsa-cara" viewBox="0 0 480 780">
            <defs>
              <linearGradient id="bolsa-luz" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#1c1710" stopOpacity="0.16" />
                <stop offset="0.18" stopColor="#1c1710" stopOpacity="0" />
                <stop offset="0.62" stopColor="#fff" stopOpacity="0.14" />
                <stop offset="1" stopColor="#1c1710" stopOpacity="0.2" />
              </linearGradient>
              <filter id="papel" x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" />
                <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.26  0 0 0 0 0.15  0 0 0 0.5 0" />
              </filter>
              <clipPath id="bolsa-recorte">
                <path d={BOLSA} />
              </clipPath>
              <linearGradient id="oro" x1="0" y1="0" x2="1" y2="0.35">
                <stop offset="0" stopColor="#9c7630" />
                <stop offset="0.22" stopColor="#e8cf8a" />
                <stop offset="0.4" stopColor="#c9a04f" />
                <stop offset="0.58" stopColor="#f6e6b4" />
                <stop offset="0.78" stopColor="#b88c3c" />
                <stop offset="1" stopColor="#7d5a22" />
              </linearGradient>
              <linearGradient id="oro-texto" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#c9a04f" />
                <stop offset="0.5" stopColor="#f3dfa2" />
                <stop offset="1" stopColor="#b88c3c" />
              </linearGradient>
              <linearGradient id="etiqueta-luz" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#000" stopOpacity="0.35" />
                <stop offset="0.14" stopColor="#000" stopOpacity="0.05" />
                <stop offset="0.55" stopColor="#fff" stopOpacity="0.12" />
                <stop offset="0.86" stopColor="#000" stopOpacity="0.08" />
                <stop offset="1" stopColor="#000" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.55" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <ellipse cx="240" cy="760" rx="170" ry="14" fill="#1c1710" opacity="0.22" />
            <path d={BOLSA} fill="url(#oro)" />
            <g clipPath="url(#bolsa-recorte)">
              <rect x="60" y="60" width="360" height="700" filter="url(#papel)" opacity="0.18" />
              {/* panel negro de abajo, como las bolsas metalizadas */}
              <path d="M60 520 Q240 500 420 520 V760 H60Z" fill="#17120c" />
              <path d="M60 520 Q240 500 420 520" stroke="url(#oro-texto)" strokeWidth="2.5" fill="none" />
              {CURVAS.map((d) => (
                <path key={d} d={d} fill="none" stroke="#e8cf8a" strokeWidth="1" opacity="0.14" />
              ))}
              {/* reflejo que se mueve con la inclinación */}
              <rect className="bolsa-brillo" x="-60" y="60" width="140" height="460" fill="url(#brillo)"/>
              {/* sellado térmico de arriba */}
              {Array.from({ length: 40 }).map((_, i) => (
                <path key={i} d={`M${84 + i * 8} 66 V98`} stroke="#1c1710" strokeWidth="1" opacity="0.1" />
              ))}
              <path d="M78 100 H402" stroke="#1c1710" strokeWidth="1" opacity="0.18" />
              <rect x="60" y="60" width="360" height="700" fill="url(#bolsa-luz)" opacity="0.8" />
            </g>
            {/* boca abierta: se ve el interior mientras no está doblada */}
            <path ref={boca} d="M90 64 Q240 96 390 64 Q240 78 90 64Z" fill="#3a2a18" opacity="1" />
            <path d={BOLSA} fill="none" stroke="#5a3f14" strokeWidth="2.5" />
            {/* muescas de corte */}
            <path d="M76 120 l8 4 l-8 4 M404 120 l-8 4 l8 4" stroke="#1c1710" strokeWidth="1.5" fill="none" />
            {/* cierre zip */}
            <path ref={zipAbierto} d="M86 140 H394" stroke="#1c1710" strokeWidth="2" strokeDasharray="6 5" opacity="0.5" />
            <path ref={zipCerrado} d="M86 138 H394 M86 143 H394" stroke="#1c1710" strokeWidth="1.5" opacity="0" />
            {/* válvula */}
            <circle cx="240" cy="182" r="11" fill="none" stroke="#1c1710" strokeWidth="1.6" opacity="0.7" />
            <circle cx="240" cy="182" r="5" fill="none" stroke="#1c1710" strokeWidth="1.2" opacity="0.7" />

            <Monograma tinta="#1c1710" />
            <text x="240" y="346" textAnchor="middle" className="dato" fontSize="30" fill="#1c1710" letterSpacing="12">
              ALTURA
            </text>
            <text x="240" y="366" textAnchor="middle" className="dato" fontSize="10.5" fill="#1c1710" letterSpacing="3" opacity="0.7">
              CAFÉ DE ESPECIALIDAD · DE LA PLANTA A LA TAZA
            </text>

            {/* banda de etiqueta en la tinta del lote */}
            <g>
              <g clipPath="url(#bolsa-recorte)">
                <path d="M60 396 Q240 380 420 396 V504 Q240 490 60 504Z" fill="var(--lote)" />
                <path d="M60 396 Q240 380 420 396" stroke="#e8cf8a" strokeWidth="1.5" fill="none" opacity="0.8" />
                <path d="M60 504 Q240 490 420 504" stroke="#e8cf8a" strokeWidth="1.5" fill="none" opacity="0.8" />
                {/* luz de cilindro sobre la etiqueta */}
                <path d="M60 396 Q240 380 420 396 V504 Q240 490 60 504Z" fill="url(#bolsa-luz)" />
                <path d="M60 396 Q240 380 420 396 V504 Q240 490 60 504Z" fill="url(#etiqueta-luz)" />
              </g>
              <text x="100" y="430" className="stencil" fontSize="38" fill="#f4ecdc">
                ETIOPÍA
              </text>
              <text x="101" y="454" className="dato" fontSize="13" fill="#f4ecdc" letterSpacing="1.5">
                GUJI · HAMBELA · LAVADO
              </text>
              <path d="M270 404 V488" stroke="#f4ecdc" strokeWidth="1" opacity="0.5" />
              {[
                ["ALTITUD", "2.150 MSNM"],
                ["VARIEDAD", "HEIRLOOM"],
                ["NOTAS", "JAZMÍN · DURAZNO"],
              ].map(([k, v], i) => (
                <g key={k}>
                  <text x="282" y={414 + i * 30} className="dato" fontSize="8.5" fill="#f4ecdc" opacity="0.75" letterSpacing="1.2">
                    {k}
                  </text>
                  <text x="282" y={427 + i * 30} className="dato" fontSize="11.5" fill="#f4ecdc" letterSpacing="0.5">
                    {v}
                  </text>
                </g>
              ))}
              <text x="101" y="486" className="dato" fontSize="10.5" fill="#f4ecdc" letterSpacing="2" opacity="0.85">
                LOTE ALT-07 · 250 G · GRANO
              </text>
            </g>

            {/* sellos: uno por etapa */}
            {ETAPAS.map((e, i) => {
              const cx = 156 + (i % 3) * 84;
              const cy = 584 + Math.floor(i / 3) * 62;
              const [arriba, valor] = SELLOS[e.id];
              return (
                <g key={e.id} className="estampa" data-puesta={i <= activa} style={{ "--giro": `${((i * 37) % 17) - 8}deg` } as React.CSSProperties}>
                  <circle cx={cx} cy={cy} r="27" fill="#17120c" stroke="url(#oro-texto)" strokeWidth="2" />
                  <circle cx={cx} cy={cy} r="22.5" fill="none" stroke="#e8cf8a" strokeWidth="0.8" strokeDasharray="2 2.5" opacity="0.8" />
                  <text x={cx} y={cy - 5} textAnchor="middle" className="dato" fontSize="7" fill="#e8cf8a" letterSpacing="1">
                    {arriba}
                  </text>
                  <text x={cx} y={cy + 9} textAnchor="middle" className="stencil" fontSize={valor.length > 6 ? 11.5 : 14} fill="#f3dfa2">
                    {valor}
                  </text>
                </g>
              );
            })}

            {/* solapa doblada y cinta de cierre (aparecen con el scroll) */}
            <g ref={solapa} opacity="0">
              <path d="M78 62 H402 V150 Q240 158 78 150Z" fill="url(#oro)" stroke="#5a3f14" strokeWidth="2" />
              <path d="M80 150 Q240 160 400 150" stroke="#1c1710" strokeWidth="5" opacity="0.12" fill="none" />
              <path d="M96 118 H384" stroke="#1c1710" strokeWidth="1" opacity="0.15" />
            </g>
            <g ref={cierre} opacity="0">
              <rect x="70" y="100" width="340" height="12" fill="#2b2118" />
              <path d="M70 100 l-10 -6 v24 l10 -6 M410 100 l10 -6 v24 l-10 -6" fill="#2b2118" />
              <text x="240" y="138" textAnchor="middle" className="dato" fontSize="10" fill="#1c1710" letterSpacing="4" opacity="0.8">
                SELLADO EN ORIGEN
              </text>
            </g>
          </svg>

          <svg className="bolsa-dorso" viewBox="0 0 480 780">
            <defs>
              <clipPath id="dorso-recorte">
                <path d={BOLSA} />
              </clipPath>
            </defs>
            <ellipse cx="240" cy="760" rx="170" ry="14" fill="#1c1710" opacity="0.22" />
            <path d={BOLSA} fill="#1f1a14" stroke="#0e0b08" strokeWidth="2.5" />
            <g clipPath="url(#dorso-recorte)">
              {Array.from({ length: 16 }, (_, i) => {
                const y = 90 + i * 42;
                return (
                  <path
                    key={i}
                    d={`M40 ${y} C130 ${y - 30 + (i % 3) * 8} 190 ${y + 26} 250 ${y + 2} S390 ${y - 24 + (i % 2) * 12} 470 ${y + 8}`}
                    fill="none"
                    stroke="#f4ecdc"
                    strokeWidth="1"
                    opacity="0.12"
                  />
                );
              })}
            </g>
            <Monograma tinta="#f4ecdc" y={200} />
            <text x="240" y="310" textAnchor="middle" className="dato" fontSize="22" fill="#f4ecdc" letterSpacing="5">
              CAFÉ DE ESPECIALIDAD
            </text>
            <text x="240" y="340" textAnchor="middle" className="dato" fontSize="22" fill="#f4ecdc" letterSpacing="5">
              TOSTADO EN ALTURA
            </text>
            <g fill="#f4ecdc" className="dato">
              {[
                ["FINCA", "Estación de lavado Buku"],
                ["COSECHA", "2025/26 · a mano"],
                ["SECADO", "Camas africanas, 12 días"],
                ["RECETA", "V60 · 15 g · 250 g · 94 °C"],
              ].map(([k, v], i) => (
                <g key={k}>
                  <text x="110" y={420 + i * 48} fontSize="10" opacity="0.6" letterSpacing="2">
                    {k}
                  </text>
                  <text x="110" y={438 + i * 48} fontSize="15" letterSpacing="0.5" style={{ textTransform: "none" }}>
                    {v}
                  </text>
                </g>
              ))}
            </g>
            <text x="240" y="690" textAnchor="middle" className="dato" fontSize="11" fill="#f4ecdc" letterSpacing="3" opacity="0.7">
              ALTURA-CAFE.WEBFLOW.IO
            </text>
          </svg>
        </div>
        <span className="bolsa-ayuda dato">{volteada ? "Toca para ver el frente" : "Toca la bolsa para darla vuelta"}</span>
      </div>
      <div className="saco-movil">
        <p className="saco-etapa">
          <span className="stencil">{activa >= 0 ? ETAPAS[activa].titulo : "Saco abierto"}</span>
          <span className="dato">
            {activa >= 0 ? `${ETAPAS[activa].variable[0]} · ${ETAPAS[activa].variable[1]}` : "Sigue el lote"}
          </span>
        </p>
        <div className="saco-tira" ref={tira}>
          {ETAPAS.map((e, i) => (
            <span key={e.id} className="dato" data-puesta={i <= activa} data-activa={i === activa}>
              {e.titulo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Historia() {
  const [activa, setActiva] = useState(-1);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            setActiva(Number((e.target as HTMLElement).dataset.indice));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    refs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section className="historia" id="historia" aria-labelledby="historia-titulo">
      <div className="historia-cabeza">
        <h2 id="historia-titulo" className="stencil titulo-seccion">
          De la planta a la taza
        </h2>
        <p className="bajada">
          Sigue el lote ALT-07 de Guji, Etiopía, en nueve etapas. En cada una
          se define una variable que después vas a encontrar en la ficha de
          cada café, y el saco se va estampando a medida que avanzas.
        </p>
      </div>
      <div className="historia-grilla">
        <div className="historia-saco">
          <Saco activa={activa} />
        </div>
        <ol className="etapas" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ETAPAS.map((e, i) => (
            <li
              key={e.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              data-indice={i}
              data-activa={i === activa || activa === -1}
              className="etapa"
              id={`etapa-${e.id}`}
            >
              <h3 className="stencil">{e.titulo}</h3>
              {e.ilustracion}
              {e.id === "molienda" && <Molinillo />}
              {e.texto.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <p className="dato etapa-variable">
                {e.id === "planta" && (
                  <svg viewBox="0 0 40 24" className="etapa-variable-icono" aria-hidden="true">
                    <path d="M1 23 L13 7 L19 14 L25 5 L39 23Z" fill="currentColor" />
                    <path d="M22 9 L25 5 L28 9 L26 10 L25 8.5 L24 10Z" fill="var(--jute)" />
                  </svg>
                )}
                <span>{e.variable[0]}</span>
                <strong>{e.variable[1]}</strong>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
