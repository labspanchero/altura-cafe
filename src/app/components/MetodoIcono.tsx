import type { Metodo } from "@/lib/cafes";

// Íconos de cafeteras en trazo de tinta, uno por método de preparación.
const TRAZO = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 3,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const DIBUJOS: Record<Metodo, React.ReactNode> = {
  espresso: (
    <>
      <rect x="10" y="6" width="44" height="14" rx="2" {...TRAZO} />
      <path d="M14 20v34M50 20v34M8 54h48" {...TRAZO} />
      <path d="M26 20v5h12v-5" {...TRAZO} />
      <path d="M24 25h16M40 25h10" {...TRAZO} />
      <path d="M28 34h10v8a5 5 0 0 1-5 5 5 5 0 0 1-5-5z" fill="currentColor" />
      <path d="M38 36h2a2.5 2.5 0 0 1 0 5h-2" {...TRAZO} strokeWidth={2} />
      <circle cx="44" cy="13" r="2.5" fill="currentColor" />
    </>
  ),
  moka: (
    <>
      <path d="M20 58h24l-4-22H24z" {...TRAZO} />
      <path d="M24 36l3-4h10l3 4" {...TRAZO} />
      <path d="M22 32l-2-18h24l-2 18" {...TRAZO} />
      <path d="M20 14l3-5h18l3 5" {...TRAZO} />
      <circle cx="32" cy="7" r="2.5" fill="currentColor" />
      <path d="M44 16h6v13h-6" {...TRAZO} />
      <path d="M20 17l-5-3" {...TRAZO} />
    </>
  ),
  aeropress: (
    <>
      <rect x="22" y="6" width="20" height="10" rx="1.5" {...TRAZO} />
      <path d="M20 16h24M22 16v26h20V16" {...TRAZO} />
      <path d="M26 24h12M26 30h12M26 36h12" {...TRAZO} strokeWidth={2} />
      <path d="M18 42h28" {...TRAZO} />
      <path d="M22 46h20l-3 12H25z" {...TRAZO} />
    </>
  ),
  v60: (
    <>
      <path d="M12 12h40L38 36H26z" {...TRAZO} />
      <path d="M22 18l6 12M32 16v14M42 18l-6 12" {...TRAZO} strokeWidth={2} />
      <path d="M52 16h4a3 3 0 0 1 0 6l-6 4" {...TRAZO} />
      <path d="M18 36h28" {...TRAZO} />
      <path d="M22 40h20v14a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4z" {...TRAZO} />
      <path d="M24 48h16" {...TRAZO} strokeWidth={2} />
    </>
  ),
  chemex: (
    <>
      <path d="M18 6h28L34 28v2l12 22a4 4 0 0 1-3.5 6h-21A4 4 0 0 1 18 52l12-22v-2z" {...TRAZO} />
      <path d="M25 22h14l-3 12h-8z" fill="currentColor" />
      <path d="M37 26l5 7" {...TRAZO} strokeWidth={2} />
      <circle cx="44" cy="35" r="2" fill="currentColor" />
      <path d="M22 48h20" {...TRAZO} strokeWidth={2} />
    </>
  ),
  prensa: (
    <>
      <circle cx="30" cy="5" r="3" fill="currentColor" />
      <path d="M30 8v12" {...TRAZO} />
      <path d="M16 14h28" {...TRAZO} />
      <rect x="18" y="18" width="24" height="38" rx="2" {...TRAZO} />
      <path d="M18 30h24" {...TRAZO} strokeWidth={2} />
      <path d="M20 44h20v10H20z" fill="currentColor" />
      <path d="M42 24h8v24h-8" {...TRAZO} />
      <path d="M14 58h32" {...TRAZO} />
    </>
  ),
  coldbrew: (
    <>
      <rect x="20" y="6" width="24" height="7" rx="1.5" {...TRAZO} />
      <path d="M22 13v4c-3 2-4 4-4 8v27a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V25c0-4-1-6-4-8v-4" {...TRAZO} />
      <path d="M22 34h20v18H22z" fill="currentColor" />
      <path d="M27 26l-2 3M33 24l-2 3M39 26l-2 3" {...TRAZO} strokeWidth={2} />
      <path d="M14 20l-3 5M52 22l-3 4" {...TRAZO} strokeWidth={2} />
    </>
  ),
};

export default function MetodoIcono({
  metodo,
  className = "metodo-icono",
  titulo,
}: {
  metodo: Metodo;
  className?: string;
  titulo?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 64 64" role={titulo ? "img" : undefined} aria-hidden={titulo ? undefined : true} aria-label={titulo}>
      {DIBUJOS[metodo]}
    </svg>
  );
}
