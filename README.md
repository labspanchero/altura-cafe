# Altura · café de especialidad, de la planta a la taza

**App en vivo:** https://altura-cafe.webflow.io/
Proyecto para el concurso de apps de **Webflow Cloud** en **Nerdearla 2026**.

Altura es una tostadería **ficticia**. La app sigue un lote de café verde desde la planta hasta la taza y muestra la ficha técnica completa de cada café: origen, altitud, variedad, proceso, notas, perfil sensorial, molienda por método y receta. Los lotes son de muestra: los orígenes, variedades y procesos son categorías reales, pero las fincas, productores y puntajes son ilustrativos.

![Altura](public/og.png)

## Qué hay en la página

| Sección | Qué hace | Cómo está hecho |
|---|---|---|
| **Portada** | Granos de café 3D que caen detrás del estarcido "ALTURA". Se apartan del puntero y, al hacer clic, se tuestan y crujen. | Three.js con geometría de grano procedural (hendidura en S), texturas generadas en canvas (moteado, arrugas en relieve, película en la hendidura), `MeshPhysicalMaterial` con brillo que depende del tueste. El crujido usa Web Audio. |
| **Granos al saco** | En escritorio, al hacer scroll, los granos se desvían hacia la boca del saco de la historia. | Se proyecta la posición del saco del DOM al plano 3D con un raycast en cada cuadro. |
| **La historia** | Nueve etapas (planta → taza). El saco de arpillera se estampa etapa por etapa y **se frunce y se ata** con el scroll. | SVG con la boca del saco interpolada entre dos trazados, estampas con `feTurbulence` que simula tinta gastada y trama de arpillera como imagen fija (antes se dibujaba en cada visita y trababa la carga). |
| **Tostador y molinillo** | Un grano 3D que se tuesta con un control (color, brillo y tamaño) y un molinillo que muestra el tamaño de partícula y la cafetera de cada método. | Three.js + SVG. |
| **La taza** | Taza de gres artesanal con el logo NERD que se llena con el scroll y termina con un **corazón de latte art**. El café toma el color del tueste que elegiste. | `LatheGeometry` con textura de esmalte moteado y base de barro, crema y latte art pintados en canvas. |
| **Mapa de altura** | Relieve 3D con curvas de nivel y una bandera por lote a su altitud real. | Terreno procedural con bandas de elevación y etiquetas HTML proyectadas desde el 3D. |
| **La carta** | Seis bolsas doradas que se inclinan en 3D y se voltean para abrir su ficha (en celular, carrusel horizontal). Comparador de lotes lado a lado y **"me gusta" compartidos**. **Se actualiza en vivo** cuando alguien edita un lote en Webflow. | CSS 3D, contador en SQLite y webhooks del CMS (ver abajo). |
| **Encuentra tu café** | Quiz de cuatro preguntas que recomienda un lote, su molienda y su receta. Genera una **tarjeta para compartir**. | `POST /api/recomendar` y canvas + Web Share API. |
| **Arma tu café** | Eliges cereza, proceso, tueste, método y cantidad; ves tu bolsa dorada con tu nombre, el perfil estimado y la receta, y haces un pedido de demostración guardado en SQLite. | `src/lib/armar.ts`, `POST /api/pedido`. |
| **El laboratorio** | Las herramientas con IA (Ruta del café, Barista y quiz, Escanea tu café) en una sección con pestañas fijas; los botones de la portada abren la pestaña correcta. | `Laboratorio.tsx`: paneles montados (no pierden estado), navegación con flechas del teclado y anclas de siempre. |
| **Ruta del café** | Escribes una ciudad o barrio y arma una ruta a pie por 4–6 cafeterías de especialidad reales. **Mapa** con la ruta que se dibuja parada por parada, paradas ordenadas para caminar, link de Google Maps y **tarjeta para compartir** con QR. | `POST /api/ruta` con OpenAI y **búsqueda web**: solo quedan paradas con fuente citada y el puntaje solo si una fuente lo publica. `POST /api/ruta/mapa` ubica las direcciones con Nominatim (OpenStreetMap, 1 consulta por segundo), descarta las que caen lejos y ordena por vecino más próximo. Mapa con Leaflet y teselas de OpenStreetMap. Sugiere la **ciudad del visitante** sin pedir permisos (`GET /api/donde`, con la ubicación aproximada que informa la red; no se guarda). Caché de 24 h por lugar en SQLite y topes por visitante y diarios. |
| **Trae tu café** | Le sacas una foto al paquete de tu casa (o escribes la etiqueta): la IA la lee, arma la ficha de **tu** café, calcula la receta para tu método, abre el temporizador guiado y te dice qué ajustar según cómo te salió la taza. | `POST /api/escanear` con un modelo con visión y salida JSON; receta y calibración deterministas en `src/lib/tucafe.ts`; límite en SQLite; la foto se achica en el navegador y no se guarda. |
| **Temporizador** | "Preparar ahora" en cada receta: cronómetro, etapas de vertido, agua objetivo en la balanza, aviso con sonido y vibración, pantalla encendida. | `src/lib/etapas.ts` deriva las etapas de la receta; Wake Lock y Web Audio. |
| **Barista IA** | Chat que responde solo sobre la carta, en streaming, y convierte los lotes que menciona en links a su ficha. | `POST /api/barista` con la API de OpenAI (SSE → texto plano) y límite de uso en SQLite. |
| **Cómo está hecho** | Diagrama animado de la arquitectura y **panel en vivo** con mediciones reales: latencia de la base, lectura del CMS de Webflow, avisos de Webflow recibidos y rutas guardadas. | `ComoEstaHecho.tsx` + `GET /api/estado` (se consulta solo con la sección a la vista, caché de 5 s). |

