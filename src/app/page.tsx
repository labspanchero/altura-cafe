import Carta from "./components/Carta";
import Historia from "./components/Historia";
import Pedido from "./components/Pedido";
import Lluvia from "./components/Lluvia";
import ContadorVivo from "./components/ContadorVivo";
import { CartaProvider } from "./components/CartaContexto";
import { obtenerCarta } from "@/lib/carta";

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
  const { cafes, fuente } = await obtenerCarta();
  return (
    <CartaProvider cafes={cafes} fuente={fuente}>
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
            <a className="nav-link" href="#pedido">Tu café</a>
          </li>
          <li>
            <a className="nav-link" href="#barista">Barista</a>
          </li>
        </ul>
      </nav>

      <main>
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
        <Pedido />
      </main>

      <footer className="pie">
        <span className="stencil">Altura</span>
        <p style={{ margin: 0, maxWidth: "60ch" }}>
          Tostadería ficticia creada para Nerdearla 2026. Los lotes son de
          muestra. Hecho con Next.js sobre Webflow Cloud.
        </p>
      </footer>
    </CartaProvider>
  );
}
