---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: []
---

Scope: home route `/` (story + carta + quiz + barista). Visitor mode: experience. Seed key: 916969ea.
Audience: specialty-coffee enthusiasts; job: understand and pick a lot, leave with grind + recipe.

## Direction contract
THESIS: Coffee as an export lot, not a café mood. The page follows one green-coffee lot from plant to cup and the menu is a wall of stenciled sacks. Refuses: cream ground + serif + terracotta café, and dark moody bean photography.
OWN-WORLD: Jute/burlap field (woven texture via SVG pattern, not beige flat), stencil ink as the working colour: each origin owns one saturated ink (Etiopía cobalt, Colombia verde bandera, Kenia rojo, Guatemala violeta, Brasil amarillo, Panamá naranja). Stencil display face with bridges; condensed grotesk for lot data. Controls are stamped rectangles with ink edges; active = filled ink.
STORY: Planta → cereza → cosecha → proceso → secado → trilla y saco → tueste → molienda → taza. Each stage teaches one variable that the ficha repeats.
FIRST VIEWPORT: A full-bleed sack face: "ALTURA" stencil, lot code, origin, altitude, process — the sack IS the hero. Primary actions: "Seguir el lote" and "Ver la carta".
SIGNATURE: As you scroll, the sack gets stamped stage by stage (ink stamps land with a thud-like scale/opacity settle); in the carta, clicking a sack flips it into its full ficha; the molienda stage has a slider that visibly changes particle size and names the brew method.
RISK: Jute can read rustic-kitsch; keep the grid strict (Hoffmann raise), type huge and precise, texture subtle.
Raises: axial sequenced reveals (from Versailles); one control transforms the object (from cape: grind slider); lot colourway logic (from kit: each lot's ink recolours the ficha); stamped gauges with settle ballistics for acidez/cuerpo/dulzor (from VU bridge); strict square-unit grid for the sack wall (from Hoffmann).
Constraints: fictional lots labelled "lotes de muestra, ficticios"; prefers-reduced-motion disables stamps; Spanish neutral.

## Decisiones registradas tras la revisión final
- Campo de bodega: la carta, la ficha y el comparador viven sobre un fondo oscuro de bodega (#17140f) como contraste de ritmo con el yute; las tintas de lote usan una variante clara (`tintaClara`) sobre ese fondo para superar 3:1.
- Móvil (<860px): el saco estampándose se reemplaza por una tira fija de etapas y la caída de granos al saco se desactiva (el saco no está en pantalla). Omisión consciente por tiempo de hackathon; candidata a mejora: mini-saco de 56px en la tira.
