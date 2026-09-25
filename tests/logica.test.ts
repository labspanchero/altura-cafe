import { describe, expect, it, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: () => ({ env: {} }) }));

import { CAFES, METODOS } from "@/lib/cafes";
import { recomendar, validarRespuestas } from "@/lib/recomendar";
import { etapasDe, mmss, segundos } from "@/lib/etapas";
import { ajustes, normalizar, parecido, recetaPara } from "@/lib/tucafe";
import { notas, perfil, validarConfig, type Config } from "@/lib/armar";
import { itemACafe } from "@/lib/carta";

describe("carta", () => {
  it("cada lote tiene datos completos y recetas con métodos válidos", () => {
    expect(CAFES).toHaveLength(6);
    for (const c of CAFES) {
      expect(c.altitud).toBeGreaterThan(900);
      expect(c.puntaje).toBeGreaterThanOrEqual(80);
      expect(c.recetas.length).toBeGreaterThan(0);
      for (const r of c.recetas) expect(METODOS[r.metodo]).toBeDefined();
      for (const v of Object.values(c.sensorial)) expect(v).toBeGreaterThanOrEqual(1);
    }
  });

  it("convierte un ítem del CMS de Webflow en un café", () => {
    const cafe = itemACafe({
      fieldData: {
        slug: "prueba",
        lote: "ALT-99",
        pais: "Perú",
        region: "Cajamarca",
        altitud: 1900,
        puntaje: "86,25",
        tueste: "d0bcbccdd724efd81772b646352dfaf6",
        "notas-de-cata": "Cacao, Naranja",
        perfil: "chocolate, frutal, inventado",
        recetas: "v60 | Media fina | 15 g | 250 g | 93 °C | 2:45\nmetodo-falso | x | x | x | x | x",
        acidez: 3, cuerpo: 3, dulzor: 4, amargor: 2,
      },
    });
    expect(cafe?.puntaje).toBe(86.25);
    expect(cafe?.tueste).toBe("Medio");
    expect(cafe?.perfil).toEqual(["chocolate", "frutal"]);
    expect(cafe?.recetas).toHaveLength(1);
  });

  it("descarta ítems del CMS incompletos", () => {
    expect(itemACafe({ fieldData: { slug: "x", pais: "X" } })).toBeNull();
  });
});

describe("quiz", () => {
  it("valida respuestas y rechaza las inválidas", () => {
    expect(validarRespuestas({ metodo: "v60", perfil: "floral", acidez: "brillante", leche: false })).not.toBeNull();
    expect(validarRespuestas({ metodo: "sifon", perfil: "floral", acidez: "brillante", leche: false })).toBeNull();
    expect(validarRespuestas(null)).toBeNull();
  });

  it("recomienda un café de chocolate con leche para espresso", () => {
    const r = recomendar({ metodo: "espresso", perfil: "chocolate", acidez: "baja", leche: true });
    expect(r.cafe.perfil).toContain("chocolate");
    expect(r.receta.metodo).toBe("espresso");
  });
});

describe("temporizador", () => {
  it("convierte tiempos de receta", () => {
    expect(segundos("2:45")).toBe(165);
    expect(segundos("16 h")).toBeNull();
    expect(mmss(65)).toBe("1:05");
  });

  it("arma etapas continuas que terminan en el tiempo total", () => {
    for (const c of CAFES)
      for (const r of c.recetas) {
        const e = etapasDe(r);
        if (r.metodo === "coldbrew") {
          expect(e).toBeNull();
          continue;
        }
        expect(e?.at(-1)?.hasta).toBe(segundos(r.tiempo));
        e?.forEach((x, i) => {
          expect(x.hasta).toBeGreaterThan(x.desde);
          if (i > 0) expect(x.desde).toBe(e[i - 1].hasta);
        });
      }
  });
});

describe("trae tu café", () => {
  it("normaliza lo que devuelve la IA", () => {
    const l = normalizar({ pais: "Colombia", altitud: "2.100 msnm", tueste: "Claro", notas: ["panela", 3, ""], esCafe: true });
    expect(l.altitud).toBe(2100);
    expect(l.tueste).toBe("claro");
    expect(l.notas).toEqual(["panela"]);
    expect(normalizar({ altitud: 99999 }).altitud).toBeNull();
  });

  it("sube la temperatura en tuestes claros y encuentra un lote parecido", () => {
    const claro = recetaPara(normalizar({ tueste: "claro" }), "v60");
    const oscuro = recetaPara(normalizar({ tueste: "oscuro" }), "v60");
    expect(parseInt(claro.temperatura)).toBeGreaterThan(parseInt(oscuro.temperatura));
    expect(parecido(normalizar({ pais: "Kenia" })).pais).toBe("Kenia");
  });

  it("da ajustes opuestos para café ácido y amargo", () => {
    expect(ajustes("acido", "v60")[0]).toMatch(/fino/);
    expect(ajustes("amargo", "v60")[0]).toMatch(/grueso/);
  });
});

describe("arma tu café", () => {
  const base: Config = { origen: "etiopia", proceso: "natural", tueste: "claro", metodo: "chemex", cantidad: 500, nombre: "Café <b>Nerd</b>" };

  it("limpia el nombre y rechaza opciones inválidas", () => {
    expect(validarConfig(base)?.nombre).toBe("Café bNerdb");
    expect(validarConfig({ ...base, cantidad: 3 })).toBeNull();
    expect(validarConfig({ ...base, origen: "marte" })).toBeNull();
    expect(validarConfig({ ...base, metodo: "grano" })?.metodo).toBe("grano");
  });

  it("mantiene el perfil entre 1 y 5 y el tueste oscuro suma amargor", () => {
    const claro = perfil(base);
    const oscuro = perfil({ ...base, tueste: "oscuro" });
    for (const v of [...Object.values(claro), ...Object.values(oscuro)]) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
    }
    expect(oscuro.amargor).toBeGreaterThan(claro.amargor);
    expect(notas({ ...base, tueste: "oscuro" })).toContain("Cacao amargo");
  });
});
