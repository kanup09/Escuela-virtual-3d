import { PanZoomImage } from './PanZoomImage.js';
import { PanoViewer } from './PanoViewer.js';
import { assetUrl } from './tourConfig.js';
import {
  obtenerTransicion,
  fachadaVecina
} from './config/transiciones.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const DEBUG = new URLSearchParams(location.search).has('debug');

// ¿Existe el archivo? (si no se puede comprobar, se intenta igual)
async function exists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const type = r.headers.get('content-type') || '';
    return r.ok && (type.startsWith('image/') || type.includes('octet-stream'));
  } catch {
    return true;
  }
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Un solo visor para todo el tour: las caras del exterior y los lugares del interior.
export class TourView {
  constructor(root, tour, { on3D }) {
    this.root = root;
    this.tour = tour;
    this.byId = new Map(tour.scenes.map((s) => [s.id, s]));
    this.available = new Set();
    this.current = null;
    this.lastExterior = null;
    this.viewer = null;
    this.token = 0;
    // Historial de vistas visitadas
    this.history = [];
    this.historyIndex = -1;


    root.classList.add('tv', 'intro-active');
    this.tourStarted = false;
    root.innerHTML = `
      <div class="stage"></div>
      
      <div class="bar bar-left">
        <span class="brand"></span>

        <button
          class="pill dark"
          data-act="exterior"
          hidden
        >
          ← Exterior
        </button>

        <div class="history-controls">

          <!-- Botón Volver -->
          <button
            class="pill history-btn"
            data-act="back"
            aria-label="Volver"
            title="Volver"
            disabled
          >
            ← Volver
          </button>

          <!-- Botón Adelante -->
          <button
            class="pill history-btn"
            data-act="forward"
            aria-label="Adelante"
            title="Adelante"
            disabled
          >
            Adelante →
          </button>

        </div>

        <button
          type="button"
          class="pill dark return-exterior"
          data-act="return-exterior"
          hidden
        >
          ← Volver al exterior
        </button>

      </div>

      <div class="bar bar-right"><span class="tour-current-place" aria-live="polite"></span></div>
      <button class="sheet-open" type="button" data-act="sheet" title="Consultar planos y fachadas">
        <span aria-hidden="true">▦</span> Plano
      </button>
      <div class="sheet-modal" hidden role="dialog" aria-modal="true" aria-label="Lámina de planos de la escuela">
        <div class="sheet-panel">
          <div class="sheet-head">
            <strong>Planos y fachadas de la escuela</strong>
            <button type="button" data-act="sheet-close" aria-label="Cerrar planos">✕</button>
          </div>
          <img src="${assetUrl('plano-lamina.jpg')}" alt="Lámina general de la escuela con plantas, fachadas y renders" loading="lazy"/>
          <p>Podés ampliar la lámina con el zoom del navegador.</p>
        </div>
      </div>
      <div class="zoom-ctl">
        <button class="round" data-act="in" aria-label="Acercar">+</button>
        <button class="round" data-act="out" aria-label="Alejar">−</button>
      </div>

      <div class="scene-controls">
        <button
          class="pill scene-btn"
          data-act="previous"
          aria-label="Vista anterior del grupo"
        >
          ‹ Anterior
        </button>

        <button
          class="pill scene-btn"
          data-act="next"
          aria-label="Siguiente vista del grupo"
        >
          Siguiente ›
        </button>
      </div>

      <button class="exterior-nav exterior-nav--prev" data-act="exterior-prev" aria-label="Fachada anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>
        <span class="exterior-nav-label"></span>
      </button>
      <button class="exterior-nav exterior-nav--next" data-act="exterior-next" aria-label="Fachada siguiente">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>
        <span class="exterior-nav-label"></span>
      </button>

      <div class="dock"></div>

      <div class="fade on"></div>

      <div
        class="tour-loading"
        role="status"
        aria-live="polite"
        hidden
      >
        <div class="tour-loading-spinner"></div>

        <span class="tour-loading-title">
          Cargando panorámica...
        </span>

        <span class="tour-loading-description">
          Preparando el siguiente espacio
        </span>
      </div>

      <div class="toast" hidden></div>`;

    // ==========================================
    // PANTALLA DE BIENVENIDA
    // ==========================================

    this.intro = document.createElement('div');

    this.intro.className = 'tour-intro';

    this.intro.innerHTML = `
      <div class="tour-intro-content">

        <span class="tour-intro-subtitle">
          UNA EXPERIENCIA PARA DESCUBRIR
        </span>

        <h1 class="tour-intro-title"></h1>

        <p class="tour-intro-description">
          Recorré sus espacios, conocé su arquitectura y explorá cada ambiente a tu ritmo.
        </p>

        <button
          type="button"
          class="tour-start-button"
        >
          Iniciar tour
          <span aria-hidden="true">→</span>
        </button>

        <span class="tour-intro-hint">
          Mové el mouse o deslizá el dedo para explorar
        </span>

      </div>
    `;

    this.intro.querySelector(
      '.tour-intro-title'
    ).textContent = tour.title;

    root.appendChild(this.intro);

    this.intro.querySelector(
      '.tour-start-button'
    ).addEventListener('click', () => {
      this.startTour();
    });

    root.querySelector('.brand').textContent = tour.title;

    this.stage = root.querySelector('.stage');

    this.transitioning = false;

    this.videoOverlay = document.createElement('div');
    this.videoOverlay.className = 'travel-overlay';
    this.videoOverlay.hidden = true;

    this.videoOverlay.innerHTML = `
      <video
        class="travel-video"
        muted
        playsinline
        preload="none"
      ></video>

      <button
        type="button"
        class="travel-skip"
      >
        Omitir animación →
      </button>
    `;

    this.root.appendChild(this.videoOverlay);

    this.dock = root.querySelector('.dock');
    this.exteriorPrevBtn = root.querySelector('[data-act="exterior-prev"]');
    this.exteriorNextBtn = root.querySelector('[data-act="exterior-next"]');
    this.fade = root.querySelector('.fade');
    this.loading = root.querySelector('.tour-loading');
    this.toast = root.querySelector('.toast');
    this.brand = root.querySelector('.brand');
    this.currentPlace = root.querySelector('.tour-current-place');
    this.sheetModal = root.querySelector('.sheet-modal');
    this.backBtn = root.querySelector('[data-act="exterior"]');

    this.historyBackBtn = root.querySelector(
      '[data-act="back"]'
    );

    this.historyForwardBtn = root.querySelector(
      '[data-act="forward"]'
    );

    this.historyControls = root.querySelector(
      '.history-controls'
    );

    this.previousBtn = root.querySelector(
      '[data-act="previous"]'
    );

    this.nextBtn = root.querySelector(
      '[data-act="next"]'
    );

    this.returnExteriorBtn = root.querySelector(
      '[data-act="return-exterior"]'
    );

    root.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === '3d') on3D();
      if (act === 'sheet') this.sheetModal.hidden = false;
      if (act === 'sheet-close') this.sheetModal.hidden = true;
      if (act === 'in') this.viewer?.zoomBy?.(1.4);
      if (act === 'out') this.viewer?.zoomBy?.(1 / 1.4);
      if (act === 'exterior') this.goTo(this.lastExterior ?? this.scenesOf('exterior')[0]?.id);

