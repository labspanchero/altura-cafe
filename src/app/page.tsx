import Carta from "./components/Carta";
import Historia from "./components/Historia";
import Lluvia from "./components/Lluvia";
import ContadorVivo from "./components/ContadorVivo";
import MarcasFondo from "./components/MarcasFondo";
import ArmaTuLote from "./components/ArmaTuLote";
import Laboratorio from "./components/Laboratorio";
import ComoEstaHecho from "./components/ComoEstaHecho";
import { CartaProvider } from "./components/CartaContexto";
import { obtenerCarta } from "@/lib/carta";
import { datosEstructurados, jsonSeguro } from "@/lib/datosEstructurados";

// La carta llega del CMS de Webflow en cada request (con caché en KV).
export const dynamic = "force-dynamic";
import MapaAltura from "./components/MapaAltura";
import { SiluetaSaco } from "./components/Carta";

function Estampa() {
  return (
    <svg className="portada-estampa" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <filter id="sello-gastado">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.4" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g filter="url(#sello-gastado)">
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="6" />
      <circle cx="100" cy="100" r="74" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" />
      <text x="100" y="92" textAnchor="middle" className="stencil" fontSize="34" fill="currentColor">
        88,5
      </text>
      <text x="100" y="124" textAnchor="middle" className="dato" fontSize="18" fill="currentColor">
        PUNTOS SCA
      </text>
      </g>
    </svg>
  );
}

export default async function Home() {
  const { cafes, fuente, cambiado } = await obtenerCarta();
  return (
    <CartaProvider cafes={cafes} fuente={fuente} cambiado={cambiado}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonSeguro(datosEstructurados(cafes)) }} />
      <nav className="nav" aria-label="Principal">
        <a href="#" className="stencil nav-marca">
          Altura
        </a>
        <ul className="dato">
          <li>
            <a className="nav-link" href="#historia">Historia</a>
          </li>
          <li>
            <a className="nav-link" href="#carta">Carta</a>
          </li>
          <li>
            <a className="nav-link" href="#arma">Arma tu café</a>
          </li>
          <li>
            <a className="nav-link" href="#ruta">Ruta</a>
          </li>
          <li>
            <a className="nav-link" href="#barista">Barista</a>
          </li>
          <li>
            <a className="nav-link" href="#tu-cafe">Escanear</a>
          </li>
          <li>
            <a className="nav-link" href="#como-esta-hecho">Cómo se hizo</a>
          </li>
        </ul>
      </nav>

      <main className="principal">
        <MarcasFondo />
        <header className="portada">
          <Lluvia />
          <div className="saco-cara">
            <SiluetaSaco className="saco-cara-fondo" />
            <Estampa />
            <span className="stencil portada-marca" aria-hidden="true">
              Altura
            </span>
            <h1 className="portada-titulo">
              Café de especialidad con la ficha completa de cada lote
            </h1>
            <dl className="portada-datos dato">
              <div>
                <dt>Lote</dt>
                <dd>ALT-07</dd>
              </div>
              <div>
                <dt>Origen</dt>
                <dd>Guji, Etiopía</dd>
              </div>
              <div>
                <dt>Altitud</dt>
                <dd>2.150 msnm</dd>
              </div>
              <div>
                <dt>Proceso</dt>
                <dd>Lavado</dd>
              </div>
              <div>
                <dt>Notas</dt>
                <dd>Jazmín, durazno</dd>
              </div>
            </dl>
            <div className="portada-ctas">
              <a className="escanear-cta" href="#tu-cafe">
                <svg viewBox="0 0 48 48" aria-hidden="true" className="escanear-icono">
                  <path d="M6 16v-6a4 4 0 0 1 4-4h6M32 6h6a4 4 0 0 1 4 4v6M42 32v6a4 4 0 0 1-4 4h-6M16 42h-6a4 4 0 0 1-4-4v-6" />
                  <rect x="14" y="17" width="20" height="16" rx="2" />
                  <circle cx="24" cy="25" r="4.5" />
                  <path d="M19 17l2-3h6l2 3" />
                  <path className="escanear-barrido" d="M8 24h32" />
                </svg>
                <span className="escanear-texto">
                  <span className="stencil">Escanea tu café</span>
                  <span className="dato">Foto del paquete → tu receta</span>
                </span>
                <span className="escanear-flecha" aria-hidden="true">→</span>
              </a>
              <a className="escanear-cta ruta-cta" href="#ruta" data-enfocar="ruta">
                <svg viewBox="0 0 48 48" aria-hidden="true" className="escanear-icono">
                  <path d="M24 42s12-10.6 12-20.5a12 12 0 1 0-24 0C12 31.4 24 42 24 42z" />
                  <circle cx="24" cy="21" r="4.5" />
                  <path className="ruta-trazo" d="M6 44c6-4 10 2 16-2" />
                </svg>
                <span className="escanear-texto">
                  <span className="stencil">Ruta del café</span>
                  <span className="dato">Cafeterías de especialidad donde estés</span>
                </span>
                <span className="escanear-flecha" aria-hidden="true">→</span>
              </a>
              <a className="escanear-cta barista-cta" href="#barista" data-enfocar="pregunta">
                <svg viewBox="0 0 48 48" aria-hidden="true" className="escanear-icono">
                  <path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" />
                  <circle className="barista-punto" cx="16" cy="21.5" r="2.2" />
                  <circle className="barista-punto" cx="24" cy="21.5" r="2.2" />
                  <circle className="barista-punto" cx="32" cy="21.5" r="2.2" />
                </svg>
                <span className="escanear-texto">
                  <span className="stencil">Pregúntale al barista</span>
                  <span className="dato">Recomendaciones y dudas al instante</span>
                </span>
                <span className="escanear-flecha" aria-hidden="true">→</span>
              </a>
            </div>
            <div className="portada-acciones">
              <a className="sello" data-lleno="true" href="#historia">
                Seguir el lote
              </a>
              <a className="sello" href="#carta">
                Ver la carta
              </a>
            </div>
            <ContadorVivo />
          </div>
        </header>

        <Historia />
        <MapaAltura />
        <Carta />
        <ArmaTuLote />
        <Laboratorio />
        <ComoEstaHecho />
      </main>

      <footer className="pie">
        <svg className="pie-sello" viewBox="0 0 420 420" aria-hidden="true">
          <defs>
            <filter id="sello-pie">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="21" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.4" />
              <feComposite in="SourceGraphic" operator="in" />
            </filter>
            <path id="arco-sello" d="M210 210 m-160 0 a160 160 0 1 1 320 0 a160 160 0 1 1 -320 0" />
          </defs>
          <g filter="url(#sello-pie)" fill="none" stroke="currentColor">
            <circle cx="210" cy="210" r="196" strokeWidth="10" />
            <circle cx="210" cy="210" r="132" strokeWidth="4" strokeDasharray="8 7" />
            <text className="stencil" fontSize="30" fill="currentColor" stroke="none" letterSpacing="3">
              <textPath href="#arco-sello" startOffset="0">
                ALTURA · LOTE DESPACHADO · NERDEARLA 2026 · CIUDAD CULTURAL KONEX ·
              </textPath>
            </text>
            <text x="210" y="196" textAnchor="middle" className="stencil" fontSize="74" fill="currentColor" stroke="none">
              ALT-07
            </text>
            <text x="210" y="252" textAnchor="middle" className="dato" fontSize="30" fill="currentColor" stroke="none">
              22–26 SEPT
            </text>
          </g>
        </svg>
        <div className="pie-texto">
          <span className="stencil pie-marca">Altura</span>
          <p>
            Tostadería ficticia creada para Nerdearla 2026. Los lotes son de
            muestra. Hecho con Next.js sobre Webflow Cloud, con la carta en el
            CMS de Webflow.
          </p>
          <p className="dato pie-links">
            <a href="#historia">Historia</a> · <a href="#carta">Carta</a> · <a href="#pedido">Tu café</a> ·{" "}
            <a href="https://github.com/labspanchero/altura-cafe">Código</a>
          </p>
        </div>
      </footer>
    </CartaProvider>
  );
}
