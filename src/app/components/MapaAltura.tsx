"use client";

import { useEffect, useRef, useState } from "react";
import { calidad, esperarCerca } from "@/lib/rendimiento";
import { useCarta } from "./CartaContexto";
import { abrirFicha } from "./Pedido";
import estilos from "./MapaAltura.module.css";

// Escala del relieve: la altura del mundo 3D va de ALT_MIN a ALT_MAX msnm.
const ALT_MIN = 800;
const ALT_MAX = 2400;
const ALTO = 3.2;
const MARCAS = [1200, 1500, 1800, 2100];

function aMundo(alt: number) {
  return ((alt - ALT_MIN) / (ALT_MAX - ALT_MIN)) * ALTO;
}

// Relieve determinista: un cerro principal, uno secundario y crestas suaves.
function relieve(x: number, z: number) {
  const r2 = x * x + z * z;
  let h = Math.exp(-r2 / 7.5);
  h += 0.32 * Math.exp(-((x - 2.6) ** 2 + (z + 1.9) ** 2) / 2.2);
  h += 0.07 * Math.sin(x * 1.7 + z * 0.8) * Math.exp(-r2 / 16);
  h += 0.05 * Math.sin(z * 2.3 - x * 1.1) * Math.exp(-r2 / 20);
  return Math.max(0, Math.min(1, h)) * ALTO;
}

