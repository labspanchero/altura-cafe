import * as THREE from "three";

// Grano de café: elipsoide con una cara plana y la hendidura en S.
export function crearGeometriaGrano(detalle = 48) {
  const geo = new THREE.SphereGeometry(1, detalle, Math.round(detalle * 0.7));
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    let x = v.x * 0.74;
    let y = v.y * 0.52;
    const z = v.z * 1.0;
    if (y < 0) y *= 0.42;
    // Hendidura sobre la cara plana, levemente curva.
    const eje = 0.06 * Math.sin(z * 2.4);
    const d = x - eje;
    const surco = Math.exp(-(d * d) / 0.004);
    if (v.y < 0.05) y += surco * 0.32 * (1 - Math.abs(z) ** 3);
    // Irregularidad orgánica.
    x += 0.015 * Math.sin(z * 9 + v.y * 5);
    pos.setXYZ(i, x, y, z);
  }
  geo.rotateY(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

export const TUESTES = [
  { nombre: "Verde", temp: "25 °C", color: "#8fa35c", rugosidad: 0.75, escala: 1 },
  { nombre: "Secado", temp: "160 °C", color: "#c9a15c", rugosidad: 0.7, escala: 1.03 },
  { nombre: "Primer crack", temp: "196 °C", color: "#9a5f2c", rugosidad: 0.6, escala: 1.12 },
  { nombre: "Medio", temp: "210 °C", color: "#6b3a1c", rugosidad: 0.5, escala: 1.16 },
  { nombre: "Oscuro", temp: "225 °C", color: "#2e170b", rugosidad: 0.28, escala: 1.2 },
];

export function colorTueste(t: number, destino: THREE.Color) {
  const i = Math.min(TUESTES.length - 2, Math.floor(t));
  const f = Math.min(1, t - i);
  const a = new THREE.Color(TUESTES[i].color);
  const b = new THREE.Color(TUESTES[i + 1].color);
  destino.copy(a).lerp(b, f);
  return {
    rugosidad: THREE.MathUtils.lerp(TUESTES[i].rugosidad, TUESTES[i + 1].rugosidad, f),
    escala: THREE.MathUtils.lerp(TUESTES[i].escala, TUESTES[i + 1].escala, f),
  };
}

export function prefiereMenosMovimiento() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function luces(escena: THREE.Scene) {
  escena.add(new THREE.HemisphereLight("#fff2d8", "#3a260c", 1.6));
  const sol = new THREE.DirectionalLight("#ffe7c2", 2.6);
  sol.position.set(3, 5, 4);
  escena.add(sol);
  const rim = new THREE.DirectionalLight("#9fb6ff", 0.8);
  rim.position.set(-4, -2, -3);
  escena.add(rim);
}
