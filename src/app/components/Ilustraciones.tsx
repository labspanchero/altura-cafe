// Ilustraciones de estarcido: formas planas en tinta, con puentes de plantilla.
const TINTA = "var(--ink)";

export function Planta() {
  return (
    <svg viewBox="0 0 400 220" className="etapa-ilustracion" role="img" aria-label="Rama de cafeto con hojas y cerezas en distintos grados de maduración">
      <path d="M10 120 C120 110 260 100 390 70" stroke={TINTA} strokeWidth="7" fill="none" strokeLinecap="round" />
      {[60, 150, 240, 320].map((x, i) => (
        <g key={x} transform={`translate(${x} ${118 - i * 12})`}>
          <path d="M0 0 C20 -60 80 -70 110 -60 C80 -30 40 -5 0 0Z" fill={TINTA} transform="rotate(-8)" />
          <path d="M4 -3 L92 -56" stroke="var(--jute)" strokeWidth="3" transform="rotate(-8)" />
          <path d="M0 0 C20 60 70 70 100 58 C70 30 40 6 0 0Z" fill={TINTA} transform="rotate(10)" />
          <path d="M4 3 L86 54" stroke="var(--jute)" strokeWidth="3" transform="rotate(10)" />
        </g>
      ))}
      {[
        [100, 128, "#2f6b2a"],
        [118, 136, "#c8202f"],
        [196, 118, "#d9a90b"],
        [212, 126, "#c8202f"],
        [284, 104, "#6e1320"],
        [300, 112, "#c8202f"],
      ].map(([cx, cy, c]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="12" fill={c as string} stroke={TINTA} strokeWidth="3" />
          <circle cx={(cx as number) - 4} cy={(cy as number) - 4} r="3" fill="var(--paper)" opacity="0.7" />
        </g>
      ))}
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
