// Trama de arpillera generada una vez: hilos irregulares, fibras y relieve.
let cache = "";

export function texturaArpillera() {
  if (cache) return cache;
  const T = 192;
  const cv = document.createElement("canvas");
  cv.width = cv.height = T;
  const g = cv.getContext("2d");
  if (!g) return "";
  let sem = 11;
  const r = () => ((sem = (sem * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#6e4f25";
  g.fillRect(0, 0, T, T);
  const paso = 8;
  const n = T / paso;
  const tonos = Array.from({ length: n }, () => 150 + r() * 40);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const encima = (i + j) % 2 === 0;
      const t = (encima ? tonos[j] : tonos[i]) + (r() - 0.5) * 18;
      const x = i * paso;
      const y = j * paso;
      const grad = encima ? g.createLinearGradient(x, y, x, y + paso) : g.createLinearGradient(x, y, x + paso, y);
      grad.addColorStop(0, `rgb(${t * 0.78},${t * 0.58},${t * 0.33})`);
      grad.addColorStop(0.5, `rgb(${t * 1.02},${t * 0.78},${t * 0.47})`);
      grad.addColorStop(1, `rgb(${t * 0.7},${t * 0.51},${t * 0.29})`);
      g.fillStyle = grad;
      const grosor = paso - 1.4 - r() * 1.2;
      if (encima) g.fillRect(x + 0.4, y + (paso - grosor) / 2, paso - 0.8, grosor);
      else g.fillRect(x + (paso - grosor) / 2, y + 0.4, grosor, paso - 0.8);
    }
  }
  g.lineWidth = 0.6;
  for (let k = 0; k < 260; k++) {
    const x = r() * T;
    const y = r() * T;
    const a = r() * Math.PI;
    const l = 3 + r() * 9;
    g.strokeStyle = r() < 0.6 ? "rgba(235,200,140,0.35)" : "rgba(60,38,14,0.35)";
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  cache = cv.toDataURL("image/png");
  return cache;
}

