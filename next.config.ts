import type { NextConfig } from "next";

// Webflow Cloud sirve los assets (_next/static) desde *.webflow.services y
// agrega el badge "Made in Webflow" (script inline + imágenes en CloudFront).
// Next.js inyecta scripts inline para hidratar, por eso script-src necesita
// 'unsafe-inline'; el resto de la política sí queda cerrada.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.webflow.services",
  "style-src 'self' 'unsafe-inline' https://*.webflow.services",
  "img-src 'self' data: blob: https://*.webflow.services https://d3e54v103j8qbb.cloudfront.net",
  "font-src 'self' data: https://*.webflow.services",
  "connect-src 'self' https://*.webflow.services",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const seguridad = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "Permissions-Policy", value: "microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: seguridad }];
  },
};

export default nextConfig;
