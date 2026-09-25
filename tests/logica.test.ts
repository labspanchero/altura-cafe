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

describe("seguridad", () => {
  it("el límite cae a memoria sin base y bloquea al pasar el máximo", async () => {
    const { superaLimite } = await import("@/lib/entorno");
    const clave = `prueba:${Math.random()}`;
    expect(await superaLimite(clave, 2, 60)).toBe(false);
    expect(await superaLimite(clave, 2, 60)).toBe(false);
    expect(await superaLimite(clave, 2, 60)).toBe(true);
  });

  it("rechaza cuerpos grandes antes de parsearlos", async () => {
    const { leerJson } = await import("@/lib/entorno");
    const grande = new Request("http://x", { method: "POST", body: "x".repeat(2000), headers: { "content-length": "2000" } });
    expect(await leerJson(grande, 1000)).toBe("grande");
    const bien = new Request("http://x", { method: "POST", body: '{"a":1}' });
    expect(await leerJson(bien, 1000)).toEqual({ a: 1 });
    const roto = new Request("http://x", { method: "POST", body: "{no-json" });
    expect(await leerJson(roto, 1000)).toBeNull();
  });
});

describe("ip del visitante", async () => {
  const { ipDe } = await import("@/lib/entorno");
  it("usa la IP que pone Webflow y no la que manda el visitante", () => {
    const r = (h: Record<string, string>) => new Request("https://x.test", { headers: h });
    expect(ipDe(r({ "x-wf-clientip": "2800::1", "x-forwarded-for": "198.51.100.7, 2800::1" }))).toBe("2800::1");
    expect(ipDe(r({ "x-forwarded-for": "198.51.100.7, 104.22.0.1, 2800::1" }))).toBe("2800::1");
    expect(ipDe(r({}))).toBe("local");
  });
});

describe("datos estructurados", async () => {
  const { datosEstructurados, jsonSeguro } = await import("@/lib/datosEstructurados");
  const { CAFES } = await import("@/lib/cafes");
  it("marca los lotes como ficticios y no puede cerrar la etiqueta <script>", () => {
    const json = jsonSeguro(datosEstructurados(CAFES));
    expect(json).toContain("Lote de muestra ficticio");
    expect(json).not.toContain("offers");
    expect(jsonSeguro({ x: "</script><script>alert(1)</script>" })).not.toContain("<");
  });
});

describe("ruta del café", async () => {
  const { limpiarRuta, limpiarUrl, normalizarLugar, mapsRuta, distanciaKm, filtrarCercanas, ordenarParaCaminar } = await import("@/lib/ruta");
  it("ordena las paradas para caminar siempre hacia la más cercana", () => {
    const base = { barrio: "", direccion: "x", destacado: "", puntaje: null, fuentePuntaje: null, fuente: "https://a.com" };
    const p = (nombre: string, lon?: number) => ({ ...base, nombre, ...(lon === undefined ? {} : { lat: -34.58, lon }) });
    const orden = ordenarParaCaminar([p("A", -58.43), p("Lejos", -58.4), p("Sin ubicar"), p("Cerca", -58.429), p("Medio", -58.42)]);
    expect(orden.map((x) => x.nombre)).toEqual(["A", "Cerca", "Medio", "Lejos", "Sin ubicar"]);
  });
  it("saca del mapa las paradas que el geocodificador ubicó lejos", () => {
    const palermo = { lat: -34.5803, lon: -58.4245 };
    expect(distanciaKm(palermo, { lat: -34.5886, lon: -58.4317 })).toBeLessThan(2);
    const base = { barrio: "", destacado: "", puntaje: null, fuentePuntaje: null, fuente: "https://a.com" };
    const [cerca, lejos, sin] = filtrarCercanas(
      [
        { ...base, nombre: "Cerca", direccion: "Thames 1535", lat: -34.5885, lon: -58.4317 },
        { ...base, nombre: "Otra Thames", direccion: "Thames 1535", lat: -34.6737, lon: -58.5849 },
        { ...base, nombre: "Sin datos", direccion: "?" },
      ],
      palermo,
    );
    expect(cerca.lat).toBeDefined();
    expect(lejos.lat).toBeUndefined();
    expect(sin.lat).toBeUndefined();
  });
  it("extrae la URL de una fuente en markdown y quita utm", () => {
    expect(limpiarUrl("([catas.ar](https://www.catas.ar/?utm_source=openai))")).toBe("https://www.catas.ar/");
    expect(limpiarUrl("javascript:alert(1)")).toBeNull();
  });
  it("normaliza el lugar y rechaza vacíos", () => {
    expect(normalizarLugar("  Palermo <script>, BA ")).toBe("Palermo script , BA");
    expect(normalizarLugar("x")).toBeNull();
  });
  it("descarta paradas sin fuente o con fuente fuera de las citas", () => {
    const ruta = limpiarRuta(
      {
        ciudad: "Palermo",
        consejo: "",
        paradas: [
          { nombre: "A", barrio: "", direccion: "Calle 1", destacado: "", puntaje: 4.6, fuentePuntaje: "Google", fuente: "https://a.com/x" },
          { nombre: "B", barrio: "", direccion: "Calle 2", destacado: "", puntaje: null, fuentePuntaje: null, fuente: "https://b.com" },
          { nombre: "Inventada", barrio: "", direccion: "Calle 3", destacado: "", puntaje: 5, fuentePuntaje: "x", fuente: "" },
          { nombre: "Otra", barrio: "", direccion: "Calle 4", destacado: "", puntaje: null, fuentePuntaje: null, fuente: "https://no-citada.com" },
        ],
      },
      "Palermo",
      new Set(["https://a.com/x", "https://b.com/"]),
    );
    expect(ruta?.paradas.map((p) => p.nombre)).toEqual(["A", "B"]);
    expect(ruta?.maps).toContain("travelmode=walking");
    expect(mapsRuta(ruta!.paradas, "Palermo")).toContain("destination=");
  });
});
