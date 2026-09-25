import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Altura · Café de especialidad, de la planta a la taza",
  description:
    "Sigue un lote de café verde desde la planta hasta la taza y conoce la ficha completa de cada café: origen, altitud, proceso, notas, molienda y receta.",
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
