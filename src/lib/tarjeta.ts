import arpillera from "@/app/arpillera.png";

// Piezas comunes de las tarjetas para compartir (se dibujan en el navegador).
export async function fuentes() {
  await document.fonts.ready;
  const f = (sel: string) => {
    const el = document.querySelector(sel);
    return el ? getComputedStyle(el).fontFamily : "sans-serif";
  };
  return { stencil: f(".stencil"), dato: f(".dato") };
}

// Fondo de yute con la misma trama de la página.
export async function fondoYute(g: CanvasRenderingContext2D, W: number, H: number) {
  g.fillStyle = "#b08a52";
  g.fillRect(0, 0, W, H);
  const img = new Image();
  // En Webflow Cloud los archivos se sirven desde otro dominio (con CORS): sin esto el lienzo queda bloqueado.
  img.crossOrigin = "anonymous";
  img.src = arpillera.src;
  await img.decode().catch(() => {});
  const pat = img.naturalWidth ? g.createPattern(img, "repeat") : null;
  if (pat) {
    g.globalAlpha = 0.9;
    g.fillStyle = pat;
    g.fillRect(0, 0, W, H);
    g.globalAlpha = 1;
  }
}

export async function qr(url: string, ancho: number) {
  const QR = (await import("qrcode")).default;
  const img = new Image();
  img.src = await QR.toDataURL(url, { margin: 1, width: ancho, color: { dark: "#1c1710", light: "#efe4cf" }, errorCorrectionLevel: "M" });
  await img.decode();
  return img;
}

// Comparte la imagen con el menú del teléfono o, si no se puede, la descarga.
export async function compartirImagen(blob: Blob, nombre: string, texto: string) {
  const archivo = new File([blob], nombre, { type: "image/png" });
  try {
    if (navigator.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo], text: texto, url: location.href });
      return;
    }
  } catch {
    // compartir cancelado: se descarga
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
