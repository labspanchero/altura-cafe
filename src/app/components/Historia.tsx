"use client";

import { useEffect, useRef, useState } from "react";
import { METODOS, METODOS_ORDEN } from "@/lib/cafes";
import dynamic from "next/dynamic";
import { Cereza, Cosecha, Planta, Procesos, Secado, Taza } from "./Ilustraciones";

const GranoTueste = dynamic(() => import("./three/GranoTueste"), { ssr: false });

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
    estampa: { texto: ["HEIRLOOM"], x: 280, y: 200, giro: 6, ancho: 160 },
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
    ilustracion: <Taza />,
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
        <span className="stencil">{metodo.nombre}</span>
        <span className="dato">
          {metodo.molienda} · <span className="unidad">{metodo.micras}</span>
        </span>
      </div>
    </div>
  );
}

function Saco({ activa }: { activa: number }) {
  return (
    <div className="saco" aria-hidden="true">
      <svg viewBox="0 0 480 720">
        <defs>
          <pattern id="trama" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#a67f47" />
            <path d="M0 2h8M0 6h8" stroke="#3a260c" strokeOpacity=".28" strokeWidth="1.6" />
            <path d="M2 0v8M6 0v8" stroke="#ffecc4" strokeOpacity=".12" strokeWidth="1.4" />
          </pattern>
          <filter id="tinta-gastada">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.4" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <path
          d="M40 60 Q60 20 110 36 L370 36 Q420 20 440 60 L452 660 Q450 700 410 704 L70 704 Q30 700 28 660Z"
          fill="url(#trama)"
          stroke="var(--ink)"
          strokeWidth="4"
        />
        <path d="M40 92 Q240 110 440 92" stroke="var(--ink)" strokeWidth="3" strokeDasharray="10 8" fill="none" />
        <g filter="url(#tinta-gastada)">
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
      <div className="saco-tira">
        {ETAPAS.map((e, i) => (
          <span key={e.id} className="dato" data-puesta={i <= activa} data-activa={i === activa}>
            {e.titulo}
          </span>
        ))}
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
