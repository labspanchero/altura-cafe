import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, Big_Shoulders_Stencil } from "next/font/google";
import "./globals.css";

const stencil = Big_Shoulders_Stencil({
  variable: "--font-stencil",
  weight: ["700", "900"],
  subsets: ["latin"],
});

const condensed = Barlow_Condensed({
  variable: "--font-condensed",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const body = Barlow({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const titulo = "Altura · Café de especialidad, de la planta a la taza";
const descripcion =
  "Sigue un lote de café verde desde la planta hasta la taza y conoce la ficha completa de cada café: origen, altitud, proceso, notas, molienda y receta.";

// Color de la barra del navegador en el teléfono.
export const viewport: Viewport = { themeColor: "#b08a52" };

export const metadata: Metadata = {
  metadataBase: new URL("https://altura-cafe.webflow.io"),
  title: titulo,
  description: descripcion,
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Altura",
    title: titulo,
    description: descripcion,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Saco de café Altura con el lote ALT-07 de Guji, Etiopía" }],
  },
  twitter: {
    card: "summary_large_image",
    title: titulo,
    description: descripcion,
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${stencil.variable} ${condensed.variable} ${body.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
