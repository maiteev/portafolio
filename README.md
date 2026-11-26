# ma!te — Portafolio

Portafolio personal de **ma!te**, diseñadora industrial: quién soy, qué hago, qué me interesa y qué he construido.

**Sitio publicado:** https://maiteev.github.io/portafolio/

---

## Contenido

| Página | Archivo | Qué contiene |
|---|---|---|
| Landing | `index.html` | Portada `ma!te` → About me → Proyectos (mazo interactivo) → pura maña (emprendimiento + carrusel) → Contacto |
| About me | `about.html` | Manifiesto, de dónde vengo, cómo trabajo, disciplinas y herramientas, intereses, trayectoria y contacto |
| Proyectos | `proyectos/*.html` | Una subpágina por proyecto: nombre, descripción, repositorio, link a GitHub Pages y video |

### Proyectos

Están organizados en dos categorías, cada una con su propio mazo interactivo.

**01 — Diseño de Productos** (proyectos físicos: imágenes + planimetrías en PDF)

| Proyecto | Materiales | Página | Planimetrías |
|---|---|---|---|
| Banca Estructural (con Acevedo, Lavalle y Toro) | Junquillos de madera 19 × 19 mm | `proyectos/banca-estructural.html` | `assets/pdf/banca-estructural-planimetrias.pdf` |
| jüko (con Belén Castillo, Martina Fernández y Ma. Ignacia Zamudio) | Junquillos de madera 19 × 19 mm, papel de acuarela | `proyectos/juko.html` | `assets/pdf/juko-planimetrias.pdf` |
| ZETA | Sheet metal plegado negro mate, madera | `proyectos/zeta.html` | `assets/pdf/zeta-planimetrias.pdf` |
| Golondrina Chilena (con Belén Castillo, Martina Fernández y Ma. Ignacia Zamudio) | Pino, roble, chapa de madera, impresión 3D, acrílico | `proyectos/golondrina-chilena.html` | `assets/pdf/golondrina-chilena-planimetrias.pdf` |

**02 — Interacción Digital** (demo en vivo en GitHub Pages + código en GitHub + video)

