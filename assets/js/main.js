/* =========================================================
   ma!te — Portafolio · interacciones
   1. Header, apariciones y copiar correo
   2. Hero: letras que se retraen y apartan del cursor
   3. Proyectos: mazo que se despliega en grilla
   4. pura maña: anillo 3D (recreación del Carousel de Bencho)
   5. Retrato 2.5D: capas en perspectiva + deformación líquida en canvas
   6. Modal con el detalle de cada proyecto
   JavaScript sin librerías: todo se puede explicar línea a línea.
   ========================================================= */
(() => {
  document.documentElement.classList.add('js');

  /* ---------- 0. Siempre partir en la portada ----------
     El navegador recuerda la posición del scroll y el #ancla de la dirección
     (por ejemplo #about después de usar el menú). Al abrir la página desde afuera
     se parte arriba, en la portada ma!te. Solo se respeta el #ancla cuando
     se llega desde otra página del mismo sitio (ej.: "← Proyectos" de un proyecto). */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const fromSameSite = document.referrer && new URL(document.referrer).origin === location.origin
    && new URL(document.referrer).pathname !== location.pathname;
  if (location.hash && !fromSameSite) {
    history.replaceState(null, '', location.pathname + location.search);
    scrollTo(0, 0);
  } else if (!location.hash) {
    scrollTo(0, 0);
  }

  // Los enlaces internos (#about, #proyectos…) bajan con scroll suave sin dejar el #ancla en la dirección
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    e.preventDefault();
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    else scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  /* ---------- 1. Header, apariciones y copiar ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copiado ✓';
      } catch {
        btn.textContent = 'No se pudo copiar';
      }
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });

  /* ---------- 2. Hero: retracción magnética ---------- */
  function initWave() {
    const wave = document.querySelector('[data-wave]');
    if (!wave) return;

    const WORD = 'ma!te';
    const GAP_EM = .25;        // espacio entre palabras: más o menos el ancho de una letra
    const RADIUS = 160;        // radio de influencia del cursor (px)
    const MIN_SCALE = .38;     // escala justo debajo del cursor
    const PUSH = 30;           // cuánto se apartan las letras (px)
    const EASE = .12;          // suavidad del regreso (lerp)
    let chars = [], items = [];

    // Crea una palabra con cada letra en su propio <span>
    const makeWord = () => {
      const w = document.createElement('span');
      w.className = 'w';
      [...WORD].forEach(c => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        w.appendChild(s);
      });
      return w;
    };
    // Construye filas idénticas: todas las palabras quedan alineadas en columnas
    const build = (rows, perRow) => {
      wave.textContent = '';
      for (let r = 0; r < rows; r++) {
        const row = document.createElement('div');
        row.className = 'wave-row';
        for (let k = 0; k < perRow; k++) row.appendChild(makeWord());
        wave.appendChild(row);
      }
      chars = [...wave.querySelectorAll('.ch')];
    };

    // Calcula cuántas palabras por fila, el tamaño de letra y cuántas filas caben
    const fit = () => {
      const cs = getComputedStyle(wave);
      const avail = wave.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const perRow = avail < 640 ? 3 : avail < 1100 ? 4 : 5;
      build(1, 1);
      wave.style.setProperty('--wave-fs', '100px');
      const wordW = wave.querySelector('.w').getBoundingClientRect().width / 100;   // ancho de una palabra por px de fuente
      const fs = avail / (perRow * wordW + GAP_EM * (perRow - 1));
      const usableH = wave.clientHeight * .94;
      const rows = Math.max(4, Math.min(16, Math.floor(usableH / fs)));
      build(rows, perRow);
      wave.style.setProperty('--wave-fs', Math.min(fs, usableH / rows) + 'px');

      // Guarda el centro de reposo de cada letra
      const wr = wave.getBoundingClientRect();
      items = chars.map(el => {
        const r = el.getBoundingClientRect();
        return { el, x: r.left - wr.left + r.width / 2, y: r.top - wr.top + r.height / 2, s: 1, tx: 0, ty: 0 };
      });
    };
    fit();
    document.fonts && document.fonts.ready.then(fit);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 120); });

    if (reduced) return;

    const ptr = { x: -9999, y: -9999, active: false };
    const setPtr = (cx, cy) => {
      const r = wave.getBoundingClientRect();
      ptr.x = cx - r.left; ptr.y = cy - r.top; ptr.active = true;
    };
    wave.addEventListener('pointermove', e => setPtr(e.clientX, e.clientY));
    wave.addEventListener('pointerleave', () => (ptr.active = false));
    wave.addEventListener('touchmove', e => setPtr(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    wave.addEventListener('touchend', () => (ptr.active = false));

    let visible = true;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(wave);

    const tick = () => {
      requestAnimationFrame(tick);
      if (!visible) return;
      for (const it of items) {
        let ts = 1, ttx = 0, tty = 0;
        if (ptr.active) {
          const dx = it.x - ptr.x, dy = it.y - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS) {
            let f = 1 - d / RADIUS;            // 1 bajo el cursor, 0 en el borde del radio
            f = f * f * (3 - 2 * f);           // suavizado (smoothstep)
            ts = 1 - (1 - MIN_SCALE) * f;      // se encoge
            const nx = d ? dx / d : 0, ny = d ? dy / d : 0;
            ttx = nx * PUSH * f;               // se aparta en dirección opuesta al cursor
            tty = ny * PUSH * f;
          }
        }
        // Interpolación hacia el objetivo: retracción y regreso suave
        it.s = lerp(it.s, ts, EASE);
        it.tx = lerp(it.tx, ttx, EASE);
        it.ty = lerp(it.ty, tty, EASE);
        if (Math.abs(it.s - 1) < .0005 && Math.abs(it.tx) < .05 && Math.abs(it.ty) < .05 && ts === 1) {
          if (it.el.style.transform) { it.el.style.transform = ''; it.el.style.color = ''; }
          continue;
        }
        it.el.style.transform = `translate(${it.tx.toFixed(2)}px,${it.ty.toFixed(2)}px) scale(${it.s.toFixed(4)})`;
        // Mientras se retrae, la letra pasa del negro al azul del retrato (#0A0A0A → #0005DC)
        const m = clamp(((1 - it.s) / (1 - MIN_SCALE)) * 3);
        it.el.style.color = `rgb(${Math.round(lerp(10, 0, m))},${Math.round(lerp(10, 5, m))},${Math.round(lerp(10, 220, m))})`;
      }
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 3. Proyectos: mazo → grilla ---------- */
  function initWork() {
    if (reduced) return;
    // Cada categoría (Diseño de Productos, Interacción Digital) tiene su propio mazo
    document.querySelectorAll('[data-work]').forEach(setupDeck);
  }

  function setupDeck(section) {
    const stage = section.querySelector('[data-stage]');
    const cards = [...stage.querySelectorAll('[data-card]')];
    const hint = section.querySelector('[data-hint]');
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const n = cards.length;

    section.classList.remove('is-static');
    stage.classList.toggle('is-touch', !canHover);
    if (hint) hint.remove();   // ya no hace falta la instrucción: el mazo se abre solo

    let open = false, inView = false, layout = [];
    const st = cards.map(() => ({ x: 0, y: 0, r: 0, s: 1, rx: 0, ry: 0, vx: 0, vy: 0, vr: 0, vs: 0, vrx: 0, vry: 0, at: 0, init: false }));
    const par = { x: 0, y: 0, tx: 0, ty: 0 }; // parallax del mazo (-1 a 1)

    // Posiciones de la grilla (orden) y del mazo (reposo)
    const compute = () => {
      const w = stage.clientWidth;
      // Columnas según cantidad: 4 → 2×2 · 3 → 3 en fila · 5 o más → 3 columnas · teléfono → 2
      const cols = w < 700 ? Math.min(2, n) : (n === 4 ? 2 : Math.min(3, n));
      const rows = Math.ceil(n / cols);
      const gap = w < 700 ? 12 : 32;               // grilla limpia con aire entre tarjetas
      const cw = (w - gap * (cols - 1)) / cols;
      // Alto: celdas 4:3, sin pasar del alto disponible de la pantalla
      const maxH = Math.max(360, innerHeight - 160);
      const h = Math.min(maxH, rows * cw * .75 + gap * (rows - 1));
      stage.style.height = h + 'px';
      const ch = (h - gap * (rows - 1)) / rows;
      const deckScale = w < 700 ? .8 : .72;        // mazo más grande para distinguir cada pieza
      const mid = (n - 1) / 2;
      layout = cards.map((c, i) => {
        c.style.width = cw + 'px';
        c.style.height = ch + 'px';
        const k = i - mid;
        return {
          gx: (i % cols) * (cw + gap), gy: Math.floor(i / cols) * (ch + gap),
          cx: w / 2 - cw / 2 + k * cw * .1,
          cy: h / 2 - ch / 2 + Math.abs(k) * ch * .025,
          cr: k * 4.2 + (i % 2 ? 1.2 : -1.2),
          cs: deckScale,
          depth: 10 + i * 6,                        // cuánto reacciona al parallax
        };
      });
    };

    const setOpen = v => {
      if (v === open) return;
      open = v;
      const now = performance.now();
      // Escalonado: al abrir sale primero la de abajo; al cerrar vuelve primero la última
      cards.forEach((c, i) => (st[i].at = now + (v ? i : n - 1 - i) * 45));
      stage.classList.toggle('is-open', v);
      if (!v) stage.classList.remove('is-ordered');
    };

    // El cursor sobre el mazo también lo despliega
    if (canHover) stage.addEventListener('mouseenter', () => setOpen(true));
    // Parallax del mazo según la posición del cursor en la sección
    section.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      par.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      par.ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    });
    section.addEventListener('pointerleave', () => { par.tx = 0; par.ty = 0; });

    // Primer toque (o clic con el mazo cerrado) despliega; el segundo abre el proyecto
    stage.addEventListener('click', e => {
      if (!open) { e.preventDefault(); e.stopPropagation(); setOpen(true); return; }
      // Mazo desplegado: el clic abre el detalle en el modal (Cmd/Ctrl+clic abre la subpágina)
      const card = e.target.closest('[data-card]');
      if (card && window.openProjectModal && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        window.openProjectModal(card.dataset.id);
      }
    }, true);
    // Teclado: al enfocar una tarjeta se despliega
    stage.addEventListener('focusin', e => { if (e.target.matches(':focus-visible')) setOpen(true); });

    // Se despliega solo cuando la galería entra en pantalla, y se vuelve a juntar al salir.
    // Así, al volver a la sección, la animación del mazo se repite.
    let openTimer = 0;
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      clearTimeout(openTimer);
      if (e.intersectionRatio >= .45) openTimer = setTimeout(() => setOpen(true), 350);
      else if (!inView) setOpen(false);
    }, { threshold: [0, .45] }).observe(stage);
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; }).observe(section);

    // Resorte: K = rigidez, D = amortiguación (D < 1 deja un pequeño rebote elástico)
    const K = .085, D = .76;
    const spring = (s, key, target) => {
      const v = 'v' + key;
      s[v] = (s[v] + (target - s[key]) * K) * D;
      s[key] += s[v];
    };

    const t0 = performance.now();
    const frame = now => {
      requestAnimationFrame(frame);
      if (!inView) return;
      const t = (now - t0) / 1000;
      par.x = lerp(par.x, open ? 0 : par.tx, .08);
      par.y = lerp(par.y, open ? 0 : par.ty, .08);

      let ordered = open;
      cards.forEach((c, i) => {
        const L = layout[i], s = st[i];
        const grid = open ? now >= s.at : now < s.at;
        let tx, ty, tr, ts, trx, try_;
        if (grid) {
          tx = L.gx; ty = L.gy; tr = 0; ts = 1; trx = 0; try_ = 0;
        } else {
          const bob = Math.sin(t * 1.1 + i * 1.3) * 3;   // flotación sutil
          tx = L.cx + par.x * L.depth;
          ty = L.cy + par.y * L.depth * .6 + bob;
          tr = L.cr + par.x * 2;
          ts = L.cs;
          trx = -par.y * 9;
          try_ = par.x * 12;
        }
        if (!s.init) Object.assign(s, { x: tx, y: ty, r: tr, s: ts, rx: trx, ry: try_, init: true });
        spring(s, 'x', tx); spring(s, 'y', ty); spring(s, 'r', tr);
        spring(s, 's', ts); spring(s, 'rx', trx); spring(s, 'ry', try_);
        if (!grid || Math.abs(s.x - tx) > 1 || Math.abs(s.y - ty) > 1 || Math.abs(s.s - 1) > .01) ordered = false;
        c.style.transform =
          `translate3d(${s.x.toFixed(1)}px,${s.y.toFixed(1)}px,0) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) rotate(${s.r.toFixed(2)}deg) scale(${s.s.toFixed(4)})`;
      });
      stage.classList.toggle('is-ordered', ordered);
    };

    compute();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(compute, 120); });
    requestAnimationFrame(frame);
  }

  /* ---------- 4. pura maña: anillo 3D ----------
     Recreación en JavaScript del "Carousel" de Bencho (bencho.dev/blocks/carousel, MIT).
     Mismos parámetros que el original:
       depth  0–150  cuánto se achica el fondo del anillo
       corner 0–40   radio de las esquinas (px)
       float  0–100  flotación en reposo
       sink   0–100  cuánto se hunde la tarjeta bajo el cursor
       settle 0–100  qué tan rápido se detiene después de lanzarlo */
  function initRing() {
    const root = document.querySelector('[data-ring]');
    if (!root) return;
    const P = { depth: 100, corner: 20, float: 15, sink: 50, settle: 50 };
    root.style.setProperty('--corner', P.corner + 'px');

    const stage = root.querySelector('[data-ring-stage]');
    const cards = [...stage.querySelectorAll('.ring-card')];
    const titleEl = root.querySelector('[data-ring-title]');
    const metaEl = root.querySelector('[data-ring-meta]');
    const N = cards.length, STEP = (Math.PI * 2) / N;
    const friction = .97 - (P.settle / 100) * .07;

    let rot = 0, vel = 0, target = null, R = 300;
    let dragging = false, lastX = 0, lastT = 0, moved = 0, downCard = -1;
    let hover = -1, hx = 0, hy = 0, front = -1, visible = true;
    const lean = cards.map(() => ({ x: 0, y: 0, s: 1 }));

    const measure = () => {
      const cw = cards[0].offsetWidth;
      R = Math.min(stage.clientWidth * .36, cw * 1.7);
    };
    measure();
    addEventListener('resize', measure);

    const snap = r => Math.round(r / STEP) * STEP;
    const turn = dir => { target = snap(target ?? rot) - dir * STEP; vel = 0; };

    // Arrastrar y lanzar
    stage.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; moved = 0; vel = 0; target = null;
      lastX = e.clientX; lastT = performance.now();
      downCard = cards.indexOf(e.target.closest('.ring-card'));
      stage.setPointerCapture(e.pointerId);
      stage.classList.add('is-dragging');
    });
    stage.addEventListener('pointermove', e => {
      // Inclinación bajo el cursor
      const card = e.target.closest && e.target.closest('.ring-card');
      if (card && !dragging) {
        const r = card.getBoundingClientRect();
        hover = cards.indexOf(card);
        hx = ((e.clientX - r.left) / r.width) * 2 - 1;
        hy = ((e.clientY - r.top) / r.height) * 2 - 1;
      } else if (!card) hover = -1;

      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      moved += Math.abs(dx);
      rot += dx / R;
      const v = (dx / R) * (16 / Math.max(1, now - lastT));
      vel = vel * .3 + v * .7;
      lastX = e.clientX; lastT = now;
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('is-dragging');
      vel = clamp(vel, -.35, .35);
      // Un clic (sin arrastre) sobre una tarjeta la trae al frente
      if (moved < 6 && downCard > -1) {
        const cur = downCard * STEP + rot;
        const wrapped = Math.atan2(Math.sin(cur), Math.cos(cur));
        target = rot - wrapped; vel = 0;
      }
    };
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('pointerleave', () => (hover = -1));

    root.querySelector('[data-prev]').addEventListener('click', () => turn(-1));
    root.querySelector('[data-next]').addEventListener('click', () => turn(1));
    stage.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); }
    });

    new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(stage);

    const t0 = performance.now();
    const frame = now => {
      requestAnimationFrame(frame);
      if (!visible) return;
      const t = (now - t0) / 1000;

      if (!dragging) {
        if (target !== null) {
          rot = reduced ? target : lerp(rot, target, .12);
          if (Math.abs(rot - target) < .0005) { rot = target; target = null; }
        } else if (Math.abs(vel) > .0015) {
          rot += vel; vel *= friction;            // inercia del lanzamiento
        } else if (Math.abs(rot - snap(rot)) > .0005) {
          target = snap(rot); vel = 0;            // se acomoda en la tarjeta más cercana
        }
      }

      cards.forEach((card, i) => {
        const th = i * STEP + rot;
        const c = Math.cos(th), s = Math.sin(th);
        const back = (1 - c) / 2;                               // 0 al frente, 1 al fondo
        const scale = 1 - back * .5 * (P.depth / 100);
        const fl = reduced ? 0 : P.float / 100;
        const fy = Math.sin(t * .9 + i * 1.7) * fl * 14;        // flotación
        const fr = Math.sin(t * .7 + i) * fl * 1.5;

        const L = lean[i];
        const on = i === hover && !dragging;
        L.x = lerp(L.x, on ? -hy * 10 : 0, .12);
        L.y = lerp(L.y, on ? hx * 12 : 0, .12);
        L.s = lerp(L.s, on ? 1 - (P.sink / 100) * .08 : 1, .12);

        card.style.zIndex = String(Math.round(c * 100) + 100);
        card.style.filter = `brightness(${(1 - back * .18).toFixed(3)})`;
        card.style.transform =
          `translate(-50%,-50%) translate3d(${(s * R).toFixed(1)}px,${fy.toFixed(1)}px,0) ` +
          `perspective(900px) rotateY(${(s * 30 + L.y).toFixed(2)}deg) rotateX(${L.x.toFixed(2)}deg) ` +
          `rotate(${fr.toFixed(2)}deg) scale(${(scale * L.s).toFixed(4)})`;
      });

      // Pie de foto de la pieza que está al frente
      const f = ((Math.round(-rot / STEP) % N) + N) % N;
      if (f !== front) {
        front = f;
        titleEl.textContent = cards[f].dataset.title;
        metaEl.textContent = cards[f].dataset.meta;
      }
    };
    requestAnimationFrame(frame);
  }

  /* ---------- 5. Retrato: deformación líquida en canvas ----------
     La imagen se dibuja en un <canvas>. En cada cuadro se copian sus píxeles y,
     dentro de un radio alrededor del cursor, cada píxel se toma desde un punto
     más cercano al centro (efecto ojo de pez) y desplazado según el movimiento
     del cursor (estiramiento). Al salir del retrato el efecto vuelve a 0 con lerp. */
  function initPortrait() {
    document.querySelectorAll('[data-portrait]').forEach(root => {
      const canvas = root.querySelector('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      const img = new Image();
      // Con servidor (GitHub Pages o vista previa) se pide la imagen con CORS;
      // abriendo el archivo directo (file://) no se puede leer el canvas.
      if (location.protocol.startsWith('http')) img.crossOrigin = 'anonymous';
      img.src = canvas.dataset.src;

      let W = 0, H = 0, src = null, dst = null, frameData = null, canRead = false, clean = true;
      const pos = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0 };
      let amt = 0, active = false;

      const setup = () => {
        if (!img.naturalWidth) return;
        // Tamaño sin transformaciones 3D (offsetWidth no cambia con la inclinación)
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(1, Math.round(canvas.offsetWidth * dpr));
        H = Math.max(1, Math.round(canvas.offsetHeight * dpr));
        canvas.width = W; canvas.height = H;
        const s = Math.min(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
        try {
          frameData = ctx.getImageData(0, 0, W, H);
          src = new Uint32Array(frameData.data.buffer.slice(0));
          dst = new Uint32Array(frameData.data.buffer);
          canRead = true;
        } catch (err) {
          canRead = false;
          console.info('Retrato: abre el sitio con un servidor (GitHub Pages o Live Server) para ver la deformación.');
        }
        pos.x = pos.tx = W / 2; pos.y = pos.ty = H / 2;
        clean = true;
      };
      img.addEventListener('load', setup);
      if (img.complete) setup();
      let rt;
      addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 150); });

      const onMove = (clientX, clientY) => {
        // ¿Está el cursor sobre el retrato?
        const r = canvas.getBoundingClientRect();
        active = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
        pos.tx = ((clientX - r.left) / r.width) * W;
        pos.ty = ((clientY - r.top) / r.height) * H;
      };
      root.addEventListener('pointermove', e => onMove(e.clientX, e.clientY));
      root.addEventListener('pointerleave', () => (active = false));
      root.addEventListener('touchmove', e => onMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
      root.addEventListener('touchend', () => (active = false));

      let visible = true;
      new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(root);

      // Inclinación 3D: el retrato gira hacia el cursor; sin cursor, flota suavemente
      const card = root.querySelector('[data-tilt-card]');
      const tilt = { x: 0, y: 0, tx: 0, ty: 0, on: false };
      const setTilt = (cx, cy) => {
        const r = root.getBoundingClientRect();
        tilt.tx = clamp(((cx - r.left) / r.width) * 2 - 1, -1, 1);
        tilt.ty = clamp(((cy - r.top) / r.height) * 2 - 1, -1, 1);
        tilt.on = true;
      };
      root.addEventListener('pointermove', e => setTilt(e.clientX, e.clientY));
      root.addEventListener('touchmove', e => setTilt(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
      const release = () => { tilt.on = false; };
      root.addEventListener('pointerleave', release);
      root.addEventListener('touchend', release);

      const t0 = performance.now();
      const frame = now => {
        requestAnimationFrame(frame);
        if (!visible || reduced) return;
        if (card) {
          const t = (now - t0) / 1000;
          const gx = tilt.on ? tilt.tx : Math.sin(t * .6) * .35;      // flotación cuando no hay cursor
          const gy = tilt.on ? tilt.ty : Math.sin(t * .45) * .25;
          tilt.x = lerp(tilt.x, gx, .08);
          tilt.y = lerp(tilt.y, gy, .08);
          card.style.transform = `rotateY(${(tilt.x * 14).toFixed(2)}deg) rotateX(${(-tilt.y * 10).toFixed(2)}deg)`;
        }
        if (!canRead) return;
        const t = (now - t0) / 1000;

        // Suavizados: posición, velocidad e intensidad del efecto
        const px = pos.x, py = pos.y;
        pos.x = lerp(pos.x, pos.tx, .22);
        pos.y = lerp(pos.y, pos.ty, .22);
        pos.vx = lerp(pos.vx, pos.x - px, .2);
        pos.vy = lerp(pos.vy, pos.y - py, .2);
        amt = lerp(amt, active ? 1 : 0, active ? .1 : .05);

        if (amt < .002) {
          if (!clean) { dst.set(src); ctx.putImageData(frameData, 0, 0); clean = true; }
          return;
        }
        clean = false;
        dst.set(src);

        const R = W * .45, R2 = R * R;
        const bulge = .8 * amt;                               // ojo de pez
        const sx = clamp(pos.vx, -40, 40) * 2.2 * amt;        // estiramiento según el movimiento
        const sy = clamp(pos.vy, -40, 40) * 2.2 * amt;
        const wob = Math.sin(t * 3) * .04 * amt;              // leve pulso líquido
        const cx = pos.x, cy = pos.y;
        const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W - 1, Math.ceil(cx + R));
        const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H - 1, Math.ceil(cy + R));

        for (let y = y0; y <= y1; y++) {
          const dy = y - cy, row = y * W;
          for (let x = x0; x <= x1; x++) {
            const dx = x - cx, d2 = dx * dx + dy * dy;
            if (d2 >= R2) continue;
            const f = 1 - Math.sqrt(d2) / R;                  // 1 en el centro, 0 en el borde
            const f2 = f * f;
            const k = 1 - (bulge + wob) * f2;
            let u = (cx + dx * k - sx * f2) | 0;
            let v = (cy + dy * k - sy * f2) | 0;
            u = u < 0 ? 0 : u >= W ? W - 1 : u;
            v = v < 0 ? 0 : v >= H ? H - 1 : v;
            dst[row + x] = src[v * W + u];
          }
        }
        ctx.putImageData(frameData, 0, 0);
      };
      requestAnimationFrame(frame);
    });
  }

  /* ---------- 6. Modal de proyecto ---------- */
  function initModal() {
    const dlg = document.getElementById('project-modal');
    const dataEl = document.getElementById('projects-data');
    if (!dlg || !dataEl || typeof dlg.showModal !== 'function') return;
    const data = JSON.parse(dataEl.textContent);
    const $ = sel => dlg.querySelector(sel);
    const main = $('.modal-main'), thumbs = $('[data-m-thumbs]'), links = $('[data-m-links]');
    let lastFocus = null;

    // Muestra una imagen o un video (autoplay, en bucle, sin sonido) en el visor del modal
    const show = (m, alt) => {
      main.textContent = '';
      let el;
      if (m.video) {
        el = document.createElement('video');
        Object.assign(el, { autoplay: true, loop: true, muted: true, playsInline: true, poster: m.poster || '' });
        el.setAttribute('muted', ''); el.setAttribute('playsinline', ''); el.setAttribute('aria-label', alt);
        const src = document.createElement('source');
        src.src = m.src; src.type = 'video/mp4';
        el.appendChild(src);
      } else {
        el = document.createElement('img');
        el.src = m.src; el.alt = alt;
      }
      main.appendChild(el);
      if (m.video) el.play().catch(() => {});
    };
    const link = (href, text, cls, extra = '') => {
      const a = document.createElement('a');
      a.className = 'btn' + (cls ? ' ' + cls : '');
      a.href = href; a.textContent = text;
      if (extra === 'blank') { a.target = '_blank'; a.rel = 'noopener'; }
      if (extra === 'download') a.setAttribute('download', '');
      return a;
    };

    window.openProjectModal = id => {
      const p = data[id];
      if (!p) return;
      lastFocus = document.activeElement;
      $('[data-m-cat]').textContent = p.category;
      $('[data-m-cat2]').textContent = p.category;
      $('[data-m-title]').textContent = p.name;
      // Filas de datos: las vacías se ocultan
      [['[data-m-year]', p.year], ['[data-m-tools]', p.tools], ['[data-m-context]', p.context], ['[data-m-team]', p.team]].forEach(([sel, val]) => {
        const dd = $(sel);
        dd.textContent = val || '';
        dd.parentElement.hidden = !val;
      });
      $('[data-m-tools-label]').textContent = p.toolsLabel || 'Materiales / herramientas';
      const desc = $('[data-m-desc]');
      desc.textContent = '';
      [].concat(p.desc).forEach(t => { const el = document.createElement('p'); el.textContent = t; desc.appendChild(el); });

      // Galería: imagen o video grande + miniaturas
      show(p.media[0], p.name);
      thumbs.textContent = '';
      p.media.forEach((m, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', m.video ? 'Ver video' : `Ver imagen ${i + 1}`);
        b.setAttribute('aria-current', String(i === 0));
        if (m.video) b.classList.add('is-video');
        const im = document.createElement('img');
        im.src = m.video ? m.poster : m.src; im.alt = '';
        b.appendChild(im);
        b.addEventListener('click', () => {
          show(m, `${p.name}, ${m.video ? 'video' : 'imagen ' + (i + 1)}`);
          thumbs.querySelectorAll('button').forEach(x => x.setAttribute('aria-current', String(x === b)));
        });
        thumbs.appendChild(b);
      });
      thumbs.hidden = p.media.length < 2;

      // Enlaces: digitales → demo en vivo + código en GitHub · productos → PDF de planimetrías
      links.textContent = '';
      if (p.live) links.appendChild(link(p.live, 'Probar demo en vivo ↗', 'btn--solid', 'blank'));
      if (p.repo) links.appendChild(link(p.repo, 'Ver código en GitHub ↗', '', 'blank'));
      if (p.pdf) links.appendChild(link(p.pdf, 'Descargar planimetrías (PDF) ↓', 'btn--solid', 'download'));
      links.appendChild(link(p.page, 'Ver página completa →'));

      dlg.scrollTop = 0;
      document.documentElement.style.overflow = 'hidden';
      dlg.showModal();
    };

    const close = () => dlg.open && dlg.close();
    $('[data-close]').addEventListener('click', close);
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });   // clic fuera del panel
    dlg.addEventListener('close', () => {
      main.textContent = '';                      // detiene el video al cerrar
      document.documentElement.style.overflow = '';
      lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
    });
  }

  initWave();
  initWork();
  initRing();
  initPortrait();
  initModal();
})();
