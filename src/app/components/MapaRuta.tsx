"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as MapaL, Marker } from "leaflet";
import { mapsParada, type Parada } from "@/lib/ruta";

// Mapa de la ruta: Leaflet + teselas de OpenStreetMap (sin clave; uso bajo con atribución:
// https://operations.osmfoundation.org/policies/tiles/).
// El trazo une las paradas en orden; el recorrido exacto a pie lo da Google Maps.
export default function MapaRuta({ paradas, ciudad, activa, alElegir }: { paradas: Parada[]; ciudad: string; activa: number | null; alElegir: (i: number) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaL | null>(null);
  const marcas = useRef<Map<number, Marker>>(new Map());
  const elegir = useRef(alElegir);
  useEffect(() => {
    elegir.current = alElegir;
  }, [alElegir]);

  useEffect(() => {
    let vivo = true;
    const lista = marcas.current;
    (async () => {
      const L = (await import("leaflet")).default;
      if (!vivo || !caja.current) return;
      const m = L.map(caja.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      mapa.current = m;
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores de OpenStreetMap</a>',
      }).addTo(m);

      const puntos: [number, number][] = [];
      const indices: number[] = [];
      paradas.forEach((p, i) => {
        if (p.lat === undefined || p.lon === undefined) return;
        puntos.push([p.lat, p.lon]);
        indices.push(i);
        const icono = L.divIcon({ className: "mapa-ruta-marca", html: `<span class="stencil">${i + 1}</span>`, iconSize: [40, 40], iconAnchor: [20, 20] });
        const marca = L.marker([p.lat, p.lon], { icon: icono, title: p.nombre, keyboard: true }).addTo(m);
        const globo = document.createElement("div");
        globo.className = "mapa-ruta-globo";
        const h = document.createElement("strong");
        h.textContent = p.nombre;
        const d = document.createElement("span");
        d.textContent = p.direccion;
        const a = document.createElement("a");
        a.href = mapsParada(p, ciudad);
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "Cómo llegar";
        globo.append(h, d, a);
        marca.bindPopup(globo, { closeButton: false, offset: [0, -14] });
        marca.on("click", () => elegir.current(i));
        lista.set(i, marca);
      });
      if (puntos.length > 1) {
        m.fitBounds(L.latLngBounds(puntos), { padding: [48, 48], maxZoom: 16 });
        const linea = L.polyline([puntos[0]], { color: "#1c1710", weight: 4, dashArray: "2 10", lineCap: "round", className: "mapa-ruta-trazo" }).addTo(m);
        // La ruta se dibuja de parada en parada, como si alguien la caminara.
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const tramo = 700;
        const inicio = performance.now() + 250;
        const mostrar = (i: number) => lista.get(indices[i])?.getElement()?.setAttribute("data-visible", "true");
        mostrar(0);
        if (quieto) {
          linea.setLatLngs(puntos);
          puntos.forEach((_, i) => mostrar(i));
        } else {
          const paso = (t: number) => {
            if (!vivo) return;
            const avance = Math.max(0, (t - inicio) / tramo);
            const n = Math.min(puntos.length - 1, Math.floor(avance));
            const f = Math.min(1, avance - n);
            const hechos = puntos.slice(0, n + 1);
            if (n < puntos.length - 1) {
              const [a, b] = [puntos[n], puntos[n + 1]];
              hechos.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
            }
            linea.setLatLngs(hechos);
            for (let i = 1; i <= n; i++) mostrar(i);
            if (avance < puntos.length - 1) requestAnimationFrame(paso);
            else puntos.forEach((_, i) => mostrar(i));
          };
          requestAnimationFrame(paso);
        }
      } else if (puntos.length === 1) {
        m.setView(puntos[0], 16);
        lista.forEach((mk) => mk.getElement()?.setAttribute("data-visible", "true"));
      }
    })();
    return () => {
      vivo = false;
      lista.clear();
      mapa.current?.remove();
      mapa.current = null;
    };
  }, [paradas, ciudad]);

  useEffect(() => {
    if (activa === null) return;
    const marca = marcas.current.get(activa);
    if (!marca || !mapa.current) return;
    mapa.current.flyTo(marca.getLatLng(), Math.max(mapa.current.getZoom(), 16), { duration: 0.6 });
    marca.openPopup();
  }, [activa]);

  return <div ref={caja} className="mapa-ruta" role="region" aria-label={`Mapa de la ruta del café en ${ciudad}`} />;
}
