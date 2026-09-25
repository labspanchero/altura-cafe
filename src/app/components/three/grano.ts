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
  { nombre: "Verde", temp: "25 °C", color: "#a3ab7c", rugosidad: 0.85, escala: 1 },
  { nombre: "Secado", temp: "160 °C", color: "#cfae72", rugosidad: 0.78, escala: 1.03 },
  { nombre: "Primer crack", temp: "196 °C", color: "#9a5f2c", rugosidad: 0.6, escala: 1.12 },
  { nombre: "Medio", temp: "210 °C", color: "#6b3a1c", rugosidad: 0.5, escala: 1.16 },
  { nombre: "Oscuro", temp: "225 °C", color: "#2e170b", rugosidad: 0.32, escala: 1.2 },
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

// Texturas procedurales del grano (se generan una vez y se comparten).
// El UV de la esfera: u da la vuelta, v va del polo superior (cara curva)
// al inferior (cara plana). La hendidura cae en u=0.25 y u=0.75 de la mitad
// inferior, que es donde la geometría la hunde.
type TexturasGrano = { mapa: THREE.CanvasTexture; relieve: THREE.CanvasTexture; rugosidad: THREE.CanvasTexture };
let cache: TexturasGrano | null = null;

export function texturasGrano(): TexturasGrano {
  if (cache) return cache;
  const W = 1024;
  const H = 512;
  let sem = 29;
  const r = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);

  const lienzo = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return [c, c.getContext("2d")!] as const;
  };

  // Ruido suave por capas: grillas chicas de ruido escaladas con suavizado.
  const capaRuido = (g: CanvasRenderingContext2D, celdas: number, alfa: number, claro: number, oscuro: number) => {
    const c = document.createElement("canvas");
    c.width = celdas * 2;
    c.height = celdas;
    const cg = c.getContext("2d")!;
    for (let x = 0; x < c.width; x++)
      for (let y = 0; y < c.height; y++) {
        const t = r();
        const v = Math.round(oscuro + (claro - oscuro) * t);
        cg.fillStyle = `rgb(${v},${v},${v})`;
        cg.fillRect(x, y, 1, 1);
      }
    g.globalAlpha = alfa;
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";
    g.drawImage(c, 0, 0, W, H);
    g.globalAlpha = 1;
  };

  const surco = (g: CanvasRenderingContext2D, u: number, ancho: number, estilo: string) => {
    g.strokeStyle = estilo;
    g.lineCap = "round";
    for (let pasada = 0; pasada < 3; pasada++) {
      g.lineWidth = ancho * (1 - pasada * 0.3);
      g.beginPath();
      for (let y = H * 0.56; y <= H * 0.97; y += 4) {
        const t = (y - H * 0.56) / (H * 0.41);
        const x = u * W + Math.sin(t * Math.PI * 1.6) * 7 + (r() - 0.5) * 3;
        if (y === H * 0.56) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }
  };

  const arrugas = (g: CanvasRenderingContext2D, n: number, estilo: () => string, grosor: number) => {
    for (let i = 0; i < n; i++) {
      const x = r() * W;
      const y = H * (0.14 + r() * 0.72);
      const largo = 8 + r() * 26;
      const ang = Math.PI / 2 + (r() - 0.5) * 1.2;
      g.strokeStyle = estilo();
      g.lineWidth = grosor * (0.5 + r());
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(
        x + Math.cos(ang) * largo * 0.5 + (r() - 0.5) * 8,
        y + Math.sin(ang) * largo * 0.5,
        x + Math.cos(ang) * largo,
        y + Math.sin(ang) * largo,
      );
      g.stroke();
    }
  };

  // Color: luminancia que multiplica el color del tueste.
  const [cMapa, gMapa] = lienzo();
  gMapa.fillStyle = "#d9d9d9";
  gMapa.fillRect(0, 0, W, H);
  capaRuido(gMapa, 6, 0.55, 255, 170);
  capaRuido(gMapa, 24, 0.45, 250, 185);
  capaRuido(gMapa, 96, 0.3, 245, 200);
  arrugas(gMapa, 900, () => `rgba(70,70,70,${0.08 + r() * 0.12})`, 1.4);
  for (let i = 0; i < 1600; i++) {
    gMapa.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.18)" : "rgba(60,60,60,0.18)";
    gMapa.fillRect(r() * W, r() * H, 1.5, 1.5);
  }
  // Película plateada en la hendidura: más clara que el cuerpo.
  surco(gMapa, 0.25, 10, "rgba(255,248,232,0.9)");
  surco(gMapa, 0.75, 10, "rgba(255,248,232,0.9)");

  // Relieve: arrugas hundidas y el surco profundo.
  const [cRel, gRel] = lienzo();
  gRel.fillStyle = "#808080";
  gRel.fillRect(0, 0, W, H);
  capaRuido(gRel, 48, 0.5, 170, 90);
  arrugas(gRel, 1400, () => `rgba(30,30,30,${0.25 + r() * 0.3})`, 1.8);
  arrugas(gRel, 500, () => `rgba(230,230,230,${0.15 + r() * 0.2})`, 1.2);
  surco(gRel, 0.25, 14, "rgba(10,10,10,0.8)");
  surco(gRel, 0.75, 14, "rgba(10,10,10,0.8)");

  // Rugosidad: el surco es más mate; el cuerpo varía apenas.
  const [cRug, gRug] = lienzo();
  gRug.fillStyle = "#c8c8c8";
  gRug.fillRect(0, 0, W, H);
  capaRuido(gRug, 20, 0.5, 255, 150);
  surco(gRug, 0.25, 12, "rgba(255,255,255,1)");
  surco(gRug, 0.75, 12, "rgba(255,255,255,1)");

  // Los polos de la esfera concentran el UV: se neutralizan para evitar la "estrella".
  const polos = (g: CanvasRenderingContext2D, neutro: string) => {
    for (const [y0, y1] of [
      [0, H * 0.16],
      [H, H * 0.84],
    ]) {
      const gr = g.createLinearGradient(0, y0, 0, y1);
      gr.addColorStop(0, neutro);
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, Math.min(y0, y1), W, Math.abs(y1 - y0));
    }
  };
  polos(gMapa, "#dcdcdc");
  polos(gRel, "#808080");
  polos(gRug, "#c8c8c8");

  const mapa = new THREE.CanvasTexture(cMapa);
  mapa.colorSpace = THREE.SRGBColorSpace;
  mapa.anisotropy = 4;
  const relieve = new THREE.CanvasTexture(cRel);
  const rugosidad = new THREE.CanvasTexture(cRug);
  cache = { mapa, relieve, rugosidad };
  return cache;
}

// Material de grano según tueste (0 verde … 4 oscuro).
export function materialGrano(t: number) {
  const tex = texturasGrano();
  const color = new THREE.Color();
  const { rugosidad } = colorTueste(t, color);
  const oscuro = Math.max(0, (t - 2.6) / 1.4);
  return new THREE.MeshPhysicalMaterial({
    color,
    map: tex.mapa,
    bumpMap: tex.relieve,
    bumpScale: 2.2,
    roughnessMap: tex.rugosidad,
    roughness: rugosidad,
    clearcoat: oscuro * 0.55,
    clearcoatRoughness: 0.35,
    sheen: t < 1 ? 0.5 : 0,
    sheenColor: new THREE.Color("#e9ecd8"),
    sheenRoughness: 0.8,
  });
}

export function ajustarMaterialGrano(m: THREE.MeshPhysicalMaterial, t: number) {
  const { rugosidad } = colorTueste(t, m.color);
  m.roughness = rugosidad;
  m.clearcoat = Math.max(0, (t - 2.6) / 1.4) * 0.55;
  m.sheen = Math.max(0, 1 - t) * 0.5;
}
