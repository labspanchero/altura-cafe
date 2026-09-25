// Ilustraciones de estarcido: formas planas en tinta, con puentes de plantilla.
const TINTA = "var(--ink)";

// Hoja de cafeto: forma lanceolada con nervadura central y venas laterales.
function Hoja({ x, y, giro, largo = 150, id, clave }: { x: number; y: number; giro: number; largo?: number; id: string; clave: string }) {
  const a = largo * 0.22;
  const cuerpo = `M0 0 C${largo * 0.18} ${-a * 1.25} ${largo * 0.7} ${-a * 1.05} ${largo} 0 C${largo * 0.7} ${a * 0.95} ${largo * 0.18} ${a * 1.1} 0 0Z`;
  const venas = [0.22, 0.38, 0.54, 0.7, 0.84].flatMap((t) => {
    const vx = largo * t;
    const d = a * (1 - Math.abs(t - 0.45) * 1.1) * 0.78;
    return [`M${vx} 0 Q${vx + largo * 0.07} ${-d * 0.5} ${vx + largo * 0.13} ${-d}`, `M${vx} 0 Q${vx + largo * 0.07} ${d * 0.5} ${vx + largo * 0.13} ${d}`];
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <clipPath id={`recorte-${clave}`}>
        <path d={cuerpo} />
      </clipPath>
      <path d={cuerpo} fill={`url(#${id})`} />
      <g clipPath={`url(#recorte-${clave})`}>
        <path d={`M2 0 Q${largo * 0.5} ${-a * 0.08} ${largo - 6} 0`} stroke="#d8d27a" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {venas.map((v) => (
          <path key={v} d={v} stroke="#b9c46a" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.8" />
        ))}
      </g>
      <path d={cuerpo} fill="none" stroke="#0f1a0e" strokeWidth="3.2" strokeLinejoin="round" />
    </g>
  );
}

function Fruto({ cx, cy, color, r = 14 }: { cx: number; cy: number; color: string; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#1a0f0c" strokeWidth="3" />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.38} rx={r * 0.32} ry={r * 0.22} fill="#fff" opacity="0.75" transform={`rotate(-30 ${cx - r * 0.35} ${cy - r * 0.38})`} />
      <circle cx={cx + r * 0.5} cy={cy - r * 0.62} r={r * 0.14} fill="#1a0f0c" />
    </g>
  );
}

export function Planta() {
  return (
    <svg viewBox="0 -10 450 245" className="etapa-ilustracion" role="img" aria-label="Rama de cafeto con hojas verdes y cerezas verdes, amarillas y rojas según su maduración">
      <defs>
        <linearGradient id="hoja-arriba" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2f7a2a" />
          <stop offset="0.55" stopColor="#1f5f22" />
          <stop offset="1" stopColor="#154a1a" />
        </linearGradient>
        <linearGradient id="hoja-abajo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#276f26" />
          <stop offset="1" stopColor="#123f16" />
        </linearGradient>
        <linearGradient id="tallo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a3418" />
          <stop offset="1" stopColor="#7b4a24" />
        </linearGradient>
      </defs>
      {/* hojas de abajo, detrás del tallo */}
      {[
        [58, 132, 42],
        [148, 124, 44],
        [238, 114, 42],
        [322, 104, 40],
      ].map(([x, y, g], i) => (
        <Hoja key={`b${i}`} clave={`b${i}`} id="hoja-abajo" x={x} y={y} giro={g} largo={128 - i * 4} />
      ))}
      <path d="M12 142 C120 130 260 112 408 76" stroke="#1a0f0c" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M12 142 C120 130 260 112 408 76" stroke="url(#tallo)" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* hojas de arriba */}
      {[
        [62, 130, -38],
        [152, 121, -40],
        [242, 111, -38],
        [326, 101, -40],
      ].map(([x, y, g], i) => (
        <Hoja key={`a${i}`} clave={`a${i}`} id="hoja-arriba" x={x} y={y} giro={g} largo={140 - i * 4} />
      ))}
      {/* cerezas: de verde a madura, siguiendo la rama */}
      <Fruto cx={94} cy={140} color="#5c9e2e" />
      <Fruto cx={118} cy={148} color="#d7263d" r={15} />
      <Fruto cx={186} cy={129} color="#e8c11c" />
      <Fruto cx={210} cy={138} color="#d7263d" r={15} />
      <Fruto cx={276} cy={116} color="#c81d33" />
      <Fruto cx={300} cy={126} color="#d7263d" r={15} />
    </svg>
  );
}

export function Cereza() {
  const capas = [
    { r: 96, c: "#c8202f", n: "Piel" },
    { r: 80, c: "#e8836f", n: "Pulpa" },
    { r: 66, c: "#f2c9a0", n: "Mucílago" },
    { r: 54, c: "#e9dcb8", n: "Pergamino" },
  ];
  return (
    <svg viewBox="0 0 400 220" className="etapa-ilustracion" role="img" aria-label="Corte de una cereza de café: piel, pulpa, mucílago, pergamino y dos granos">
      <g transform="translate(110 110)">
        {capas.map((k) => (
          <circle key={k.n} r={k.r} fill={k.c} stroke={TINTA} strokeWidth="3" />
        ))}
        <ellipse cx="-22" rx="22" ry="40" fill="#8aa35a" stroke={TINTA} strokeWidth="3" />
        <ellipse cx="22" rx="22" ry="40" fill="#8aa35a" stroke={TINTA} strokeWidth="3" />
        <path d="M-10 -32 Q-4 0 -10 32 M10 -32 Q4 0 10 32" stroke={TINTA} strokeWidth="3" fill="none" />
      </g>
      {capas.concat({ r: 30, c: "#8aa35a", n: "Grano verde" }).map((k, i) => (
        <g key={k.n} transform={`translate(240 ${32 + i * 38})`}>
          <rect width="18" height="18" fill={k.c} stroke={TINTA} strokeWidth="3" />
          <text x="30" y="15" className="dato" fontSize="18" fill={TINTA}>{k.n}</text>
        </g>
      ))}
    </svg>
  );
}

export function Cosecha() {
  const madurez = [
    { c: "#3f7a2e", n: "Verde", ok: false },
    { c: "#d9a90b", n: "Pintona", ok: false },
    { c: "#c8202f", n: "Madura", ok: true },
    { c: "#6e1320", n: "Sobremadura", ok: false },
  ];
  return (
    <svg viewBox="0 0 400 200" className="etapa-ilustracion" role="img" aria-label="Escala de maduración de la cereza: solo se cosechan las maduras">
      {madurez.map((m, i) => (
        <g key={m.n} transform={`translate(${50 + i * 100} 80)`}>
          <circle r="34" fill={m.c} stroke={TINTA} strokeWidth="4" />
          {m.ok && <circle r="48" fill="none" stroke={TINTA} strokeWidth="4" strokeDasharray="10 6" />}
          <text y="80" textAnchor="middle" className="dato" fontSize="18" fill={TINTA}>{m.n}</text>
        </g>
      ))}
    </svg>
  );
}

export function Procesos() {
  const p = [
    { n: "Lavado", fruta: 0, d: "Sin pulpa ni mucílago" },
    { n: "Honey", fruta: 1, d: "Con parte del mucílago" },
    { n: "Natural", fruta: 2, d: "Cereza entera" },
  ];
  return (
    <svg viewBox="0 0 420 210" className="etapa-ilustracion" role="img" aria-label="Tres procesos: lavado sin fruta, honey con mucílago y natural con la cereza entera">
      {p.map((x, i) => (
        <g key={x.n} transform={`translate(${70 + i * 140} 80)`}>
          {x.fruta === 2 && <circle r="58" fill="#6e1320" stroke={TINTA} strokeWidth="3" />}
          {x.fruta >= 1 && <circle r="46" fill="#d98a3a" stroke={TINTA} strokeWidth="3" />}
          <circle r="36" fill="#e9dcb8" stroke={TINTA} strokeWidth="3" />
          <ellipse cx="-13" rx="13" ry="25" fill="#8aa35a" stroke={TINTA} strokeWidth="3" />
          <ellipse cx="13" rx="13" ry="25" fill="#8aa35a" stroke={TINTA} strokeWidth="3" />
          <text y="96" textAnchor="middle" className="stencil" fontSize="26" fill={TINTA}>{x.n}</text>
          <text y="118" textAnchor="middle" className="dato" fontSize="14" fill={TINTA}>{x.d}</text>
        </g>
      ))}
    </svg>
  );
}

export function Secado() {
  return (
    <svg viewBox="0 0 400 200" className="etapa-ilustracion" role="img" aria-label="Cama africana de secado con granos bajo el sol; la humedad baja de 60% a 11%">
      <circle cx="340" cy="44" r="26" fill={TINTA} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <path key={i} d={`M${340 + Math.cos(a) * 34} ${44 + Math.sin(a) * 34} L${340 + Math.cos(a) * 46} ${44 + Math.sin(a) * 46}`} stroke={TINTA} strokeWidth="5" strokeLinecap="round" />
        );
      })}
      <rect x="20" y="110" width="290" height="14" fill={TINTA} />
      {[40, 150, 260].map((x) => (
        <rect key={x} x={x} y="124" width="10" height="56" fill={TINTA} />
      ))}
      {Array.from({ length: 22 }).map((_, i) => (
        <ellipse key={i} cx={34 + i * 12.5} cy={102} rx="6" ry="8" fill="#b9a36a" stroke={TINTA} strokeWidth="2" />
      ))}
      <text x="20" y="60" className="dato" fontSize="18" fill={TINTA}>Humedad 60% → 11%</text>
    </svg>
  );
}

