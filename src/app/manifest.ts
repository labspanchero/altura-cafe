import type { MetadataRoute } from "next";

// Permite instalar Altura en el teléfono como una app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Altura · Café de especialidad",
    short_name: "Altura",
    description: "La ficha completa de cada café, un barista con IA y tu Ruta del café.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#b08a52",
    theme_color: "#1c1710",
    icons: [
      { src: "/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icono-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
