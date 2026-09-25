import type { Parada, Ruta } from "./ruta";
import { fondoYute, fuentes, qr } from "./tarjeta";

// Tarjeta de la Ruta del café: croquis con las paradas, la lista y un QR que abre la ruta en Google Maps.
export async function tarjetaRuta(ruta: Ruta, paradas: Parada[]) {
  const W = 1080;
  const H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const { stencil, dato } = await fuentes();
  await fondoYute(g, W, H);
  const tinta = "#1c1710";
  const papel = "#efe4cf";
  g.strokeStyle = tinta;
  g.lineWidth = 10;
  g.strokeRect(60, 60, W - 120, H - 120);

  g.fillStyle = tinta;
  g.font = `700 44px ${dato}`;
  g.fillText("ALTURA · RUTA DEL CAFÉ", 110, 160);
  let tam = 130;
  const ciudad = ruta.ciudad.toUpperCase();
  g.font = `900 ${tam}px ${stencil}`;
  while (g.measureText(ciudad).width > W - 220 && tam > 60) {
    tam -= 6;
    g.font = `900 ${tam}px ${stencil}`;
  }
  g.fillText(ciudad, 106, 160 + tam);

  // Croquis: las paradas proyectadas en un recuadro de papel.
  const caja = { x: 110, y: 200 + tam + 20, w: W - 220, h: 470 };
  g.fillStyle = papel;
  g.fillRect(caja.x, caja.y, caja.w, caja.h);
  g.lineWidth = 5;
  g.strokeRect(caja.x, caja.y, caja.w, caja.h);
  const pts = paradas.map((p, i) => ({ p, i })).filter(({ p }) => p.lat !== undefined && p.lon !== undefined);
  if (pts.length) {
    const lats = pts.map(({ p }) => p.lat!);
    const lons = pts.map(({ p }) => p.lon!);
    const [la0, la1, lo0, lo1] = [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
    const k = Math.cos(((la0 + la1) / 2) * (Math.PI / 180));
    const ancho = Math.max((lo1 - lo0) * k, 1e-4);
    const alto = Math.max(la1 - la0, 1e-4);
    const m = 70;
    const esc = Math.min((caja.w - 2 * m) / ancho, (caja.h - 2 * m) / alto);
    const ox = caja.x + (caja.w - ancho * esc) / 2;
    const oy = caja.y + (caja.h - alto * esc) / 2;
    const xy = (p: Parada) => [ox + (p.lon! - lo0) * k * esc, oy + (la1 - p.lat!) * esc] as const;
    g.setLineDash([4, 18]);
    g.lineCap = "round";
    g.lineWidth = 8;
    g.beginPath();
    pts.forEach(({ p }, j) => (j ? g.lineTo(...xy(p)) : g.moveTo(...xy(p))));
    g.stroke();
    g.setLineDash([]);
    for (const { p, i } of pts) {
      const [x, y] = xy(p);
      g.fillStyle = tinta;
      g.beginPath();
      g.arc(x, y, 34, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = papel;
      g.lineWidth = 5;
      g.stroke();
      g.fillStyle = "#b08a52";
      g.font = `900 40px ${stencil}`;
      g.textAlign = "center";
      g.fillText(String(i + 1), x, y + 14);
      g.textAlign = "left";
    }
  }

  // Lista de paradas
  g.fillStyle = tinta;
  let y = caja.y + caja.h + 70;
  for (const [i, p] of paradas.slice(0, 6).entries()) {
    g.font = `900 40px ${stencil}`;
    g.fillText(`${i + 1}`, 112, y);
    g.font = `700 38px ${dato}`;
    let nombre = p.nombre.toUpperCase();
    while (g.measureText(nombre).width > 560 && nombre.length > 4) nombre = nombre.slice(0, -2);
    g.fillText(nombre === p.nombre.toUpperCase() ? nombre : `${nombre}…`, 160, y);
    y += 56;
  }

  try {
    const img = await qr(ruta.maps, 200);
    const qx = W - 110 - 224;
    const qy = caja.y + caja.h + 40;
    g.fillStyle = papel;
    g.fillRect(qx, qy, 224, 224);
    g.drawImage(img, qx + 12, qy + 12, 200, 200);
    g.fillStyle = tinta;
    g.font = `700 24px ${dato}`;
    g.fillText("ABRIR RUTA A PIE", qx + 8, qy + 256);
  } catch {
    // sin QR
  }

  g.font = `600 30px ${dato}`;
  g.fillText("ALTURA-CAFE.WEBFLOW.IO · NERDEARLA 2026", 110, H - 100);
  return new Promise<Blob | null>((ok) => cv.toBlob(ok, "image/png"));
}
