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

// Boca del saco: mismos comandos abierta y cerrada para poder interpolar.
const BOCA_ABIERTA = [
  [40, 60], [45, 40], [70, 28], [110, 36], [110, 36], [240, 40], [370, 36], [370, 36], [410, 28], [435, 40], [440, 60],
];
const BOCA_CERRADA = [
  [40, 150], [40, 108], [182, 96], [207, 48], [194, 14], [240, -8], [286, 14], [273, 48], [298, 96], [440, 108], [440, 150],
];

function pathSaco(c: number) {
  const p = BOCA_ABIERTA.map(([x, y], i) => {
    const [x2, y2] = BOCA_CERRADA[i];
    return `${(x + (x2 - x) * c).toFixed(1)} ${(y + (y2 - y) * c).toFixed(1)}`;
  });
  return `M${p[0]} C${p[1]} ${p[2]} ${p[3]} L${p[4]} Q${p[5]} ${p[6]} L${p[7]} C${p[8]} ${p[9]} ${p[10]} L452 660 Q450 700 410 704 L70 704 Q30 700 28 660Z`;
}

// Trama de arpillera generada una vez: hilos irregulares, fibras y relieve.
function texturaArpillera() {
  const T = 192;
  const cv = document.createElement("canvas");
  cv.width = cv.height = T;
  const g = cv.getContext("2d");
  if (!g) return "";
  let sem = 11;
  const r = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#6e4f25";
  g.fillRect(0, 0, T, T);
  const paso = 8;
  const n = T / paso;
  const tonos = Array.from({ length: n }, () => 150 + r() * 40);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const encima = (i + j) % 2 === 0;
      const t = (encima ? tonos[j] : tonos[i]) + (r() - 0.5) * 18;
      const x = i * paso;
      const y = j * paso;
      const grad = encima ? g.createLinearGradient(x, y, x, y + paso) : g.createLinearGradient(x, y, x + paso, y);
      grad.addColorStop(0, `rgb(${t * 0.78},${t * 0.58},${t * 0.33})`);
      grad.addColorStop(0.5, `rgb(${t * 1.02},${t * 0.78},${t * 0.47})`);
      grad.addColorStop(1, `rgb(${t * 0.7},${t * 0.51},${t * 0.29})`);
      g.fillStyle = grad;
      const grosor = paso - 1.4 - r() * 1.2;
      if (encima) g.fillRect(x + 0.4, y + (paso - grosor) / 2, paso - 0.8, grosor);
      else g.fillRect(x + (paso - grosor) / 2, y + 0.4, grosor, paso - 0.8);
    }
  }
  g.lineWidth = 0.6;
  for (let k = 0; k < 260; k++) {
    const x = r() * T;
    const y = r() * T;
    const a = r() * Math.PI;
    const l = 3 + r() * 9;
    g.strokeStyle = r() < 0.6 ? "rgba(235,200,140,0.35)" : "rgba(60,38,14,0.35)";
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  return cv.toDataURL("image/png");
}

