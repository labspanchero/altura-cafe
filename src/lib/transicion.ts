import { flushSync } from "react-dom";

// Cambio de contenido con transición suave (View Transitions API).
// Sin soporte o con "reducir movimiento", el cambio es inmediato como antes.
export function conTransicion(cambio: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    cambio();
    return;
  }
  doc.startViewTransition(() => flushSync(cambio));
}

// Desplaza hasta el elemento y espera a que termine el scroll (o 700 ms como máximo).
export function irA(el: Element | null) {
  return new Promise<void>((ok) => {
    if (!el) return ok();
    const top = el.getBoundingClientRect().top;
    if (Math.abs(top - 80) < 40) return ok();
    let listo = false;
    const fin = () => {
      if (listo) return;
      listo = true;
      window.removeEventListener("scrollend", fin);
      ok();
    };
    window.addEventListener("scrollend", fin, { once: true });
    setTimeout(fin, 700);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
