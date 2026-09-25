"use client";

import { useEffect, useRef, useState } from "react";
import { TUESTES } from "./grano";

// Un grano grande que se tuesta con el control: cambia color, brillo y tamaño.
export default function GranoTueste() {
  const ref = useRef<HTMLDivElement>(null);
  const tueste = useRef(0);
  const [valor, setValor] = useState(0);
  const etapa = TUESTES[Math.round(valor)];

  useEffect(() => {
    tueste.current = valor;
    window.dispatchEvent(new CustomEvent("altura:tueste", { detail: valor }));
  }, [valor]);

  useEffect(() => {
    const cont = ref.current;
    if (!cont) return;
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      const THREE = await import("three");
      const { crearGeometriaGrano, luces, colorTueste, prefiereMenosMovimiento, materialGrano, ajustarMaterialGrano } = await import("./grano");
      if (cancelado) return;

      const quieto = prefiereMenosMovimiento();
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      cont.appendChild(renderer.domElement);

      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
      camara.position.set(0, 0.6, 6);
      camara.lookAt(0, 0, 0);
      luces(escena);

      const geo = crearGeometriaGrano(96);
      const mat = materialGrano(0);
      const grano = new THREE.Mesh(geo, mat);
      grano.rotation.set(-1.15, 0.3, 0.15);
      escena.add(grano);

      // Arrastrar para girar el grano.
      let arrastrando = false;
      let ultimoX = 0;
      let giroManual = 0;
      const abajo = (e: PointerEvent) => {
        arrastrando = true;
        ultimoX = e.clientX;
      };
      const mover = (e: PointerEvent) => {
        if (!arrastrando) return;
        giroManual += (e.clientX - ultimoX) * 0.01;
        ultimoX = e.clientX;
      };
      const arriba = () => (arrastrando = false);
      renderer.domElement.addEventListener("pointerdown", abajo);
      window.addEventListener("pointermove", mover);
      window.addEventListener("pointerup", arriba);

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

      const color = new THREE.Color();
      let actual = 0;
      let raf = 0;
      const reloj = new THREE.Clock();
      const cuadro = () => {
        raf = requestAnimationFrame(cuadro);
        const dt = Math.min(reloj.getDelta(), 0.05);
        if (!visible || document.hidden) return;
        actual += (tueste.current - actual) * (quieto ? 1 : 0.08);
        const { escala } = colorTueste(actual, color);
        ajustarMaterialGrano(mat, actual);
        grano.scale.setScalar(escala);
        if (!quieto && !arrastrando) grano.rotation.y += dt * 0.5;
        grano.rotation.y += giroManual;
        giroManual = 0;
        renderer.render(escena, camara);
      };
      cuadro();

      limpiar = () => {
        cancelAnimationFrame(raf);
        renderer.domElement.removeEventListener("pointerdown", abajo);
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerup", arriba);
        ro.disconnect();
        io.disconnect();
        geo.dispose();
        mat.dispose();
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
    <div className="tostador">
      <div ref={ref} className="tostador-lienzo" aria-hidden="true" />
      <label htmlFor="tueste" className="sr-only">
        Nivel de tueste
      </label>
      <input
        id="tueste"
        type="range"
        min={0}
        max={TUESTES.length - 1}
        step={0.01}
        value={valor}
        onChange={(e) => setValor(Number(e.target.value))}
        aria-valuetext={`${etapa.nombre}, ${etapa.temp}`}
      />
      <div className="molinillo-lectura" aria-live="polite">
        <span className="stencil">{etapa.nombre}</span>
        <span className="dato">{etapa.temp}</span>
      </div>
      <p className="dato tostador-ayuda">Mueve el control para tostar el grano. Arrástralo para girarlo.</p>
    </div>
  );
}