function Saco({ activa }: { activa: number }) {
  const tira = useRef<HTMLDivElement>(null);
  const cuerpo = useRef<SVGPathElement>(null);
  const volumen = useRef<SVGPathElement>(null);
  const costura = useRef<SVGPathElement>(null);
  const atadura = useRef<SVGGElement>(null);
  const pliegues = useRef<SVGGElement>(null);
  const marca = useRef<SVGGElement>(null);
  const [trama, setTrama] = useState("");

  useEffect(() => setTrama(texturaArpillera()), []);

  // Cierre continuo: abierto al empezar la historia, atado en "Trilla y saco".
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
      const d = pathSaco(c);
      cuerpo.current?.setAttribute("d", d);
      volumen.current?.setAttribute("d", d);
      costura.current?.setAttribute("opacity", String(Math.max(0, 1 - c * 2.5)));
      pliegues.current?.setAttribute("opacity", String(Math.max(0, (c - 0.35) / 0.65)));
      const nudo = Math.max(0, (c - 0.82) / 0.18);
      atadura.current?.setAttribute("opacity", String(nudo));
      atadura.current?.setAttribute("transform", `translate(0 ${(1 - nudo) * -18})`);
      marca.current?.setAttribute("transform", `translate(0 ${c * 16})`);
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
    if (t && chip) t.scrollTo({ left: t.scrollLeft + chip.getBoundingClientRect().left - t.getBoundingClientRect().left - 8, behavior: "smooth" });
  }, [activa]);
  return (
    <div className="saco" aria-hidden="true">
      <svg viewBox="0 0 480 720">
        <defs>
          <pattern id="trama" width="96" height="96" patternUnits="userSpaceOnUse">
            <rect width="96" height="96" fill="#a67f47" />
            {trama && <image href={trama} width="96" height="96" />}
          </pattern>
          <radialGradient id="volumen" cx="45%" cy="40%" r="75%">
            <stop offset="0" stopColor="#fff3dc" stopOpacity="0.16" />
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#1c1710" stopOpacity="0.4" />
          </radialGradient>
          <filter id="tinta-gastada">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.4" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <path ref={cuerpo} d={pathSaco(0)} fill="url(#trama)" stroke="var(--ink)" strokeWidth="4" />
        <path ref={volumen} d={pathSaco(0)} fill="url(#volumen)" pointerEvents="none" />
        <path ref={costura} d="M40 92 Q240 110 440 92" stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 8" fill="none" />
        <g ref={pliegues} opacity="0" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M214 52 Q170 90 96 118" opacity="0.55" />
          <path d="M224 54 Q205 100 168 134" opacity="0.45" />
          <path d="M240 55 Q240 100 238 140" opacity="0.4" />
          <path d="M256 54 Q276 100 312 134" opacity="0.45" />
          <path d="M266 52 Q310 90 384 118" opacity="0.55" />
          <path d="M200 26 Q210 36 206 48 M280 26 Q270 36 274 48 M226 12 Q232 30 228 46 M254 12 Q248 30 252 46" opacity="0.6" />
        </g>
        <g ref={atadura} opacity="0">
          <path d="M200 46 Q240 60 280 46 L282 58 Q240 72 198 58Z" fill="#3b2a14" stroke="var(--ink)" strokeWidth="2.5" />
          <path d="M205 50 Q240 62 275 50" stroke="#c9a15c" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
          <path d="M276 56 Q300 84 292 118" stroke="#3b2a14" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M276 56 Q318 70 330 104" stroke="#3b2a14" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="278" cy="54" r="8" fill="#3b2a14" stroke="var(--ink)" strokeWidth="2" />
        </g>
        <g ref={marca} filter="url(#tinta-gastada)">
          <text x="240" y="160" textAnchor="middle" className="stencil" fontSize="84" fill="var(--ink)">
            ALTURA
          </text>
        </g>
        {ETAPAS.map((e, i) => (
          <g
            key={e.id}
            className="estampa"
            data-puesta={i <= activa}
            style={{ "--giro": `${e.estampa.giro}deg` } as React.CSSProperties}
            filter="url(#tinta-gastada)"
          >
            <rect
              x={e.estampa.x}
              y={e.estampa.y}
              width={e.estampa.ancho}
              height={e.estampa.texto.length * 36 + 16}
              fill="none"
              stroke="var(--lote)"
              strokeWidth="5"
            />
            {e.estampa.texto.map((t, j) => (
              <text
                key={t}
                x={e.estampa.x + e.estampa.ancho / 2}
                y={e.estampa.y + 42 + j * 36}
                textAnchor="middle"
                className="stencil"
                fontSize="32"
                fill="var(--lote)"
              >
                {t}
              </text>
            ))}
          </g>
        ))}
      </svg>
      <div className="saco-movil">
        <svg className="mini-saco" viewBox="0 0 480 720">
          <path
            d="M40 60 Q60 20 110 36 L370 36 Q420 20 440 60 L452 660 Q450 700 410 704 L70 704 Q30 700 28 660Z"
            fill="var(--jute-deep)"
            stroke="var(--ink)"
            strokeWidth="14"
          />
          <text x="240" y="170" textAnchor="middle" className="stencil" fontSize="96" fill="var(--ink)">
            ALTURA
          </text>
          {ETAPAS.map((e, i) => (
            <rect
              key={e.id}
              className="estampa"
              data-puesta={i <= activa}
              style={{ "--giro": `${e.estampa.giro}deg` } as React.CSSProperties}
              x={e.estampa.x}
              y={e.estampa.y}
              width={e.estampa.ancho}
              height={e.estampa.texto.length * 36 + 16}
              fill="var(--lote)"
              opacity="0.9"
            />
          ))}
        </svg>
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
