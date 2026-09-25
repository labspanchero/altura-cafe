# CONTEXT — Altura

App para el concurso de Webflow Cloud en Nerdearla 2026: tostadería ficticia de café de especialidad.

- Historia con scroll de la planta a la taza (`src/app/components/Historia.tsx`): el saco se va estampando en cada etapa.
- Carta con la ficha completa de cada lote (`Carta.tsx`) y datos en `src/lib/cafes.ts` (lotes de muestra, ficticios).
- Quiz "Encuentra tu café" → `POST /api/recomendar` (`src/lib/recomendar.ts`).
- Barista IA → `POST /api/barista` (OpenAI). Necesita la variable secreta `OPENAI_API_KEY` en Webflow Cloud; `OPENAI_MODEL` es opcional.
- Producto y diseño: `PRODUCT.md`, `.impeccable/`.

Stack: Next.js 16 + OpenNext sobre Cloudflare Workers (Webflow Cloud). Solo npm.

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción
```