function esClara(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

export default function MapaAltura() {
  const { cafes: CAFES } = useCarta();
  const POR_ALTITUD = [...CAFES].sort((a, b) => b.altitud - a.altitud);
  const lienzo = useRef<HTMLDivElement>(null);
  const etiquetas = useRef<Record<string, HTMLButtonElement | null>>({});
  const marcas = useRef<Record<number, HTMLSpanElement | null>>({});
  const activoRef = useRef<string | null>(null);
  const [activo, setActivo] = useState<string | null>(null);

  useEffect(() => {
    activoRef.current = activo;
  }, [activo]);

  useEffect(() => {
    const cont = lienzo.current;
    if (!cont) return;
    let cancelado = false;
    let limpiar = () => {};

    (async () => {
      await esperarCerca(cont);
      if (cancelado) return;
      const THREE = await import("three");
      if (cancelado) return;

      const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(calidad().dpr);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      cont.appendChild(renderer.domElement);

      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      const objetivo = new THREE.Vector3(0, 1.1, 0);

      // Terreno con bandas de nivel estarcidas cada 150 m.
      const geo = new THREE.PlaneGeometry(11, 11, 180, 180);
      geo.rotateX(-Math.PI / 2);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        pos.setY(i, relieve(pos.getX(i), pos.getZ(i)));
      }
      geo.computeVertexNormals();

      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uJute: { value: new THREE.Color("#b08a52") },
          uJuteHondo: { value: new THREE.Color("#97723e") },
          uTinta: { value: new THREE.Color("#1c1710") },
          uPaso: { value: aMundo(ALT_MIN + 150) },
        },
        vertexShader: /* glsl */ `
          varying float vAlto;
          varying vec2 vXZ;
          void main() {
            vAlto = position.y;
            vXZ = position.xz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uJute;
          uniform vec3 uJuteHondo;
          uniform vec3 uTinta;
          uniform float uPaso;
          varying float vAlto;
          varying vec2 vXZ;
          void main() {
            float borde = smoothstep(5.5, 4.2, max(abs(vXZ.x), abs(vXZ.y)));
            if (borde <= 0.0) discard;
            float banda = vAlto / uPaso;
            float idx = floor(banda);
            vec3 base = mod(idx, 2.0) < 1.0 ? uJute : uJuteHondo;
            float d = abs(fract(banda + 0.5) - 0.5);
            float w = fwidth(banda);
            float mayor = mod(idx + 1.0, 2.0) < 1.0 ? 1.8 : 1.0;
            float linea = 1.0 - smoothstep(0.0, w * 1.4 * mayor, d);
            vec3 color = mix(base, uTinta, linea * (vAlto > 0.02 ? 1.0 : 0.0));
            gl_FragColor = vec4(color, borde);
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const terreno = new THREE.Mesh(geo, mat);
      escena.add(terreno);

      // Una bandera por lote, a su altitud real sobre la ladera.
      const tinta = new THREE.Color("#1c1710");
      type Bandera = { id: string; tope: InstanceType<typeof THREE.Vector3>; grupo: InstanceType<typeof THREE.Group> };
      const banderas: Bandera[] = [];
      const recursos: { dispose: () => void }[] = [geo, mat];
      CAFES.forEach((c, i) => {
        const objetivoY = aMundo(c.altitud);
        const ang = (i / CAFES.length) * Math.PI * 2 + 0.35;
        let x = 0;
        let z = 0;
        for (let r = 0; r < 5; r += 0.01) {
          x = Math.cos(ang) * r;
          z = Math.sin(ang) * r;
          if (relieve(x, z) <= objetivoY) break;
        }
        const y = relieve(x, z);
        // Postes de distinto largo para que las etiquetas no se encimen.
        const largo = 0.9 + (i % 3) * 0.45;
        const grupo = new THREE.Group();
        grupo.position.set(x, y, z);
        const poste = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, largo, 6),
          new THREE.MeshBasicMaterial({ color: tinta }),
        );
        poste.position.y = largo / 2;
        const tela = new THREE.Mesh(
          new THREE.PlaneGeometry(0.42, 0.26),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(c.tinta), side: THREE.DoubleSide }),
        );
        tela.position.set(0.21, largo - 0.13, 0);
        const base = new THREE.Mesh(
          new THREE.CircleGeometry(0.09, 16),
          new THREE.MeshBasicMaterial({ color: tinta }),
        );
        base.rotation.x = -Math.PI / 2;
        base.position.y = 0.01;
        grupo.add(poste, tela, base);
        escena.add(grupo);
        recursos.push(poste.geometry, poste.material, tela.geometry, tela.material, base.geometry, base.material);
        banderas.push({ id: c.id, tope: new THREE.Vector3(x, y + largo + 0.05, z), grupo });
      });

      // Eje de altitud en una esquina del mapa.
      const esquina = new THREE.Vector3(-4.6, 0, 4.6);
      const ejeGeo = new THREE.BufferGeometry().setFromPoints([
        esquina.clone(),
        esquina.clone().setY(aMundo(2250)),
      ]);
      const ejeMat = new THREE.LineBasicMaterial({ color: tinta });
      escena.add(new THREE.Line(ejeGeo, ejeMat));
      recursos.push(ejeGeo, ejeMat);
      const puntosMarca = MARCAS.map((m) => ({ m, p: esquina.clone().setY(aMundo(m)) }));

      // Órbita: automática y lenta, o arrastrando.
      let azimut = 0.6;
      let polar = 1.02;
      let arrastrando = false;
      let ultimo = { x: 0, y: 0 };
      const abajo = (e: PointerEvent) => {
        arrastrando = true;
        ultimo = { x: e.clientX, y: e.clientY };
      };
      const mover = (e: PointerEvent) => {
        if (!arrastrando) return;
        azimut -= (e.clientX - ultimo.x) * 0.008;
        polar = Math.min(1.35, Math.max(0.6, polar - (e.clientY - ultimo.y) * 0.005));
        ultimo = { x: e.clientX, y: e.clientY };
      };
      const arriba = () => (arrastrando = false);
      renderer.domElement.addEventListener("pointerdown", abajo);
      window.addEventListener("pointermove", mover, { passive: true });
      window.addEventListener("pointerup", arriba);

      let ancho = 1;
      let alto = 1;
      let radio = 12;
      const ajustar = () => {
        ancho = cont.clientWidth;
        alto = cont.clientHeight;
        renderer.setSize(ancho, alto, false);
        camara.aspect = ancho / alto;
        radio = camara.aspect < 1 ? 17 : 12.5;
        objetivo.y = camara.aspect < 1 ? 2.1 : 1.1;
        camara.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(ajustar);
      ro.observe(cont);
      ajustar();

      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(cont);

      const v = new THREE.Vector3();
      const proyectar = (p: InstanceType<typeof THREE.Vector3>, el: HTMLElement | null) => {
        if (!el) return;
        v.copy(p).project(camara);
        const x = (v.x * 0.5 + 0.5) * ancho;
        const y = (-v.y * 0.5 + 0.5) * alto;
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        el.style.zIndex = String(Math.round((1 - v.z) * 1000));
      };

      const reloj = new THREE.Clock();
      let raf = 0;
      const dibujar = () => {
        camara.position.set(
          objetivo.x + radio * Math.sin(polar) * Math.cos(azimut),
          objetivo.y + radio * Math.cos(polar),
          objetivo.z + radio * Math.sin(polar) * Math.sin(azimut),
        );
        camara.lookAt(objetivo);
        camara.updateMatrixWorld();
        for (const b of banderas) {
          const on = activoRef.current === b.id;
          const s = b.grupo.scale.x + ((on ? 1.35 : 1) - b.grupo.scale.x) * 0.2;
          b.grupo.scale.setScalar(s);
          proyectar(b.tope, etiquetas.current[b.id]);
        }
        for (const { m, p } of puntosMarca) proyectar(p, marcas.current[m]);
        renderer.render(escena, camara);
      };
      const cuadro = () => {
        raf = requestAnimationFrame(cuadro);
        const dt = Math.min(reloj.getDelta(), 0.05);
        if (!visible || document.hidden) return;
        if (!quieto && !arrastrando) azimut += dt * 0.09;
        dibujar();
      };
      dibujar();
      cuadro();
      cont.setAttribute("data-listo", "true");

      limpiar = () => {
        cancelAnimationFrame(raf);
        renderer.domElement.removeEventListener("pointerdown", abajo);
        window.removeEventListener("pointermove", mover);
        window.removeEventListener("pointerup", arriba);
        ro.disconnect();
        io.disconnect();
        recursos.forEach((r) => r.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      cancelado = true;
      limpiar();
    };
  }, [CAFES]);

  return (
    <section className={estilos.mapa} id="mapa" aria-labelledby="mapa-titulo">
      <div className={estilos.cabeza}>
        <h2 id="mapa-titulo" className="stencil titulo-seccion">
          Mapa de altura
        </h2>
        <p className="bajada">
          Cada lote de la carta, plantado a su altitud real. Mientras más alto
          crece el cafeto, más lento madura la cereza y más acidez y complejidad
          llega a la taza. Arrastra el relieve para girarlo y toca una bandera
          para abrir su ficha.
        </p>
      </div>

      <div className={estilos.escenario}>
        <div ref={lienzo} className={estilos.lienzo} aria-hidden="true" />
        <div className={estilos.capa}>
          {MARCAS.map((m) => (
            <span
              key={m}
              ref={(el) => {
                marcas.current[m] = el;
              }}
              className={`dato ${estilos.marca}`}
              aria-hidden="true"
            >
              {m.toLocaleString("es")} msnm
            </span>
          ))}
          {CAFES.map((c) => (
            <button
              key={c.id}
              type="button"
              ref={(el) => {
                etiquetas.current[c.id] = el;
              }}
              className={estilos.etiqueta}
              data-activo={activo === c.id}
              onPointerEnter={() => setActivo(c.id)}
              onPointerLeave={() => setActivo(null)}
              onFocus={() => setActivo(c.id)}
              onBlur={() => setActivo(null)}
              onClick={() => abrirFicha(c.id)}
              tabIndex={-1}
              aria-hidden="true"
            >
              <span
                className={`dato ${estilos.etiquetaLote}`}
                style={{ background: c.tinta, color: esClara(c.tinta) ? "var(--ink)" : "#fff" }}
              >
                {c.lote}
              </span>
              <span className={`dato ${estilos.etiquetaTexto}`}>
                {c.pais} · {c.altitud.toLocaleString("es")} m
              </span>
            </button>
          ))}
        </div>
      </div>

      <ol className={estilos.escala} aria-label="Lotes ordenados por altitud">
        {POR_ALTITUD.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={estilos.peldano}
              onClick={() => abrirFicha(c.id)}
              onPointerEnter={() => setActivo(c.id)}
              onPointerLeave={() => setActivo(null)}
              onFocus={() => setActivo(c.id)}
              onBlur={() => setActivo(null)}
              data-activo={activo === c.id}
              style={{ "--tinta": c.tinta } as React.CSSProperties}
            >
              <span className={`stencil ${estilos.peldanoAlt}`}>
                {c.altitud.toLocaleString("es")}
              </span>
              <span className={`dato ${estilos.peldanoNombre}`}>
                msnm · {c.pais} {c.lote}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
