---
name: Altura
description: Café de especialidad contado como un lote de exportación, de la planta a la taza, con la ficha completa de cada lote.
colors:
  jute: "#b08a52"
  jute-deep: "#97723e"
  ink: "#1c1710"
  ink-soft: "#3b2f1e"
  bodega: "#17140f"
  bodega-2: "#221d16"
  bodega-line: "rgba(232, 214, 180, 0.14)"
  paper: "#efe4cf"
  paper-dim: "#c9b894"
  tinta-etiopia: "#1f4fd1"
  tinta-etiopia-clara: "#7a9bff"
  tinta-kenia: "#c8202f"
  tinta-kenia-clara: "#ff6b76"
  tinta-panama: "#e5601c"
  tinta-panama-clara: "#ff9a5c"
  tinta-colombia: "#0f7a3a"
  tinta-colombia-clara: "#4fcf7e"
  tinta-guatemala: "#6b2fb3"
  tinta-guatemala-clara: "#bb95f5"
  tinta-brasil: "#d9a90b"
  tinta-brasil-clara: "#f2c94c"
  error: "#8a1a12"
typography:
  display:
    fontFamily: "Big Shoulders Stencil, sans-serif"
    fontSize: "clamp(80px, 20vw, 240px)"
    fontWeight: 900
    lineHeight: 0.82
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Big Shoulders Stencil, sans-serif"
    fontSize: "clamp(44px, 8vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "0.01em"
  title:
    fontFamily: "Big Shoulders Stencil, sans-serif"
    fontSize: "clamp(40px, 6vw, 72px)"
    fontWeight: 900
    lineHeight: 0.92
    letterSpacing: "0.01em"
  lede:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(26px, 3.6vw, 44px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  bajada:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.04em"
    fontFeature: "tnum"
  button:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(16px, 4vw, 56px)"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  seccion: "clamp(72px, 10vw, 140px)"
components:
  sello:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  sello-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  sello-lleno:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  sello-bodega:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.none}"
    padding: "14px 22px"
  sello-bodega-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.bodega}"
  filtro:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
  filtro-activo:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.bodega}"
  opcion:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
  opcion-marcada:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.jute}"
  ficha:
    backgroundColor: "{colors.bodega-2}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  campo-barista:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "12px"
---

# Design System: Altura

## Overview

**Creative North Star: "El lote de exportación"**

Altura trata el café como un saco de café verde que viaja, no como el ambiente de una cafetería. Todo el sistema sale de dos materiales: el yute del saco (un campo tejido, nunca un beige plano) y la tinta de estarcido con la que se marca el lote. La tipografía es la del esténcil y la de la etiqueta de carga: una display con puentes de plantilla, grande y precisa, y una grotesca condensada para los datos del lote, siempre en mayúsculas y con cifras tabulares.

El ritmo alterna dos campos. Arriba y abajo, el yute con tinta casi negra. En el centro, la bodega: un fondo oscuro donde viven la carta, la ficha y el comparador, y donde las tintas de lote pasan a su variante clara. Cada lote es dueño de una tinta saturada y esa tinta recolorea todo lo que le pertenece: el borde del saco, los medidores, las notas, la marca de molienda y el título de la ficha.

La densidad es de ficha técnica: retículas estrictas, divisores de tinta de 2 a 3px, cero radios. La textura se mantiene sutil (trama de 6px a baja opacidad) para que el yute no caiga en lo rústico. Se rechazan explícitamente la cafetería de fondo crema con serif y terracota, y la fotografía oscura y dramática de granos.

**Key Characteristics:**
- Campo de yute tejido con tinta casi negra; bodega oscura como contrapunto para la carta.
- Una tinta saturada por lote, con variante clara para el fondo de bodega.
- Display esténcil enorme; datos en condensada mayúscula con cifras tabulares.
- Controles como sellos rectangulares con borde de tinta; activo = tinta llena.
- Esquinas rectas en todo; la profundidad sale de la tinta y de la sombra física del saco, no de tarjetas elevadas.

## Colors

Tierra de saco y tinta de embarque: un campo cálido de yute, una tinta casi negra que hace todo el trabajo de texto, y seis tintas de origen saturadas que solo aparecen como marca de lote.

### Primary
- **Tinta de embarque** (ink): el color de trabajo. Texto, bordes de sello, divisores de la retícula, silueta del saco, trazos de las ilustraciones y anillo de foco sobre yute. Sobre yute alcanza 5,6:1.