export function Tueste() {
  const t = [
    { c: "#8aa35a", n: "Verde", g: "25 °C" },
    { c: "#c9a15c", n: "Secado", g: "160 °C" },
    { c: "#9a5f2c", n: "1.er crack", g: "196 °C" },
    { c: "#6b3a1c", n: "Medio", g: "210 °C" },
    { c: "#3a1f10", n: "Oscuro", g: "225 °C" },
  ];
  return (
    <svg viewBox="0 0 420 190" className="etapa-ilustracion" role="img" aria-label="Escala de tueste del grano verde al oscuro con temperaturas de referencia">
      {t.map((x, i) => (
        <g key={x.n} transform={`translate(${46 + i * 82} 70)`}>
          <ellipse rx="26" ry="36" fill={x.c} stroke={TINTA} strokeWidth="3" />
          <path d="M0 -30 Q-8 0 0 30" stroke={TINTA} strokeWidth="3" fill="none" />
          <text y="66" textAnchor="middle" className="dato" fontSize="15" fill={TINTA}>{x.n}</text>
          <text y="86" textAnchor="middle" className="dato" fontSize="15" fill={TINTA} opacity="0.75">{x.g}</text>
        </g>
      ))}
    </svg>
  );
}

export function Taza() {
  return (
    <svg viewBox="0 0 400 200" className="etapa-ilustracion" role="img" aria-label="Taza vista desde arriba y rango de extracción ideal entre 18% y 22%">
      <circle cx="90" cy="100" r="78" fill="var(--paper)" stroke={TINTA} strokeWidth="5" />
      <circle cx="90" cy="100" r="60" fill="#5a2e14" stroke={TINTA} strokeWidth="3" />
      <path d="M70 80 Q90 70 110 84" stroke="#c98a55" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M168 88 h22 a14 14 0 0 1 0 28 h-22" stroke={TINTA} strokeWidth="6" fill="none" />
      <g transform="translate(220 60)">
        <text className="dato" fontSize="16" fill={TINTA}>Extracción</text>
        <rect y="14" width="160" height="22" fill="none" stroke={TINTA} strokeWidth="3" />
        <rect x="58" y="14" width="44" height="22" fill={TINTA} />
        <text y="58" className="dato" fontSize="14" fill={TINTA}>Sub</text>
        <text x="62" y="58" className="dato" fontSize="14" fill={TINTA}>18–22%</text>
        <text x="130" y="58" className="dato" fontSize="14" fill={TINTA}>Sobre</text>
        <text y="96" className="dato" fontSize="16" fill={TINTA}>Relación 1:15 a 1:17</text>
      </g>
    </svg>
  );
}