## Webflow Cloud

- **Runtime:** Next.js 16 (App Router) sobre Cloudflare Workers mediante OpenNext, desplegado desde GitHub en Webflow Cloud.
- **SQLite (`DB`, `migraciones/`):** carta del CMS, "me gusta", contador, pedidos de demostración, rutas y límites de uso atómicos.
- **Key Value Store (`LIMITES`):** disponible como respaldo.
- **CMS de Webflow + MCP de Webflow:** la carta vive en la colección **"Lotes"** del sitio `altura-cms`. La colección, sus 24 campos y los seis lotes se crearon con el **MCP de Webflow** desde Claude Code. La app lee la carta con la **Data API** (`src/lib/carta.ts`) y la guarda en SQLite.
- **Carta en vivo con webhooks:** el sitio `altura-cms` tiene webhooks (lote creado, cambiado, borrado, publicado y despublicado) que llaman a `POST /api/webflow/cambio`. El aviso es solo una señal: no se usa nada de su contenido y la carta se vuelve a leer del CMS con el token propio, así que un aviso falso solo provoca una lectura extra (con límite). La página abierta consulta `GET /api/carta/version` cada 6 s y, si cambió, actualiza la carta sin recargar. Medido en producción: **~1 s** desde que se guarda un lote en Webflow hasta que se ve en la app. Si el CMS no responde, se usa la última carta guardada o la local.
- **Variables de entorno:** `OPENAI_API_KEY` y `WEBFLOW_API_TOKEN` (token del sitio con lectura de CMS) son secretos del entorno; `OPENAI_MODEL` y `WEBFLOW_COLLECTION_ID` son opcionales. Nunca se guardan en el repo.
- Los bindings se declaran en `wrangler.json`. Si la app corre fuera del runtime de Workers, las API caen a memoria.

## Estructura

```
src/app/page.tsx                 portada y armado de la página
src/app/components/Historia.tsx  historia, saco que se ata, molinillo
src/app/components/three/*       granos, tostador y taza (Three.js)
src/app/components/MapaAltura.tsx
src/app/components/Carta.tsx     sacos, ficha, comparador, me gusta
src/app/components/Pedido.tsx    quiz, tarjeta para compartir, barista
src/app/components/Laboratorio.tsx  pestañas de las herramientas con IA
src/app/components/RutaCafe.tsx  Ruta del café (+ MapaRuta.tsx)
src/app/components/ComoEstaHecho.tsx
src/app/api/*                    recomendar, barista, megusta, cafes, pedido,
                                 escanear, ruta, ruta/mapa, carta/version, webflow/cambio
src/lib/carta.ts                 carta desde el CMS de Webflow
src/lib/ruta.ts                  limpieza, ubicación y orden de la ruta
src/lib/cafes.ts                 datos de la carta (lotes de muestra)
DESIGN.md · PRODUCT.md           sistema de diseño y producto
```

## Calidad y CI/CD

- **CD:** Webflow Cloud despliega `main` automáticamente en cada push.
- **CI (GitHub Actions, `.github/workflows/ci.yml`):** en cada push y PR corre lint, chequeo de tipos, tests (Vitest) y build. En `main`, además espera el deploy y hace una prueba de humo de las rutas y la API en producción.
- **Tests (`tests/logica.test.ts`, 21):** recomendador, etapas del temporizador, normalización de la lectura con IA, recetas y calibración, perfil de "Arma tu café", validaciones, mapeo de ítems del CMS de Webflow, límites de seguridad, IP real del visitante, datos estructurados y la Ruta del café (fuentes, paradas lejanas y orden para caminar).

```bash
npm run lint && npm run typecheck && npm test
```

## Seguridad

- **Secretos** solo del lado del servidor (variables secretas de Webflow Cloud); nada en el repo ni en el bundle del cliente.
- **IP real del visitante** desde `x-wf-clientip` (la pone Webflow Cloud); nunca el primer valor de `X-Forwarded-For`, que el visitante puede falsificar (probado en producción).
- **Límites** atómicos en SQLite por visitante y **topes diarios globales** para lo que cuesta dinero (IA); si la base falla, caen a memoria y la ruta sigue funcionando.
- **Tamaño máximo de cuerpo** en todas las API (413 antes de parsear).
- **Headers:** CSP, `frame-ancestors 'none'`, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, HSTS y `Permissions-Policy` (`next.config.ts`).
- Sin CORS abierto; `dangerouslySetInnerHTML` solo para el JSON-LD, con `<` escapado; la entrada de usuario se valida y se sanea en el servidor.

## Desarrollo local

```bash
npm install
npm run dev
```

Para usar el barista en local, crea `.env.local` a partir de `.env.example` con tu `OPENAI_API_KEY`.

## Buscadores

Datos estructurados schema.org (JSON-LD): `WebSite`, `WebApplication` y la carta como `ItemList`, con los lotes marcados como muestras ficticias y sin precio (`src/lib/datosEstructurados.ts`).

## Rendimiento

Las escenas 3D arrancan solo cuando están por verse, se pausan fuera de pantalla, compilan sus shaders en segundo plano y, en celulares, usan un material más liviano, menos granos, menos polígonos y sin antialias.

## Accesibilidad

Sin errores en la revisión automática con axe (WCAG 2 A y AA) en escritorio y celular. Todas las animaciones respetan `prefers-reduced-motion`. El contenido del 3D también está disponible como texto y como botones: la escala de altitudes, las fichas y el quiz se pueden usar con teclado.