### Secondary
- **Tintas de origen** (tinta-etiopia cobalto, tinta-kenia rojo, tinta-panama naranja, tinta-colombia verde bandera, tinta-guatemala violeta, tinta-brasil amarillo): cada lote tiene exactamente una. Se usan llenas como fondo de la etiqueta de lote sobre el saco (texto blanco o tinta según su luminancia; todas las combinaciones superan 4,5:1), como borde del saco en la pared de la carta y como color de las estampas del saco en la historia. Etiopía es la tinta por defecto de la portada y la historia porque ese es el lote que se sigue.
- **Tintas claras de origen** (las variantes `-clara`): la misma tinta levantada para el campo de bodega, donde superan 6:1 sobre la ficha. Recolorean el título de la ficha, los medidores, el borde de las notas, la marca de molienda, el resultado del cuestionario y las referencias de lote en el chat del barista.

### Neutral
- **Yute** (jute): fondo de página, barra de navegación y relleno de los sacos en la pared. Siempre con la trama tejida encima.
- **Yute tostado** (jute-deep): pistas de los deslizadores, lienzo de partículas de molienda y lienzo del tostador 3D; también la pista de la barra de scroll.
- **Tinta gastada** (ink-soft): pulgar de la barra de scroll y texto secundario. No alcanza 4,5:1 sobre yute (4,1:1); ver Don'ts.
- **Bodega** (bodega): fondo de la sección de la carta.
- **Bodega interior** (bodega-2): superficie de la ficha abierta, un escalón más claro que la bodega.
- **Hilo de bodega** (bodega-line): divisores y bordes en reposo dentro de la bodega y del barista.
- **Papel de embarque** (paper): texto sobre bodega y sobre el bloque de tinta del barista; relleno de sellos activos en fondo oscuro; burbuja del visitante en el chat.
- **Papel gastado** (paper-dim): texto secundario en fondo oscuro (bajada de la carta, términos de las tablas de datos, títulos de bloque de la ficha, bordes de medidores vacíos y del campo de texto). Supera 8,5:1 en todas las superficies oscuras.
- **Rojo de rechazo** (error): borde del aviso de error sobre yute.

### Named Rules
**La Regla de Una Tinta por Lote.** Cada lote posee una sola tinta y todo lo que le pertenece la hereda a través de `--lote`. Nunca se mezclan dos tintas de origen en el mismo elemento; el comparador es el único lugar donde dos tintas conviven, cada una en su propia columna.

**La Regla del Campo.** Sobre yute, las tintas de origen son marca: estampas, bordes y rellenos detrás de texto. Las estampas llevan palabras en esténcil, pero son sellos decorativos que repiten lo que ya dice el texto de la etapa; ningún contenido de lectura se escribe en tinta de origen sobre yute, porque ninguna llega a 2,5:1. Sobre bodega se usa siempre la variante clara.

**La Regla de la Bodega.** La carta, la ficha y el comparador viven en fondo oscuro de bodega; el resto de la página vive en yute. No se inventan campos intermedios.

## Typography

**Display Font:** Big Shoulders Stencil (con sans-serif), pesos 700 y 900
**Body Font:** Barlow (con system-ui, sans-serif), pesos 400 a 600
**Label/Mono Font:** Barlow Condensed (con sans-serif), pesos 500 a 700

**Character:** La display es la plantilla de esténcil del saco, con puentes visibles, siempre en mayúsculas y apretada. La condensada es la etiqueta de carga: mayúsculas espaciadas, cifras tabulares, hecha para códigos de lote, altitudes y puntajes. Barlow sostiene la lectura larga sin competir con ninguna de las dos.

### Hierarchy
- **Display** (900, clamp(80px, 20vw, 240px), 0.82): solo la marca ALTURA en la cara del saco de la portada.
- **Headline** (900, clamp(44px, 8vw, 6rem), 0.92): títulos de sección (historia, carta, cuestionario). El nombre de origen en la ficha usa la misma voz a clamp(44px, 7vw, 5.5rem) en la tinta clara del lote.
- **Title** (900, clamp(40px, 6vw, 72px), 0.92): nombre de cada etapa de la historia. Los puntajes SCA y los títulos del comparador y del resultado del cuestionario usan esta voz entre 28px y 72px.
- **Lede** (Barlow Condensed 700, clamp(26px, 3.6vw, 44px), 1.05, mayúsculas, máx. 22ch, `text-wrap: balance`): el h1 de la portada, debajo de la marca.
- **Body** (Barlow 400, 17px, 1.55): texto corrido, con medida de 58 a 60ch en la historia.
- **Bajada** (Barlow 400, 19px, 1.55, máx. 60ch): introducción de cada sección.
- **Label / dato** (Barlow Condensed 600, 13 a 22px, 0.04em, mayúsculas, cifras tabulares): códigos de lote, términos y valores de las tablas, títulos de bloque de la ficha, navegación, etiquetas de medidores, tira de etapas. Las unidades (msnm, µm) conservan minúsculas.
- **Button** (Barlow Condensed 700, 18px, 0.08em, mayúsculas): sellos.

