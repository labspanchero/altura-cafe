// Utilidades de rendimiento para las escenas 3D.

// Espera a que el elemento esté cerca del viewport antes de iniciar su escena.
export function esperarCerca(el: Element, margen = "900px") {
  return new Promise<void>((ok) => {
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          io.disconnect();
          ok();
        }
      },
      { rootMargin: `${margen} 0px` },
    );
    io.observe(el);
  });
}

// Nivel de calidad según el equipo: baja en celulares modestos.
export function calidad() {
  if (typeof window === "undefined") return { baja: false, dpr: 1 };
  const nav = navigator as Navigator & { deviceMemory?: number };
  const movil = window.innerWidth < 720;
  const nucleos = nav.hardwareConcurrency ?? 8;
  const memoria = nav.deviceMemory ?? 8;
  const baja = nucleos <= 4 || memoria <= 4;
  const tope = baja ? 1 : movil ? 1.5 : 2;
  return { baja, movil, dpr: Math.min(window.devicePixelRatio || 1, tope) };
}