      // Flechas laterales del exterior: pasar a la fachada vecina con video
      if (act === 'exterior-prev') this.goToExteriorRelative(-1);
      if (act === 'exterior-next') this.goToExteriorRelative(1);
      
      // Recorrer las vistas del grupo actual
      if (act === 'previous') {
        this.step(-1);
      }

      if (act === 'next') {
        this.step(1);
      }


      // ==========================================
      // VOLVER
      // ==========================================

      if (act === 'back') {

        if (this.current?.group === 'exterior') {

          const destino = fachadaVecina(
            this.current.id,
            1
          );

          if (destino) {
            this.goToExterior(destino);
          }

        } else {
          this.historyStep(-1);
        }
      }


      // ==========================================
      // ADELANTE
      // ==========================================

      if (act === 'forward') {

        if (this.current?.group === 'exterior') {

          const destino = fachadaVecina(
            this.current.id,
            -1
          );

          if (destino) {
            this.goToExterior(destino);
          }

        } else {
          this.historyStep(1);
        }
      }


      // ==========================================
      // REGRESAR AL EXTERIOR
      // ==========================================

      if (act === 'return-exterior') {

        const destino = this.lastExterior ?? 'norte';

        this.goTo(destino);
      }


    });

    document.addEventListener('keydown', (e) => {
      if (this.root.hidden || !this.current) return;
      if (e.key === 'Escape') this.sheetModal.hidden = true;
      if (!this.sheetModal.hidden) return;
      const enExterior = this.current.group === 'exterior';
      if (e.key === 'ArrowLeft') enExterior ? this.goToExteriorRelative(-1) : this.step(-1);
      if (e.key === 'ArrowRight') enExterior ? this.goToExteriorRelative(1) : this.step(1);
    });

    this.ready = this.init();
  }


  // ==========================================
  // INICIAR RECORRIDO DESDE LA PORTADA
  // ==========================================

  async startTour() {

    // Evitar varios clics consecutivos
    if (this.tourStarted) {
      return;
    }

    this.tourStarted = true;
    this.intro.querySelector('.tour-start-button').disabled = true;

    // Desvanecer título y botón de inicio
    this.intro.classList.add('leaving');

    await wait(400);

    // Cambiar desde Entrada hacia Exterior Norte
    await this.goTo('norte');

    // Reiniciar el historial:
    // la portada no cuenta como visita
    this.history = [
      {
        id: 'norte',
        view: null
      }
    ];

    this.historyIndex = 0;

    // Activar la interfaz habitual del tour
    this.root.classList.remove('intro-active');

    // Retirar la portada
    this.intro.remove();

    // Actualizar controles
    this.updateNavigationButtons();
  }



  async init() {
    await Promise.all(this.tour.scenes.map(async (s) => {
      if (await exists(assetUrl(s.image))) this.available.add(s.id);
    }));
    const first = this.byId.get(this.tour.start);
    const start = first && this.available.has(first.id)
      ? first
      : this.tour.scenes.find((s) => this.available.has(s.id));
    if (start) await this.goTo(start.id, true);
  }

  scenesOf(group) {
    return this.tour.scenes.filter((s) => s.group === group && this.available.has(s.id));
  }


  step(dir) {
    if (!this.current || this.transitioning) {
      return;
    }

    // Exterior: utilizar videos
    if (this.current.group === 'exterior') {

      const destino = fachadaVecina(
        this.current.id,
        -dir
      );

      if (destino) {
        this.goToExterior(destino);
      }

      return;
    }

    // Interior: navegación normal
    const list = this.scenesOf(this.current.group);

    const i = list.findIndex(
      (s) => s.id === this.current.id
    );

    if (list.length > 1) {
      const next = (
        i + dir + list.length
      ) % list.length;

      this.goTo(list[next].id);
    }
  }



  // ==========================================
  // GUARDAR UNA VISTA EN EL HISTORIAL
  // ==========================================

  
  // ==========================================
  // AGREGAR UNA VISITA AL HISTORIAL
  // ==========================================

  addToHistory(id) {
    const currentEntry =
      this.history[this.historyIndex];

    // Evitar duplicados consecutivos
    if (currentEntry?.id === id) {
      return;
    }

    // Si el usuario volvió hacia atrás
    // y elige otra vista, descartar
    // las visitas futuras.
    this.history = this.history.slice(
      0,
      this.historyIndex + 1
    );

    // Nueva visita
    this.history.push({
      id: id,
      view: null
    });

    this.historyIndex =
      this.history.length - 1;
  }

  // ==========================================
  // GUARDAR LA POSICIÓN ACTUAL
  // ==========================================

  saveCurrentView() {
    const entry =
      this.history[this.historyIndex];

    if (!entry || !this.current) {
      return;
    }

    // Verificar que el historial
    // corresponda a la escena abierta
    if (entry.id !== this.current.id) {
      return;
    }

    // Solo el visor panorámico tiene
    // getViewState por el momento.
    if (
      typeof this.viewer?.getViewState !==
      'function'
    ) {
      return;
    }

    // Guardar la posición de la cámara
    entry.view = this.viewer.getViewState();
  }


  // ==========================================
  // VOLVER O AVANZAR EN EL HISTORIAL
  // ==========================================

  
  // ==========================================
  // RECORRER HISTORIAL
  // ==========================================

  historyStep(direction) {
    const newIndex =
      this.historyIndex + direction;

    // Verificar los límites
    if (
      newIndex < 0 ||
      newIndex >= this.history.length
    ) {
      return;
    }

    // Guardar la posición de la
    // panorámica que estamos dejando
    this.saveCurrentView();

    // Recuperar la visita de destino
    const entry = this.history[newIndex];

    this.historyIndex = newIndex;

    // Abrir la panorámica sin
    // crear otra entrada en el historial
    this.goTo(
      entry.id,
      false,
      false,
      null,
      entry.view
    );
  }


  // ==========================================
  // ACTUALIZAR ESTADO DE LOS BOTONES
  // ==========================================


  updateNavigationButtons() {
    const exterior = this.current?.group === 'exterior';

    const canGoBack = this.historyIndex > 0;

    const canGoForward =
      this.historyIndex < this.history.length - 1;

    // Los controles de historial solo pertenecen
    // a las vistas interiores.
    this.historyControls.hidden = exterior;

    this.historyBackBtn.disabled = !canGoBack;
    this.historyForwardBtn.disabled = !canGoForward;


    // Mostrar regreso al exterior
    // solamente en vistas interiores.

    this.returnExteriorBtn.hidden = exterior;


    // Conservar referencias originales
    // de Anterior / Siguiente.

    const scenes = this.current
      ? this.scenesOf(this.current.group)
      : [];

    const hasMultipleScenes = scenes.length > 1;

    this.previousBtn.disabled = !hasMultipleScenes;

    this.nextBtn.disabled = !hasMultipleScenes;
  }



  clearViewer() {
    this.viewer?.dispose?.();
    this.viewer = null;
    this.stage.querySelector('.missing')?.remove();
  }

  showToast(text) {
    this.toast.textContent = text;
    this.toast.hidden = false;
    console.log(text);
    try { navigator.clipboard?.writeText(text); } catch { /* ignorar */ }
  }

  
  // ==========================================
  // CREAR PUNTOS INTERACTIVOS
  // ==========================================

  makeHotspot(h) {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'hotspot';


    // Distinguir accesos importantes de
    // las conexiones interiores normales.
    if (h.prominent === true) {
      button.classList.add('hotspot--primary');
    }


    const destination = this.byId.get(h.to);

    const label = h.label ?? destination?.title ?? '';
    const subtitle = h.sub ?? '';

    // ========================================
    // HOTSPOT CON FLECHA DIRECCIONAL
    // ========================================

    if (h.style === 'arrow') {
      button.classList.add('hotspot--arrow');

      const arrowSymbols = {
        forward: '↑',
        back: '↓',
        left: '←',
        right: '→'
      };

      const direction = h.direction ?? 'forward';

      const arrow = document.createElement('span');
      arrow.className = 'hotspot-arrow-icon';

      arrow.textContent =
        arrowSymbols[direction] ?? '↑';

      button.appendChild(arrow);

    } else {

      // ======================================
      // HOTSPOT ORIGINAL
      // ======================================

      const dot = document.createElement('i');

      button.appendChild(dot);
    }

    // ========================================
    // TEXTO DEL DESTINO
    // ========================================

    const text = document.createElement('span');

    text.className = 'hotspot-text';
    text.textContent = label;

    if (subtitle) {
      const small = document.createElement('small');

      small.textContent = subtitle;
      text.appendChild(small);
    }

    button.appendChild(text);

    // Accesibilidad
    button.setAttribute(
      'aria-label',
      [label, subtitle].filter(Boolean).join(' - ')
    );

    // ========================================
    // CAMBIAR DE PANORÁMICA
    // ========================================

    
    button.addEventListener('click', (event) => {
      event.stopPropagation();

      if (!destination) {
        return;
      }

      // Abrir la panorámica de destino
      // con la orientación definida
      // para esta conexión.
      this.goTo(
        h.to,
        false,
        true,
        h.arrivalYaw ?? null
      );
    });


    return button;
  }


  // ==========================================
  // REPRODUCIR DESPLAZAMIENTO EXTERIOR
  // ==========================================

  async playTravelVideo(path) {
    const overlay = this.videoOverlay;
    const video = overlay.querySelector('video');
    const skip = overlay.querySelector('.travel-skip');

    overlay.classList.remove('leaving');
    overlay.hidden = false;

    video.src = assetUrl(path);
    video.currentTime = 0;

    // El video permanece visible al finalizar.
    // Se retirará después de preparar
    // la panorámica de destino.

    await new Promise((resolve) => {
      let finished = false;

      const finish = () => {
        if (finished) return;

        finished = true;
        video.pause();

        video.onended = null;
        video.onerror = null;
        skip.onclick = null;

        resolve();
      };

      video.onended = finish;
      video.onerror = finish;
      skip.onclick = finish;

      video.play().catch(finish);
    });
  }

  // ==========================================
  // CAMBIAR DE FACHADA CON ANIMACIÓN
  // ==========================================

  // Fachada vecina en el círculo (dir: 1 = siguiente, -1 = anterior)
  async goToExteriorRelative(dir) {
    if (this.transitioning || this.current?.group !== 'exterior') return;

    const id = this.vecinaDisponible(this.current.id, dir);
    if (id) await this.goToExterior(id);
  }

  // Salta las fachadas que no tengan imagen cargada
  vecinaDisponible(id, dir) {
    let candidata = fachadaVecina(id, -dir);
    for (let i = 0; i < 4 && candidata; i++) {
      if (this.available.has(candidata)) return candidata;
      candidata = fachadaVecina(candidata, -dir);
    }
    return null;
  }

  
  
  async goToExterior(id) {
    if (this.transitioning) return;
    if (this.current?.id === id) return;

    const destination = this.byId.get(id);

    if (!destination || destination.group !== 'exterior') {
      return;
    }

    const clip = obtenerTransicion(
      this.current?.id,
      id
    );

    if (!clip) {
      await this.goTo(
        id,
        true,
        true,
        null,
        null,
        false
      );
      return;
    }

    this.transitioning = true;
    this.root.classList.add('is-traveling');

    this.updateNavigationButtons();

    const video = this.videoOverlay.querySelector('video');

    try {
      // Reproducir movimiento de cámara
      await this.playTravelVideo(clip);

      // Preparar la siguiente fachada
      // MIENTRAS el último fotograma
      // del video permanece en pantalla.
      await this.goTo(
        id,
        true,
        true,
        null,
        null,
        false
      );

      // Esperar a que el navegador pueda
      // mostrar el nuevo fotograma.
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

    } finally {
      // Cambiar suavemente del último fotograma
      // hacia la panorámica ya preparada.
      this.videoOverlay.classList.add('leaving');
      await wait(220);

      this.videoOverlay.hidden = true;
      this.videoOverlay.classList.remove('leaving');

      video.pause();
      video.removeAttribute('src');
      video.load();

      this.transitioning = false;
      this.root.classList.remove('is-traveling');

      this.loading.hidden = true;
      this.updateNavigationButtons();
    }
  }



 
  
  async goTo(
    id,
    instant = false,
    saveHistory = true,
    arrivalYaw = null,
    restoreView = null,
    showLoading = true
  ) {


    const scene = this.byId.get(id);
    if (!scene) return;

    // Guardar la posición de la vista anterior
    // cuando se inicia una navegación nueva.
    //
    // Al recorrer el historial, historyStep()
    // ya realiza este guardado.
    if (saveHistory) {
      this.saveCurrentView();
    }

    
    const token = ++this.token;

    // Las cargas normales usan desvanecido.
    // Las fachadas preparadas durante el video
    // cambian sin activar el fondo negro.
    if (!instant) {
      this.fade.classList.add('on');
    } else {
      this.fade.classList.remove('on');
    }

    this.loading.hidden = !showLoading;

    if (!instant) await wait(250);

    const url = assetUrl(scene.image);
    const img = await loadImage(url);
    if (token !== this.token) return;

    
    this.clearViewer();
    this.current = scene;


    // ==========================================
    // EFECTO VISUAL DE FACHADAS
    // ==========================================

    // Activar iluminación únicamente
    // en las escenas que la permitan.
    this.stage.classList.toggle(
      'facade-glow',
      scene.hoverGlow === true
    );


    // Guardamos la escena visitada,
    // salvo cuando usamos el historial.
    if (saveHistory) {
      this.addToHistory(scene.id);
    }

    if (scene.group === 'exterior') this.lastExterior = scene.id;
    const hotspots = (scene.hotspots ?? []).filter((h) => this.available.has(h.to));

    if (!img) {
      const box = document.createElement('div');
      box.className = 'missing';
      box.innerHTML = '<strong></strong><p>No se pudo cargar la imagen:</p><code></code>';
      box.querySelector('strong').textContent = scene.title;
      box.querySelector('code').textContent = `public/${scene.image}`;
      this.stage.appendChild(box);
    } else {
      const ratio = img.naturalWidth / img.naturalHeight;
      // Un panorama 360° es exactamente 2:1. Si una imagen común justo mide 2:1, poner type: 'flat'
      const type = scene.type ?? (Math.abs(ratio - 2) < 0.01 ? 'pano' : 'flat');
      const pick = DEBUG
        ? ({ x, y }) => this.showToast(`x: ${(x * 100).toFixed(0)}, y: ${(y * 100).toFixed(0)}`)
        : null;

    if (type === 'pano') {
        
      this.viewer = new PanoViewer(
        this.stage,
        img,
        {
          // Dirección inicial de la cámara
          yaw: arrivalYaw ?? scene.yaw ?? 0,

          // Giro automático desactivado,
          // salvo que la escena indique lo contrario
          autoRotate: scene.autoRotate ?? false,

          // Límites horizontales
          minYaw: scene.minYaw,
          maxYaw: scene.maxYaw,

          // Límites verticales
          minPitch: scene.minPitch,
          maxPitch: scene.maxPitch,

          // Herramienta de depuración
          onPick: pick,
        }
      );
        // ==========================================
        // RESTAURAR CÁMARA DESDE EL HISTORIAL
        // ==========================================

        if (restoreView) {
          this.viewer.setViewState(restoreView);
        }
        for (const h of hotspots) this.viewer.addHotspot(this.makeHotspot(h), h.x, h.y);
      } else {
        this.viewer = new PanZoomImage(this.stage, url, { maxScale: 4 });
        await this.viewer.ready;
        if (token !== this.token) return;
        for (const h of hotspots) {
          const b = this.makeHotspot(h);
          b.style.left = `${h.x}%`;
          b.style.top = `${h.y}%`;
          this.viewer.wrap.appendChild(b);
        }

        // ==========================================
        // MOSTRAR ACCESOS AL PASAR SOBRE EDIFICIO
        // ==========================================

        if (scene.hoverArea) {
          const wrap = this.viewer.wrap;
          const area = scene.hoverArea;

          wrap.classList.add('building-hover-enabled');

          wrap.addEventListener('pointermove', (event) => {
            if (event.pointerType === 'touch') return;

            // Coordenadas visibles de la imagen
            // incluyendo zoom y desplazamiento.
            const rect = wrap.getBoundingClientRect();

            const x = (
              (event.clientX - rect.left) /
              rect.width
            ) * 100;

            const y = (
              (event.clientY - rect.top) /
              rect.height
            ) * 100;

            const sobreEdificio =
              x >= area.xMin &&
              x <= area.xMax &&
              y >= area.yMin &&
              y <= area.yMax;

            wrap.classList.toggle(
              'building-hover-active',
              sobreEdificio
            );
          });

          wrap.addEventListener('pointerleave', () => {
            wrap.classList.remove('building-hover-active');
          });
        }

        if (pick) {
          this.viewer.wrap.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            const p = this.viewer.pointToFraction(e.clientX, e.clientY);
            pick(p);
          });
        }
      }
    }
    this.updateChrome();

    // Ocultar indicador únicamente si
    // esta sigue siendo la carga activa.
    if (token === this.token) {
      this.loading.hidden = true;
      this.fade.classList.remove('on');
    }
  }

  // Botones de arriba y barra de abajo según el grupo (exterior / interior)
  updateChrome() {
    const exterior = this.current.group === 'exterior';
    this.brand.hidden = !exterior;
    this.currentPlace.textContent = this.current.title;
    this.root.classList.toggle('is-exterior', exterior);

    // Flechas laterales: muestran el nombre de la fachada a la que llevan
    if (exterior) {
      const anterior = this.byId.get(this.vecinaDisponible(this.current.id, -1));
      const siguiente = this.byId.get(this.vecinaDisponible(this.current.id, 1));
      this.exteriorPrevBtn.querySelector('.exterior-nav-label').textContent = anterior?.title ?? '';
      this.exteriorNextBtn.querySelector('.exterior-nav-label').textContent = siguiente?.title ?? '';
      this.exteriorPrevBtn.hidden = !anterior || anterior.id === this.current.id;
      this.exteriorNextBtn.hidden = !siguiente || siguiente.id === this.current.id;
    }
    this.backBtn.hidden = exterior;
    this.toast.hidden = true;

    this.dock.replaceChildren();
    const label = document.createElement('span');
    label.className = 'dock-label';
    label.textContent = exterior ? 'Exterior' : 'Ir a';
    this.dock.appendChild(label);
    for (const s of this.scenesOf(this.current.group)) {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.textContent = s.title;
      chip.classList.toggle('active', s.id === this.current.id);
      
      chip.addEventListener('click', () => {
        if (s.id === this.current.id) return;

        if (s.group === 'exterior') {
          this.goToExterior(s.id);
        } else {
          this.goTo(s.id);
        }
      });

      this.dock.appendChild(chip);
    }
    this.dock.querySelector('.active')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
    this.updateNavigationButtons();
  }

  pause() { this.viewer?.pause?.(); }
  resume() { this.viewer?.resume?.(); }
}