### Named Rules
**La Regla del Esténcil.** La display esténcil es para nombres (marca, secciones, etapas, orígenes, métodos) y cifras protagonistas (puntaje SCA). Nunca para párrafos ni para datos tabulados.

**La Regla del Dato.** Todo dato del lote (código, altitud, proceso, dosis, temperatura) va en la condensada mayúscula con cifras tabulares, para que la historia y la ficha compartan el mismo vocabulario visual.

## Layout

Retícula estricta y centrada. El contenido de sección se limita a 1180px; la cara del saco de la portada a 1320px. El margen lateral es un solo valor fluido (gutter) y las secciones respiran con un padding vertical fluido (seccion) de 72 a 140px. Los espacios internos se toman de una escala corta de 4, 8, 12, 16 y 24px.

- **Portada:** a sangre, alto de viewport menos la barra; la silueta del saco envuelve el bloque, la estampa del puntaje se apoya arriba a la derecha girada -6°, y los datos del lote forman una fila de celdas con divisores de tinta que se reordena en dos columnas bajo 720px.
- **Historia:** dos columnas (5fr saco fijo, 7fr etapas); cada etapa ocupa 78svh y se atenúa a 0,35 fuera de foco. Bajo 860px pasa a una columna y el saco se reemplaza por una tira fija de etapas bajo la barra de navegación.
- **Carta (pared de sacos):** retícula de relleno automático de módulos de 170px mínimo, proporción 3:4, separación de 12px. La ficha usa una retícula de 12 columnas en tres bloques de 4 (origen, en taza, sensorial) más recetas a lo ancho; bajo 900px cada bloque ocupa las 12.
- **Tu café:** dos columnas iguales (planilla y barista fijo); una columna bajo 900px.
- **Breakpoints observados:** 640px (navegación compacta, comparador), 720px (portada), 860px (historia), 900px (ficha y pedido).

## Elevation & Depth

El sistema es plano y trabaja por contraste de campo (yute contra bodega) y por divisores de tinta. La única sombra real es física: los sacos de la pared de la carta proyectan una sombra difusa sobre el piso oscuro de la bodega y se levantan al pasar el cursor con una inclinación 3D que sigue al puntero y un brillo radial. La portada y la historia agregan profundidad con granos 3D que caen detrás del contenido, sin tocar la legibilidad.

### Shadow Vocabulary
- **Saco en reposo** (`filter: drop-shadow(0 14px 16px rgba(0, 0, 0, 0.55))`): sacos de la pared de la carta.
- **Saco levantado** (`filter: drop-shadow(0 24px 22px rgba(0, 0, 0, 0.7))`): el mismo saco al pasar el cursor, con `translateZ(24px)`.

### Named Rules
**La Regla del Objeto Físico.** Solo los objetos físicos (sacos) proyectan sombra, y siempre difusa sobre fondo oscuro. Paneles, fichas, sellos y formularios son planos y se separan con bordes.

## Shapes

Esquinas rectas en todo (0px): sellos, filtros, opciones, notas, medidores, fichas, burbujas del chat y pulgares de los deslizadores. La única curva del sistema es la silueta del saco: cuerpo con hombros redondeados y una costura punteada (trazo discontinuo 10/8 en portada, 6/5 en la pared). Los bordes tienen tres pesos con significado: 3px para contenedores y sellos sobre yute, 2px para divisores y controles secundarios, 1px discontinuo para avisos y sugerencias (lo provisional). Las estampas son rectángulos o anillos de tinta con un filtro de ruido que simula tinta gastada.

## Components

### Buttons (sellos)
Sellos de tinta: rectángulos de borde grueso que se llenan al activarse.
- **Shape:** esquinas rectas (0px), borde de 3px en tinta.
- **Primary (sello lleno):** fondo tinta, texto papel, 14px por 22px; al pasar el cursor se llena con la tinta del lote activo.
- **Secundario (sello):** fondo transparente, borde y texto tinta; al pasar el cursor se llena de tinta con texto papel.
- **Sobre fondo oscuro:** borde y texto papel; al pasar el cursor o activo, fondo papel con texto oscuro.
- **Hover / Focus:** transición de 0,2s con la curva de salida del sistema; al presionar, `scale(0.97)`. Foco: contorno de 3px en tinta (papel en bodega) desplazado 3px.
- **Disabled:** opacidad 0,45 y cursor no permitido.

