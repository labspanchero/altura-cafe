import { normalizarLugar } from "@/lib/ruta";

// Ciudad aproximada del visitante según su IP, tal como la informa la red de Webflow Cloud (Cloudflare).
// Sin GPS ni permisos; no se guarda en ningún lado. Solo se usa para sugerir la Ruta del café.
const texto = (v: string | null) => {
  if (!v) return null;
  try {
    return normalizarLugar(decodeURIComponent(v));
  } catch {
    return normalizarLugar(v);
  }
};

export async function GET(request: Request) {
  const h = request.headers;
  const ciudad = texto(h.get("cf-ipcity"));
  const region = texto(h.get("cf-region"));
  return Response.json(
    { ciudad, region, lugar: ciudad ? [ciudad, region && region !== ciudad ? region : null].filter(Boolean).join(", ") : null },
    { headers: { "Cache-Control": "private, no-store", Vary: "*" } },
  );
}