| Proyecto | Tecnologías | Demo | Código |
|---|---|---|---|
| Gestos Justin | Python, MediaPipe, visión artificial | [demo](https://maiteev.github.io/gestos-justin-/) | [repo](https://github.com/maiteev/gestos-justin-) |
| No solo lo intencional se nota | JavaScript, MediaPipe Hands, OpenCV | [demo](https://maiteev.github.io/No-solo-lo-intencional-se-nota/) | [repo](https://github.com/maiteev/No-solo-lo-intencional-se-nota) |
| Misma Tierra | HTML, CSS, JavaScript, Web Audio API | [demo](https://maiteev.github.io/Misma-tierra-/) | [repo](https://github.com/maiteev/Misma-tierra-) |
| Pesca tacto | Sensores de movimiento, interacción táctil, WebSockets | [demo](https://maiteev.github.io/pesca-tacto-/juego.html) | [repo](https://github.com/maiteev/pesca-tacto-) |


---

## Cómo está construido

Es un sitio estático con **HTML, CSS y JavaScript sin librerías ni proceso de compilación**. GitHub Pages publica los archivos tal como están en la rama `main`, así que lo que ves en el repositorio es exactamente lo que se ve en la web.

```
portafolio/
├── index.html              Landing
├── about.html              About me
├── proyectos/              Una subpágina por proyecto
│   ├── banca-estructural.html  juko.html  zeta.html  golondrina-chilena.html
│   └── gestos-justin.html  no-solo-lo-intencional-se-nota.html  misma-tierra.html  pesca-tacto.html
├── assets/
│   ├── css/style.css       Sistema gráfico (variables) y estilos
│   ├── js/main.js          Ondas del hero y transición caos → orden
│   ├── img/                Portadas, galería, retrato, piezas de pura maña y favicon
│   ├── video/              Videos de los proyectos digitales (.mp4, comprimidos a 1280 px)
│   ├── pdf/                Planimetrías de los proyectos de producto
│   └── cv/cv.pdf           CV en PDF
├── .nojekyll               Le dice a GitHub Pages que no procese el sitio con Jekyll
└── README.md
```

### Del repositorio a la web

1. El código vive en el repositorio `portafolio` de mi GitHub.
2. En **Settings → Pages**, la fuente es *Deploy from a branch → `main` / root*.
3. Cada `git push` a `main` vuelve a publicar el sitio en `https://maiteev.github.io/portafolio/`.
4. Cada proyecto del curso tiene su propio repositorio con Pages activo, y el portafolio enlaza a esas URLs.
5. Todas las rutas internas son **relativas** (`assets/...`, `../assets/...`) para que funcionen dentro de la subcarpeta `/portafolio/`.

---

## Sistema gráfico

Todo el sistema está definido como variables en `assets/css/style.css` (`:root`).

- **Tipografía:** Inter (grotesca) en pesos 400, 500, 700 y 900: Regular para el bloque del hero y Black para los titulares (tracking −0.02em). Los textos de lectura usan tracking normal e interlineado 1,65 e interlineado compacto (0.8–0.9 en los display). Una sola familia, con jerarquía construida por peso y tamaño.
- **Color:** blanco `#FFFFFF` y negro `#0A0A0A`, con un gris `#E5E5E5` para las líneas de 1 px. El único color de la interfaz es el **azul `#0005DC`**, sacado del fondo de mi retrato y usado en todos los títulos (About me, Proyectos, pura maña, Contacto y el nombre de cada proyecto) para que la gráfica tenga una sola línea. El resto del color lo ponen los proyectos.
- **Grilla:** 12 columnas con márgenes y medianil fluidos (`clamp`). Composición asimétrica de 4 + 7 columnas en las secciones de texto y una grilla de 3 × 2 para los proyectos.
- **Imagen:** fotografías y renders a sangre dentro de su módulo. El retrato es una imagen low-poly sobre fondo azul: es el único bloque de color fuerte fuera de los proyectos.
- **Movimiento:** curvas `ease-out` (`cubic-bezier(.16,1,.3,1)`) y resortes:
  - **Hero:** `ma!te` se repite 4 o 5 veces por fila (3 en el teléfono) en filas idénticas, centradas, con un espacio de una letra entre palabras y tracking de −0.03em, formando una textura tipográfica compacta en Inter Regular. Cada letra es un `<span>`. Dentro de un radio de 170 px alrededor del cursor, las letras se encogen (hasta `scale(0.38)` justo debajo del puntero) y se apartan en dirección opuesta, como si cedieran espacio. Mientras se retraen pasan del negro al azul del retrato: es el primer anticipo del color del sitio. Al alejarse el cursor vuelven a `scale(1)` y `translate(0,0)` con interpolación (`lerp`) en `requestAnimationFrame`. En el teléfono se agregan filas idénticas hasta llenar la pantalla, y el efecto responde al arrastrar el dedo.
  - **Proyectos:** en reposo, las tarjetas de cada categoría forman un mazo en abanico al centro que flota y se inclina con el cursor (parallax). Cuando la galería entra en pantalla (IntersectionObserver), se despliegan solas con física de resorte en una grilla tipo mosaico con márgenes mínimos: 2 × 2 si hay 4 proyectos, en fila si hay 3 y en 3 columnas si hay 5 o más. Al salir de la pantalla se recogen, así la animación se repite al volver. Un clic en una tarjeta abre su detalle.
  - **Videos:** en los proyectos digitales, la tarjeta y el modal parten con una captura, y el video de la experiencia queda al final de la galería (`<video autoplay loop muted playsinline>`). En el modal el video se muestra completo y en bucle, y en la subpágina tiene controles para activar el sonido. Se comprimieron con ffmpeg (H.264, 1280 px) de unos 14 MB a unos 1 MB cada uno.
  - **Modal de proyecto:** con el mazo desplegado, un clic en una tarjeta abre un panel con la galería de imágenes y miniaturas, el año, la categoría, los materiales y herramientas, el contexto, la descripción y los enlaces. En los productos el enlace es la descarga de planimetrías; en los digitales, *Probar demo en vivo* y *Ver código en GitHub*. Desde ahí se puede ir a la página completa del proyecto. Se cierra con *Cerrar*, con Esc o con un clic fuera del panel.
  - **pura maña:** anillo 3D de 7 piezas impresas en 3D en 4:5, basado en el [Carousel de Bencho](https://bencho.dev/blocks/carousel) (MIT) y recreado en JavaScript simple porque el original es un componente de React. Las tarjetas del fondo se achican (`depth`), flotan en reposo (`float`) y se inclinan y hunden bajo el cursor (`sink`). El anillo se arrastra o se lanza con mouse o dedo, se frena solo (`settle`) y se acomoda en la pieza más cercana. Un clic en una pieza lateral la trae al frente, y también avanza con las flechas ← → o con el teclado. Debajo se muestra el pie de foto de la pieza del frente. Los parámetros están al inicio de `initRing()` en `main.js`.
  - **Retrato (About me), 2.5D:** recorté mi figura del fondo azul del retrato low-poly y armé dos capas en perspectiva CSS: atrás un panel azul y adelante la figura, 90 px más cerca (`translateZ`). Al mover el cursor el conjunto se inclina hacia él y la figura se desplaza más que el fondo, como si saliera del cuadro; sin cursor flota suavemente. La figura está en un `<canvas>`: al pasar el cursor, sus píxeles se deforman como ojo de pez y se estiran con el movimiento, y vuelven a su forma con `lerp`.
  - **Inicio:** la página siempre parte en la portada. Los enlaces del menú bajan con scroll suave sin dejar el `#ancla` en la dirección, y se desactiva la restauración automática del scroll del navegador.
  - Con *movimiento reducido* activado en el sistema, los proyectos se muestran directo en grilla.

---

## Créditos y fuentes

| Componente | Autor / fuente | Cómo lo adapté |
|---|---|---|
| Tipografía Inter | Rasmus Andersson · [Google Fonts](https://fonts.google.com/specimen/Inter) · OFL | Pesos 400–900 y tracking negativo |
| Estilo low-poly del retrato | [Endless Tools](https://app.endlesstools.io/project/1b8d228b-da94-4e83-90b6-0617256556fe) | Retrato generado con su herramienta; en el sitio se le agregó la deformación líquida en canvas |
| [Carousel — Bencho](https://bencho.dev/blocks/carousel) · MIT | bencho.dev | Recreado en JS simple (sin React) con los mismos parámetros; se agregaron flechas, teclado, clic para traer al frente y pie de foto |

---

## Cómo cambiar el retrato

1. El retrato está en `assets/img/retrato-figura.png`: la figura recortada, con fondo transparente. El azul de atrás no es parte de la imagen, es el panel `.p3d-back` del CSS.
2. Si cambias la imagen, mantén el fondo transparente y actualiza `width`/`height` del `<canvas>` y el `aspect-ratio` de `.portrait-3d`.
3. La deformación lee los píxeles del canvas, así que **funciona con servidor** (GitHub Pages, o *Live Server* en VS Code). Si abres `index.html` haciendo doble clic (`file://`), el navegador bloquea esa lectura: se mantiene el 3D, pero sin la deformación.

## Cómo agregar un proyecto

1. Copia una página de `proyectos/` y cámbiale el nombre (por ejemplo `proyectos/nuevo.html`).
2. Edita el nombre, la descripción, los links y las rutas del video y las imágenes.
3. Agrega su tarjeta en `index.html` dentro de `<div class="stage">`.
4. Actualiza los links *Anterior / Siguiente* de las páginas vecinas.

## Herramientas

VS Code · Git y GitHub · GitHub Pages · [Figma / Illustrator] · [Rhino / KeyShot / Fusion 360]
