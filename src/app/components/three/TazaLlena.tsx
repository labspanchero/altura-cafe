"use client";

import { useEffect, useRef, useState } from "react";

// Taza 3D que se llena con el scroll. El color del café sigue el tueste
// elegido en el tostador (evento "altura:tueste").
export default function TazaLlena() {
  const ref = useRef<HTMLDivElement>(null);
  const [nivel, setNivel] = useState(0);

  useEffect(() => {
    const cont = ref.current;
    if (!cont) return;
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      const THREE = await import("three");
      const { luces, colorTueste, prefiereMenosMovimiento } = await import("./grano");
      if (cancelado) return;

      const quieto = prefiereMenosMovimiento();
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      cont.appendChild(renderer.domElement);

      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      camara.position.set(0, 3.5, 3.4);
      camara.lookAt(0, 0.5, 0);
      luces(escena);

      // Cerámica de gres artesanal: esmalte crema moteado, base de barro
      // sin esmaltar con línea de inmersión irregular y el logo como calca.
      const W = 4096;
      const H = 2048;
      const lienzoTex = document.createElement("canvas");
      lienzoTex.width = W;
      lienzoTex.height = H;
      const ctx = lienzoTex.getContext("2d")!;
      const lienzoRug = document.createElement("canvas");
      lienzoRug.width = 1024;
      lienzoRug.height = 512;
      const rug = lienzoRug.getContext("2d")!;
      let semilla = 7;
      const azar = () => ((semilla = (semilla * 16807) % 2147483647) / 2147483647);

      // v de la geometría → y del lienzo (flipY): la línea de inmersión va en v≈0.2
      const yDe = (v: number) => (1 - v) * H;
      ctx.fillStyle = "#ebe1cf";
      ctx.fillRect(0, 0, W, H);
      rug.fillStyle = "#8c8c8c";
      rug.fillRect(0, 0, 1024, 512);
      // base de barro con borde ondulado
      ctx.fillStyle = "#b98a5c";
      rug.fillStyle = "#e6e6e6";
      ctx.beginPath();
      rug.beginPath();
      ctx.moveTo(0, H);
      rug.moveTo(0, 512);
      for (let x = 0; x <= W; x += 16) {
        const v = 0.205 + 0.012 * Math.sin(x / 190) + 0.007 * Math.sin(x / 57 + 1.3) + (azar() - 0.5) * 0.002;
        ctx.lineTo(x, yDe(v));
        rug.lineTo((x / W) * 1024, (1 - v) * 512);
      }
      ctx.lineTo(W, H);
      rug.lineTo(1024, 512);
      ctx.fill();
      rug.fill();
      // interior y fondo esmaltados (v>0.5 es el interior del perfil)
      // moteado de hierro sobre todo el esmalte
      for (let i = 0; i < 26000; i++) {
        const x = azar() * W;
        const y = azar() * yDe(0.2);
        const r = azar() < 0.9 ? 1 + azar() * 2.2 : 3 + azar() * 3;
        ctx.fillStyle = `rgba(${60 + azar() * 40},${40 + azar() * 25},${25 + azar() * 15},${0.35 + azar() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // grano del barro
      for (let i = 0; i < 9000; i++) {
        const x = azar() * W;
        const y = yDe(0.2) + azar() * (H - yDe(0.2));
        ctx.fillStyle = azar() < 0.5 ? "rgba(90,58,30,0.35)" : "rgba(240,210,170,0.25)";
        ctx.fillRect(x, y, 2 + azar() * 3, 2 + azar() * 3);
      }
      // esmalte más grueso cerca de la inmersión
      const g = ctx.createLinearGradient(0, yDe(0.3), 0, yDe(0.21));
      g.addColorStop(0, "rgba(214,200,176,0)");
      g.addColorStop(1, "rgba(200,182,152,0.55)");
      ctx.fillStyle = g;
      ctx.fillRect(0, yDe(0.3), W, yDe(0.21) - yDe(0.3));

      const texEsmalte = new THREE.CanvasTexture(lienzoTex);
      texEsmalte.colorSpace = THREE.SRGBColorSpace;
      texEsmalte.anisotropy = 8;
      const texRug = new THREE.CanvasTexture(lienzoRug);
      const ceramica = new THREE.MeshStandardMaterial({ map: texEsmalte, roughnessMap: texRug, roughness: 1, metalness: 0 });

      const logo = new Image();
      logo.onload = () => {
        const alto = (0.472 - 0.222) * H;
        const ancho = 0.081 * W;
        ctx.globalAlpha = 0.96;
        ctx.drawImage(logo, 0.5 * W - ancho / 2, yDe(0.472), ancho, alto);
        ctx.globalAlpha = 1;
        texEsmalte.needsUpdate = true;
      };
      logo.src = new URL("nerd-logo.png", document.baseURI).href;

      // Material liso moteado para asa y plato (sin el logo).
      const lienzoLiso = document.createElement("canvas");
      lienzoLiso.width = lienzoLiso.height = 512;
      const liso = lienzoLiso.getContext("2d")!;
      liso.fillStyle = "#ebe1cf";
      liso.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 1400; i++) {
        liso.fillStyle = `rgba(70,45,28,${0.3 + azar() * 0.5})`;
        liso.beginPath();
        liso.arc(azar() * 512, azar() * 512, 0.6 + azar() * 1.4, 0, Math.PI * 2);
        liso.fill();
      }
      const texLiso = new THREE.CanvasTexture(lienzoLiso);
      texLiso.colorSpace = THREE.SRGBColorSpace;
      texLiso.wrapS = texLiso.wrapT = THREE.RepeatWrapping;
      texLiso.repeat.set(3, 3);
      const loza = new THREE.MeshStandardMaterial({ map: texLiso, roughness: 0.55 });
      const barro = new THREE.MeshStandardMaterial({ color: "#8f6440", roughness: 0.9 });

      // Perfil de la taza (radio, altura) girado sobre el eje Y. La pared
      // exterior tiene puntos equiespaciados para que el logo no se deforme.
      const perfil = [
        [0, 0],
        [0.62, 0],
        [0.7, 0.05],
        [0.78, 0.3],
        [0.8125, 0.45],
        [0.845, 0.6],
        [0.8775, 0.75],
        [0.91, 0.9],
        [0.96, 1.02],
        [1.0, 1.12],
        [0.95, 1.12],
        [0.88, 0.92],
        [0.73, 0.34],
        [0.66, 0.1],
        [0.3, 0.1],
        [0, 0.1],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const geoTaza = new THREE.LatheGeometry(perfil, 96);
      // Irregularidad de torno: la pared ondula apenas.
      const pos = geoTaza.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const th = Math.atan2(z, x);
        const f = 1 + 0.012 * Math.sin(3 * th + y * 3) + 0.006 * Math.sin(7 * th + 1.1);
        pos.setXYZ(i, x * f, y, z * f);
      }
      geoTaza.computeVertexNormals();
      const taza = new THREE.Mesh(geoTaza, ceramica);
      // El esmalte se corta en el borde y deja ver el barro.
      const borde = new THREE.Mesh(new THREE.TorusGeometry(0.975, 0.024, 8, 96), barro);
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 1.125;
      const asa = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.075, 18, 40, Math.PI * 1.2), loza);
      asa.position.set(0.98, 0.64, 0);
      asa.rotation.z = -Math.PI * 0.6;
      const plato = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.5, 0.09, 96), loza);
      plato.position.y = -0.045;
      const filete = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.026, 8, 96), barro);
      filete.rotation.x = Math.PI / 2;

      // Café: un tronco de cono que crece hacia arriba, con la crema encima.
      const cafeMat = new THREE.MeshStandardMaterial({ color: "#4a2410", roughness: 0.15 });
      const cremaMat = new THREE.MeshStandardMaterial({ color: "#c98a55", roughness: 0.6 });
      const cafe = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64, 1, true), cafeMat);
      const crema = new THREE.Mesh(new THREE.CircleGeometry(1, 64), cremaMat);
      crema.rotation.x = -Math.PI / 2;

      const grupo = new THREE.Group();
      grupo.add(taza, borde, asa, plato, filete, cafe, crema);
      const giroBase = Math.PI;
      let reloj2 = 0;
      grupo.rotation.y = giroBase;
      escena.add(grupo);

      // Latte art realista. Dos capas: la crema (textura que sigue el tueste)
      // y la leche (rosetta orgánica con microespuma) que aparece al final.
      let semL = 97;
      const azarL = () => ((semL = (semL * 16807) % 2147483647) / 2147483647);
      const S = 1024;
      const C = S / 2;

      const lienzoCrema = document.createElement("canvas");
      lienzoCrema.width = lienzoCrema.height = S;
      const cremaCtx = lienzoCrema.getContext("2d")!;
      const puntosCrema = Array.from({ length: 2600 }, () => {
        const a = azarL() * Math.PI * 2;
        const r = Math.sqrt(azarL()) * C * 0.98;
        return { x: C + Math.cos(a) * r, y: C + Math.sin(a) * r, t: azarL(), s: azarL() };
      });
      const hex = (c: InstanceType<typeof THREE.Color>, k = 1) =>
        `rgb(${Math.min(255, c.r * 255 * k) | 0},${Math.min(255, c.g * 255 * k) | 0},${Math.min(255, c.b * 255 * k) | 0})`;
      const pintarCrema = (base: InstanceType<typeof THREE.Color>) => {
        const g = cremaCtx;
        // del borde oscuro (café que asoma) al centro acaramelado
        const rad = g.createRadialGradient(C, C * 1.05, C * 0.05, C, C, C);
        rad.addColorStop(0, hex(base, 1.55));
        rad.addColorStop(0.55, hex(base, 1.35));
        rad.addColorStop(0.86, hex(base, 1.0));
        rad.addColorStop(1, hex(base, 0.6));
        g.fillStyle = rad;
        g.fillRect(0, 0, S, S);
        // halo claro donde la leche se mezcla con la crema
        const halo = g.createRadialGradient(C, C * 1.02, C * 0.2, C, C * 1.02, C * 0.72);
        halo.addColorStop(0, "rgba(236,196,146,0.55)");
        halo.addColorStop(1, "rgba(236,196,146,0)");
        g.fillStyle = halo;
        g.fillRect(0, 0, S, S);
        // manchas atigradas y microburbujas
        for (const p of puntosCrema) {
          g.fillStyle = p.t < 0.5 ? `rgba(60,30,12,${0.05 + p.s * 0.1})` : `rgba(255,228,190,${0.05 + p.s * 0.12})`;
          g.beginPath();
          g.arc(p.x, p.y, 1 + p.s * (p.t < 0.15 ? 9 : 2.5), 0, Math.PI * 2);
          g.fill();
        }
        // brillo del borde del líquido contra la taza
        g.strokeStyle = "rgba(30,14,6,0.55)";
        g.lineWidth = 14;
        g.beginPath();
        g.arc(C, C, C - 7, 0, Math.PI * 2);
        g.stroke();
      };
      const texCrema = new THREE.CanvasTexture(lienzoCrema);
      texCrema.colorSpace = THREE.SRGBColorSpace;
      cremaMat.map = texCrema;
      cremaMat.color.set("#ffffff");
      cremaMat.roughness = 0.42;

      const lienzoArte = document.createElement("canvas");
      lienzoArte.width = lienzoArte.height = S;
      {
        const g = lienzoArte.getContext("2d")!;
        const leche = "rgb(255,249,236)";
        const temblor = () => (azarL() - 0.5) * 6;
        // corazón: dos lóbulos redondeados, punta hacia quien mira y una
        // colita fina donde se cortó el vertido. Levemente asimétrico.
        const cy = C * 1.02;
        const R = C * 0.56;
        const corazon = (f: number) => {
          g.beginPath();
          g.moveTo(C + 4, cy - R * 0.42 * f);
          g.bezierCurveTo(C + R * 0.35 * f, cy - R * 1.02 * f, C + R * 1.12 * f, cy - R * 0.72 * f, C + R * 0.98 * f, cy - R * 0.05 * f);
          g.bezierCurveTo(C + R * 0.88 * f, cy + R * 0.42 * f, C + R * 0.36 * f, cy + R * 0.78 * f, C + 2, cy + R * 1.02 * f);
          g.bezierCurveTo(C - R * 0.34 * f, cy + R * 0.8 * f, C - R * 0.92 * f, cy + R * 0.44 * f, C - R * 1.0 * f, cy - R * 0.06 * f);
          g.bezierCurveTo(C - R * 1.1 * f, cy - R * 0.74 * f, C - R * 0.33 * f, cy - R * 1.0 * f, C + 4, cy - R * 0.42 * f);
          g.closePath();
        };
        g.fillStyle = leche;
        for (const [f, a] of [
          [1.1, 0.12],
          [1.05, 0.28],
          [1, 1],
        ] as const) {
          g.globalAlpha = a;
          corazon(f);
          g.fill();
        }
        g.globalAlpha = 1;
        // anillo interior de crema: el borde del primer vertido
        g.strokeStyle = "rgba(205,160,112,0.1)";
        g.lineWidth = 26;
        corazon(0.7);
        g.stroke();
        // colita del corte, afinándose hacia el borde
        g.strokeStyle = leche;
        g.lineCap = "round";
        for (const [w, y0, y1] of [
          [7, cy + R * 0.95, cy + R * 1.18],
          [4, cy + R * 1.15, cy + R * 1.36],
          [2, cy + R * 1.33, cy + R * 1.48],
        ] as const) {
          g.lineWidth = w;
          g.beginPath();
          g.moveTo(C + 2, y0);
          g.lineTo(C + 3, y1);
          g.stroke();
        }
        // microespuma y velo marrón dentro de la leche
        g.globalCompositeOperation = "source-atop";
        for (let k = 0; k < 5000; k++) {
          g.fillStyle = azarL() < 0.55 ? `rgba(150,96,52,${azarL() * 0.06})` : `rgba(255,252,244,${azarL() * 0.3})`;
          g.fillRect(azarL() * S, azarL() * S, 1.5 + azarL() * 2, 1.5 + azarL() * 2);
        }
        const velo = g.createRadialGradient(C, C * 1.1, C * 0.1, C, C * 1.1, C * 0.9);
        velo.addColorStop(0, "rgba(180,120,70,0)");
        velo.addColorStop(1, "rgba(180,120,70,0.12)");
        g.fillStyle = velo;
        g.fillRect(0, 0, S, S);
        g.globalCompositeOperation = "source-over";
      }
      const texArte = new THREE.CanvasTexture(lienzoArte);
      texArte.colorSpace = THREE.SRGBColorSpace;
      texArte.anisotropy = 8;
      const arteMat = new THREE.MeshStandardMaterial({
        map: texArte,
        transparent: true,
        opacity: 0,
        roughness: 0.55,
        depthWrite: false,
      });
      const arte = new THREE.Mesh(new THREE.CircleGeometry(1, 64), arteMat);
      arte.rotation.x = -Math.PI / 2;
      arte.renderOrder = 2;
      escena.add(arte);
      let tuesteCrema = -1;

      let tueste = 1.6;
      const alTueste = (e: Event) => (tueste = (e as CustomEvent<number>).detail);
      window.addEventListener("altura:tueste", alTueste);

      const ajustar = () => {
        const w = cont.clientWidth;
        const h = cont.clientHeight;
        renderer.setSize(w, h, false);
        camara.aspect = w / h;
        camara.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(ajustar);
      ro.observe(cont);
      ajustar();

      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(cont);

      // Radio interior de la taza a una altura dada (interpolando el perfil).
      const radioEn = (y: number) => {
        const interior = [
          [0.1, 0.66],
          [0.34, 0.73],
          [0.92, 0.88],
          [1.1, 0.94],
        ];
        for (let i = 0; i < interior.length - 1; i++) {
          const [y0, r0] = interior[i];
          const [y1, r1] = interior[i + 1];
          if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
        }
        return 0.95;
      };

      const color = new THREE.Color();
      let lleno = 0;
      let altoGeo = -1;
      let ultimoNivel = -1;
      let raf = 0;
      const reloj = new THREE.Clock();
      const cuadro = () => {
        raf = requestAnimationFrame(cuadro);
        const dt = Math.min(reloj.getDelta(), 0.05);
        if (!visible || document.hidden) return;
        const r = cont.getBoundingClientRect();
        const objetivo = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.75)));
        lleno += (objetivo - lleno) * (quieto ? 1 : 0.08);
        const alto = 0.1 + lleno * 0.88;
        const rSup = radioEn(alto);
        cafe.scale.set(1, Math.max(0.001, alto - 0.1), 1);
        cafe.position.y = 0.1 + (alto - 0.1) / 2;
        if (Math.abs(alto - altoGeo) > 0.003) {
          altoGeo = alto;
          cafe.geometry.dispose();
          cafe.geometry = new THREE.CylinderGeometry(rSup, 0.66, 1, 48, 1, true);
        }
        crema.position.y = alto;
        crema.scale.setScalar(rSup);
        arte.position.y = alto + 0.004;
        arte.scale.setScalar(rSup * 0.94);
        const aparecer = Math.min(1, Math.max(0, (lleno - 0.86) / 0.12));
        arteMat.opacity = aparecer;
        arte.visible = aparecer > 0.01;
        cafe.visible = crema.visible = lleno > 0.01;

        colorTueste(tueste, color);
        cafeMat.color.copy(color).multiplyScalar(0.45);
        if (Math.abs(tueste - tuesteCrema) > 0.08) {
          tuesteCrema = tueste;
          pintarCrema(color.clone().lerp(new THREE.Color("#a5663a"), 0.7));
          texCrema.needsUpdate = true;
        }
        if (!quieto) {
          reloj2 += dt;
          grupo.rotation.y = giroBase + Math.sin(reloj2 * 0.45) * 0.45;
        }

        const n = Math.round(lleno * 100);
        if (n !== ultimoNivel) {
          ultimoNivel = n;
          setNivel(n);
        }
        renderer.render(escena, camara);
      };
      cuadro();

      limpiar = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("altura:tueste", alTueste);
        ro.disconnect();
        io.disconnect();
        escena.traverse((o) => {
          const m = o as InstanceType<typeof THREE.Mesh>;
          m.geometry?.dispose();
        });
        [loza, barro, ceramica, cafeMat, cremaMat, arteMat].forEach((m) => m.dispose());
        texArte.dispose();
        texCrema.dispose();
        [texEsmalte, texRug, texLiso].forEach((t) => t.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelado = true;
      limpiar();
    };
  }, []);

  return (
    <div className="taza3d">
      <div ref={ref} className="taza3d-lienzo" aria-hidden="true" />
      <div className="molinillo-lectura">
        <span className="stencil">{nivel < 100 ? "Sirviendo" : "Lista"}</span>
        <span className="dato">Extracción ideal 18–22% · 1:15 a 1:17</span>
      </div>
      <p className="dato tostador-ayuda">El color del café sigue el tueste que elegiste en el tostador.</p>
    </div>
  );
}