### Chips (filtros, opciones, notas)
- **Filtros de la carta:** borde de 2px en hilo de bodega, texto papel en condensada 600; activo (`aria-pressed`) se llena de papel. En el comparador, el filtro activo se llena con la tinta clara de su lote.
- **Opciones del cuestionario:** borde de 2px en tinta sobre yute; marcada se llena de tinta con texto yute.
- **Notas de cata:** borde de 2px en la tinta clara del lote, condensada 18px; no son interactivas.
- **Marca de molienda:** bloque lleno con la tinta clara del lote y texto tinta.

### Cards / Containers
- **Corner Style:** rectas (0px).
- **Ficha:** superficie bodega interior, borde de 2px en hilo de bodega, bloques separados por divisores del mismo hilo; entra girando desde el borde izquierdo (`rotateY(-90deg)` a plano, 0,8s).
- **Planilla del cuestionario:** borde de 3px en tinta sobre yute, padding fluido de 20 a 32px.
- **Resultado y barista:** bloques llenos de tinta con texto papel; el título del resultado toma la tinta clara del lote recomendado.
- **Shadow Strategy:** ninguna; ver Elevation & Depth.

### Inputs / Fields
- **Deslizadores (molinillo, tostador):** pista de yute tostado con borde de tinta de 2px, pulgar rectangular de tinta de 14 por 28px.
- **Campo del barista:** borde de 2px en papel gastado, fondo transparente, texto y cursor papel, 12px de padding.
- **Error:** borde de 2px en rojo de rechazo con fondo del mismo rojo al 12% sobre yute; dentro del barista, la versión clara del mismo aviso.

### Navigation
Barra fija sobre yute con borde inferior de tinta de 2px. Marca en esténcil de 26px; enlaces en condensada de 15px con borde transparente de 2px que aparece en tinta al pasar el cursor. Bajo 640px solo quedan los dos primeros enlaces.

### Saco (componente firma)
La silueta del saco es el objeto del sistema. En la portada es la cara del saco que enmarca el lote; en la historia es un saco fijo que recibe una estampa por etapa (cada estampa cae desde `scale(1.35)` a su lugar con opacidad, 0,35 a 0,45s); en la carta es la pared de sacos, cada uno con relleno yute, borde de su tinta, etiqueta de lote llena y nombre de origen en esténcil. Al abrir un saco, su borde engrosa a 6px y la ficha aparece debajo.

### Medidor sensorial
Cinco celdas rectangulares con borde de papel gastado; las llenas toman la tinta clara del lote y se asientan con un rebote vertical escalonado (`scaleY` 0,2 a 1,12 a 1, 60ms entre celdas).

## Do's and Don'ts

### Do:
- **Do** asignar a cada lote nueva una tinta de origen y su variante clara, y propagarla con `--lote` a todo lo que le pertenece.
- **Do** mantener la trama tejida sobre todo campo de yute, a baja opacidad (trama de 6px, hilos al 16% y 9%).
- **Do** usar la tinta clara del lote sobre bodega y verificar al menos 3:1 para marcas y 4,5:1 para texto.
- **Do** separar paneles con bordes de tinta de 2 a 3px sobre yute y con hilo de bodega sobre fondo oscuro.
- **Do** desactivar estampas, giros de ficha, asentamiento de medidores y granos 3D con `prefers-reduced-motion`; el contenido debe leerse igual sin movimiento.
- **Do** usar la curva de salida del sistema (`cubic-bezier(0.16, 1, 0.3, 1)`) para toda transición de estado.

### Don't:
- **Don't** usar fondo crema, serif y terracota de cafetería, ni fotografía oscura y dramática de granos.
- **Don't** escribir contenido de lectura en tinta de origen sobre yute; ninguna llega a 2,5:1. Las estampas del saco quedan fuera de esta regla porque son marca y repiten texto ya presente.
- **Don't** usar tinta gastada ni opacidades reducidas para texto de lectura sobre yute; ambas quedan por debajo de 4,5:1.
- **Don't** redondear esquinas; la única curva es la silueta del saco.
- **Don't** agregar sombras a paneles, fichas ni sellos; solo los sacos proyectan sombra.
- **Don't** agregar rótulos sobre los títulos de sección; el título en esténcil abre cada sección solo.
