"use client";

import { useEffect, useRef } from "react";
import type { Mesh, Vector3 } from "three";

// Granos verdes que caen del saco en la portada. Three.js se carga aparte
// para no pesar en el primer render.
export default function LluviaGranos() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cont = ref.current;
    if (!cont) return;
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      const THREE = await import("three");
      const { crearGeometriaGrano, luces, prefiereMenosMovimiento, colorTueste } = await import("./grano");
      if (cancelado) return;

      const quieto = prefiereMenosMovimiento();
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      cont.appendChild(renderer.domElement);

      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camara.position.set(0, 0, 14);
      luces(escena);

      const geo = crearGeometriaGrano(40);
      const movil = window.innerWidth < 720;
      const N = movil ? 18 : 42;
      const materiales = [0, 0.6, 1.3].map((t) => {
        const c = new THREE.Color();
        const { rugosidad } = colorTueste(t, c);
        return new THREE.MeshStandardMaterial({ color: c, roughness: rugosidad });
      });

      type Grano = { m: Mesh; vel: number; giro: Vector3 };
      const granos: Grano[] = [];
      const alto = 9;
      for (let i = 0; i < N; i++) {
        const m = new THREE.Mesh(geo, materiales[i % 3 === 0 ? 1 : i % 7 === 0 ? 2 : 0]);
        const s = 0.32 + Math.random() * 0.22;
        m.scale.setScalar(s);
        m.position.set(
          (movil ? 0 : 3.2) + (Math.random() - 0.5) * (movil ? 9 : 8),
          (Math.random() - 0.5) * alto * 2,
          (Math.random() - 0.5) * 6,
        );
        m.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
        escena.add(m);
        granos.push({
          m,
          vel: 0.6 + Math.random() * 0.9,
          giro: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(1.6),
        });
      }

      const mouse = { x: 0, y: 0 };
      const alMover = (e: PointerEvent) => {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", alMover, { passive: true });

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

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(cont);

      const reloj = new THREE.Clock();
      let raf = 0;
      const cuadro = () => {
        raf = requestAnimationFrame(cuadro);
        if (!visible || document.hidden) return;
        const dt = Math.min(reloj.getDelta(), 0.05);
        for (const g of granos) {
          g.m.position.y -= g.vel * dt;
          g.m.rotation.x += g.giro.x * dt;
          g.m.rotation.y += g.giro.y * dt;
          g.m.rotation.z += g.giro.z * dt;
          if (g.m.position.y < -alto) g.m.position.y = alto;
        }
        camara.position.x += (mouse.x * 1.4 - camara.position.x) * 0.04;
        camara.position.y += (-mouse.y * 0.9 - camara.position.y) * 0.04;
        camara.lookAt(0, 0, 0);
        renderer.render(escena, camara);
      };
      if (quieto) {
        renderer.render(escena, camara);
      } else {
        cuadro();
      }
      requestAnimationFrame(() => cont.setAttribute("data-listo", "true"));

      limpiar = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", alMover);
        ro.disconnect();
        io.disconnect();
        geo.dispose();
        materiales.forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelado = true;
      limpiar();
    };
  }, []);

  return <div ref={ref} className="lluvia" aria-hidden="true" />;
}
