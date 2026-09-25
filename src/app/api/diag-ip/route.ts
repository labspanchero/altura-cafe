// TEMPORAL: diagnóstico de qué encabezados de IP llegan a través de Webflow Cloud. Se borra enseguida.
export async function GET(request: Request) {
  const h: Record<string, string> = {};
  for (const [k, v] of request.headers) if (/ip|forwarded|client|cf-|via|x-real/i.test(k)) h[k] = v;
  return Response.json(h, { headers: { "Cache-Control": "no-store" } });
}
