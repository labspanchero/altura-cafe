import type { Cafe } from "./cafes";

// Datos estructurados (schema.org, JSON-LD) para buscadores. Describen lo que el sitio es de verdad:
// una aplicación web hecha para el concurso. Los lotes se marcan como muestras ficticias, sin precio ni stock.
const URL_SITIO = "https://altura-cafe.webflow.io/";

export function datosEstructurados(cafes: Cafe[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${URL_SITIO}#sitio`,
        url: URL_SITIO,
        name: "Altura",
        inLanguage: "es",
        description: "Tostadería ficticia de café de especialidad creada para el concurso de Webflow Cloud en Nerdearla 2026.",
      },
      {
        "@type": "WebApplication",
        "@id": `${URL_SITIO}#app`,
        name: "Altura · Café de especialidad, de la planta a la taza",
        url: URL_SITIO,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        inLanguage: "es",
        isAccessibleForFree: true,
        isPartOf: { "@id": `${URL_SITIO}#sitio` },
        featureList: [
          "Ficha completa de cada lote desde el CMS de Webflow",
          "Barista con IA",
          "Lectura del paquete con IA",
          "Ruta del café con búsqueda web y mapa",
          "Temporizador de recetas",
        ],
      },
      {
        "@type": "ItemList",
        name: "La carta de Altura (lotes de muestra ficticios)",
        numberOfItems: cafes.length,
        itemListElement: cafes.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "CreativeWork",
            name: `${c.pais} ${c.lote}`,
            description: `Lote de muestra ficticio. ${c.region}, ${c.altitud} msnm, ${c.variedad}, proceso ${c.proceso.toLowerCase()}. Notas: ${c.notas.join(", ")}.`,
            keywords: [c.pais, c.proceso, c.variedad, ...c.notas].join(", "),
          },
        })),
      },
    ],
  };
}

// JSON seguro para incrustar en <script>: evita que un "<" cierre la etiqueta.
export function jsonSeguro(v: unknown) {
  return JSON.stringify(v).replace(/</g, "\\u003c");
}
