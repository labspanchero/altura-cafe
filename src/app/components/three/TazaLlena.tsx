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
      camara.position.set(0, 3.4, 5.2);
      camara.lookAt(0, 0.35, 0);
      luces(escena);

      const loza = new THREE.MeshStandardMaterial({ color: "#efe4cf", roughness: 0.35 });
      const tinta = new THREE.MeshStandardMaterial({ color: "#1c1710", roughness: 0.5 });

      // Perfil de la taza (radio, altura) girado sobre el eje Y.
      const perfil = [
        [0, 0],
        [0.62, 0],
        [0.7, 0.05],
        [0.78, 0.3],
        [0.95, 0.9],
        [1.02, 1.12],
        [0.96, 1.12],
        [0.89, 0.92],
        [0.73, 0.34],
        [0.66, 0.1],
        [0, 0.1],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const taza = new THREE.Mesh(new THREE.LatheGeometry(perfil, 72), loza);
      const borde = new THREE.Mesh(new THREE.TorusGeometry(0.99, 0.022, 8, 72), tinta);
      borde.rotation.x = Math.PI / 2;
      borde.position.y = 1.12;
      const asa = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.07, 16, 32, Math.PI * 1.25), loza);
      asa.position.set(1.02, 0.62, 0);
      asa.rotation.z = -Math.PI * 0.62;
      const plato = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.55, 0.08, 72), loza);
      plato.position.y = -0.04;
      const filete = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.02, 8, 72), tinta);
      filete.rotation.x = Math.PI / 2;

      // Café: un tronco de cono que crece hacia arriba, con la crema encima.
      const cafeMat = new THREE.MeshStandardMaterial({ color: "#4a2410", roughness: 0.15 });
      const cremaMat = new THREE.MeshStandardMaterial({ color: "#c98a55", roughness: 0.6 });
      const cafe = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64, 1, true), cafeMat);
      const crema = new THREE.Mesh(new THREE.CircleGeometry(1, 64), cremaMat);
      crema.rotation.x = -Math.PI / 2;

      const grupo = new THREE.Group();
      grupo.add(taza, borde, asa, plato, filete, cafe, crema);
      grupo.rotation.y = -0.5;
      escena.add(grupo);

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
          [0.92, 0.89],
          [1.1, 0.95],
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
        cafe.visible = crema.visible = lleno > 0.01;

        colorTueste(tueste, color);
        cafeMat.color.copy(color).multiplyScalar(0.45);
        cremaMat.color.copy(color).multiplyScalar(0.8).lerp(new THREE.Color("#c68a55"), Math.max(0.08, 0.4 - tueste * 0.09));
        if (!quieto) grupo.rotation.y += dt * 0.15;

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
        [loza, tinta, cafeMat, cremaMat].forEach((m) => m.dispose());
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
