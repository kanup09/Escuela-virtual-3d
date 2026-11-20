import { PanZoomImage } from './PanZoomImage.js';
import { PlanZoom } from './PlanZoom.js';
import { PanoViewer } from './PanoViewer.js';
import { assetUrl } from './tourConfig.js';
import {
  obtenerTransicion,
  fachadaVecina,
  transiciones
} from './config/transiciones.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const DEBUG = new URLSearchParams(location.search).has('debug');

function waitWithSignal(ms, signal) {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const finish = (completed) => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      resolve(completed);
    };
    const onAbort = () => finish(false);
    const timer = setTimeout(() => finish(true), ms);

    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function waitForPaint(signal) {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    let firstFrame = 0;
    let secondFrame = 0;
    const finish = (painted) => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      signal.removeEventListener('abort', onAbort);
      resolve(painted);
    };
    const onAbort = () => finish(false);

    signal.addEventListener('abort', onAbort, { once: true });
    firstFrame = requestAnimationFrame(() => {
      firstFrame = 0;
      secondFrame = requestAnimationFrame(() => {
        secondFrame = 0;
        finish(true);
      });
    });
  });
}

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

function loadImage(url, signal = null) {
  return new Promise((resolve) => {
    const img = new Image();

    const cleanup = () => {
      img.onload = null;
      img.onerror = null;
      signal?.removeEventListener('abort', onAbort);
    };

    const finish = (result) => {
      cleanup();
      resolve(result);
    };

    const onAbort = () => {
      img.src = '';
      finish(null);
    };

    img.onload = () => finish(img);
    img.onerror = () => finish(null);

    if (signal?.aborted) {
      onAbort();
      return;
    }

    signal?.addEventListener('abort', onAbort, { once: true });
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

      <button
        class="sheet-open"
        type="button"
        data-act="sheet"
        title="Ver plano de la escuela"
        hidden
      >
        <span aria-hidden="true">▦</span>
        Plano
      </button>


      <div
        class="sheet-modal"
        hidden
        role="dialog"
        aria-modal="true"
        aria-label="Planos de la escuela"
      >
        <div class="sheet-panel">

          <!-- Encabezado -->

          <div class="sheet-head">
            <div>
              <strong>Planos de la escuela</strong>
              <p>Conocé la distribución de los espacios</p>
            </div>

            <button
              type="button"
              data-act="sheet-close"
              aria-label="Cerrar plano"
            >
              ✕
            </button>
          </div>

          <!-- Selector de plantas -->

          <div
            class="floor-tabs"
            role="group"
            aria-label="Seleccionar planta"
          >
            <button
              type="button"
              class="floor-tab active"
              data-act="floor-ground"
              aria-pressed="true"
            >
              Planta baja
            </button>

            <button
              type="button"
              class="floor-tab"
              data-act="floor-upper"
              aria-pressed="false"
              disabled
              title="Disponible próximamente"
            >
              Planta alta
            </button>
          </div>

          <!-- Imagen del plano -->

          <div class="floor-plan-container">
            <img
              class="floor-plan-image"
              src="${assetUrl('planos/Plano-plantaBaja.jpg')}"
              alt="Plano arquitectónico de planta baja"
              loading="lazy"
            />
          </div>

          <p class="floor-plan-note">
            Usá la rueda, el pellizco o los botones para acercar; arrastrá para moverte.
            La planta alta estará disponible próximamente.
          </p>

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
        <img
          class="tour-intro-logo"
          src="./IconoDePrueba.jpeg"
          alt="Logo de la escuela"
        />

        <div class="tour-intro-subtitle">
          UNA EXPERIENCIA PARA DESCUBRIR
        </div>

        <h1 class="tour-intro-title">
          Escuela Nueva Salta
          <br />
          · Recorrido Virtual
        </h1>

        <p class="tour-intro-description">
          Recorré sus espacios, conocé su arquitectura
          y explorá cada ambiente a tu ritmo.
        </p>

        <button class="tour-start-button">
          Iniciar tour
          <span>→</span>
        </button>

        <div class="tour-intro-hint">
          Mové el mouse o deslizá el dedo para explorar
        </div>
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

    // ==========================================
    // EDITOR DE FLECHAS - SOLO DESARROLLO
    // ==========================================

    this.hotspotEditor = null;
    this.wayfindingTargets = [];

    const editorEnabled =
      import.meta.env.DEV &&
      new URLSearchParams(window.location.search)
        .has('editor');

    if (editorEnabled) {
      import('./editor/HotspotEditor.js')
        .then(({ HotspotEditor }) => {
          this.hotspotEditor = new HotspotEditor(
            this.root,
            this.tour.scenes
          );

          if (this.current) {
            this.hotspotEditor.setScene(this.current);
          }

          this.hotspotEditor.setViewer(
            this.viewer,
            this.wayfindingTargets
          );

          if (this.viewer?.setPickHandler) {
            this.viewer.setPickHandler(({ x, y }) => {
              if (this.current) {
                this.hotspotEditor.capture(this.current, { x, y });
              }
            });
          }
        })
        .catch((error) => {
          console.error('No se pudo abrir el editor:', error);
        });
    }

    this.transitioning = false;
    this.travelController = null;
    this.travelVideosPreloaded = false;
    this.travelVideos = new Map();

    this.videoOverlay = document.createElement('div');
    this.videoOverlay.className = 'travel-overlay';
    this.videoOverlay.hidden = true;

    for (const path of new Set(Object.values(transiciones))) {
      const video = document.createElement('video');
      video.className = 'travel-video';
      video.muted = true;
      video.playsInline = true;
      video.controls = false;
      video.preload = 'auto';
      video.setAttribute('playsinline', '');
      this.videoOverlay.appendChild(video);
      this.travelVideos.set(path, video);
    }

    const skipButton = document.createElement('button');
    skipButton.type = 'button';
    skipButton.className = 'travel-skip';
    skipButton.textContent = 'Omitir animación →';
    this.videoOverlay.appendChild(skipButton);

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
    this.planZoom = new PlanZoom(
      root.querySelector('.floor-plan-container'),
      root.querySelector('.floor-plan-image')
    );
    this.sheetBtn = root.querySelector('.sheet-open');
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

    this.onRootClick = (e) => {
      if (this.transitioning) {
        if (e.target.closest('.travel-skip')) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === '3d') on3D();
      
      // Abrir plano únicamente en interiores
      if (act === 'sheet') {
        if (this.current?.group === 'interior') {
          this.sheetModal.hidden = false;
          this.planZoom?.reset();
        }
      }

      // Cerrar plano
      if (act === 'sheet-close') {
        this.sheetModal.hidden = true;
      }

      // Seleccionar planta baja
      if (act === 'floor-ground') {
        this.selectFloor('ground');
      }

      // Seleccionar planta alta
      if (act === 'floor-upper') {
        this.selectFloor('upper');
      }

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


    };

    this.onDocumentKeyDown = (e) => {
      if (this.root.hidden || !this.current || this.transitioning) return;
      if (e.key === 'Escape') this.sheetModal.hidden = true;
      if (!this.sheetModal.hidden) return;
      const enExterior = this.current.group === 'exterior';
      if (e.key === 'ArrowLeft') enExterior ? this.goToExteriorRelative(-1) : this.step(-1);
      if (e.key === 'ArrowRight') enExterior ? this.goToExteriorRelative(1) : this.step(1);
    };

    this.bindEventListeners();

    this.ready = this.init();
  }

  bindEventListeners() {
    if (this.listenersAttached) return;

    this.root.addEventListener('click', this.onRootClick, true);
    document.addEventListener('keydown', this.onDocumentKeyDown);
    this.listenersAttached = true;
  }

  unbindEventListeners() {
    if (!this.listenersAttached) return;

    this.root.removeEventListener('click', this.onRootClick, true);
    document.removeEventListener('keydown', this.onDocumentKeyDown);
    this.listenersAttached = false;
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
    this.hotspotEditor?.setViewer(null);
    this.wayfindingTargets = [];
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

  makeHotspot(h, { wayfindingLabel = false } = {}) {
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

    
  if (h.style === 'wayfinding') {
    button.classList.add('hotspot--wayfinding');

    if (wayfindingLabel) {
      button.classList.add('hotspot--wayfinding-label');
    } else {
      const direction = {
        forward: 'up',
        back: 'down',
        up: 'up',
        down: 'down',
        left: 'left',
        right: 'right'
      }[h.direction] ?? 'up';

      const arrow = document.createElement('span');
      arrow.className = `hotspot-way-arrow dir-${direction}`;
      arrow.setAttribute('aria-hidden', 'true');
      button.appendChild(arrow);
    }
  } else if (h.style === 'arrow') {
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

  preloadTravelVideos() {
    if (this.travelVideosPreloaded) return;

    for (const [path, video] of this.travelVideos) {
      video.src = assetUrl(path);
      video.load();
    }

    this.travelVideosPreloaded = true;
  }

  async playTravelVideo(path, signal) {
    const video = this.travelVideos.get(path);
    const skip = this.videoOverlay.querySelector('.travel-skip');

    if (!video) return { status: 'failed' };
    if (signal.aborted) return { status: 'aborted' };

    this.videoOverlay.hidden = false;

    for (const otherVideo of this.travelVideos.values()) {
      otherVideo.classList.toggle('is-active', otherVideo === video);
      otherVideo.classList.remove('is-visible');
    }

    if (video.readyState > 0) video.currentTime = 0;
    // ==========================================
    // VELOCIDAD DE LOS VIDEOS DE TRANSICIÓN
    // ==========================================

    video.defaultPlaybackRate = 0.65;
    video.playbackRate = 0.65;
    return new Promise((resolveStart) => {
      let ready = false;
      let settled = false;
      let playing = false;
      let frameCallback = null;
      let readyTimeout = null;
      let resolveFinished;
      const finished = new Promise((resolve) => {
        resolveFinished = resolve;
      });

      const cleanup = () => {
        clearTimeout(readyTimeout);
        if (
          frameCallback !== null &&
          typeof video.cancelVideoFrameCallback === 'function'
        ) {
          video.cancelVideoFrameCallback(frameCallback);
        }

        video.removeEventListener('playing', onPlaying);
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('ended', onEnded);
        video.removeEventListener('error', onError);
        skip.removeEventListener('click', onSkip);
        signal.removeEventListener('abort', onAbort);
      };

      const finish = (status) => {
        if (settled) return;
        settled = true;
        cleanup();

        if (status !== 'completed') video.pause();
        if (!ready) {
          resolveStart({
            status: status === 'aborted'
              ? 'aborted'
              : status === 'skipped'
                ? 'skipped'
                : 'failed',
            video,
          });
        } else {
          resolveFinished({ status, video });
        }
      };

      const markReady = () => {
        if (ready || settled) return;
        ready = true;
        clearTimeout(readyTimeout);
        resolveStart({ status: 'ready', video, finished });
      };
      const fail = () => finish('failed');

      const onPlaying = () => {
        playing = true;
      };
      const onTimeUpdate = () => {
        if (playing && video.currentTime > 0) markReady();
      };
      const onEnded = () => {
        finish('completed');
      };
      const onError = () => fail();
      const onSkip = () => {
        finish('skipped');
      };
      const onAbort = () => {
        finish('aborted');
      };

      video.addEventListener('playing', onPlaying);
      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('ended', onEnded);
      video.addEventListener('error', onError);
      skip.addEventListener('click', onSkip, { once: true });
      signal.addEventListener('abort', onAbort, { once: true });

      readyTimeout = setTimeout(() => {
        if (video.readyState >= 2) {
          markReady();
        } else {
          fail();
        }
      }, 1500);

      if (typeof video.requestVideoFrameCallback === 'function') {
        frameCallback = video.requestVideoFrameCallback(() => {
          frameCallback = null;
          markReady();
        });
      }

      try {
        video.play().catch(fail);
      } catch (error) {
        console.warn('No se pudo iniciar el video de transición:', error);
        fail();
      }
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
    const controller = new AbortController();
    this.travelController = controller;
    let activeVideo = null;

    try {
      this.preloadTravelVideos();
      const playback = await this.playTravelVideo(clip, controller.signal);

      if (controller.signal.aborted || playback.status === 'aborted') return;

      if (playback.status === 'ready') {
        activeVideo = playback.video;
        activeVideo.classList.add('is-visible');
        const result = await playback.finished;

        if (controller.signal.aborted || result.status === 'aborted') return;
      } else if (playback.status === 'failed') {
        this.stage.classList.add('travel-fallback');
        if (!await waitWithSignal(180, controller.signal)) return;
      }

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

      if (controller.signal.aborted) return;

      if (activeVideo) {
        if (!await waitForPaint(controller.signal)) return;
        activeVideo.classList.remove('is-visible');
        if (!await waitWithSignal(360, controller.signal)) return;
      } else if (playback.status === 'failed') {
        this.stage.classList.remove('travel-fallback');
      }

    } finally {
      this.videoOverlay.hidden = true;
      for (const video of this.travelVideos.values()) {
        video.pause();
        video.classList.remove('is-active', 'is-visible');
        if (video.readyState > 0) video.currentTime = 0;
      }
      this.stage.classList.remove('travel-fallback');
      if (this.travelController === controller) this.travelController = null;

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
    if (scene.group === 'exterior') this.preloadTravelVideos();

    this.hotspotEditor?.setScene(scene);
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
      
      const pick = this.hotspotEditor
        ? ({ x, y }) => {
            this.hotspotEditor.capture(
              scene,
              { x, y }
            );
          }
        : DEBUG
          ? ({ x, y }) => {
              this.showToast(
                `x: ${(x * 100).toFixed(0)}, ` +
                `y: ${(y * 100).toFixed(0)}`
              );
            }
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
        this.wayfindingTargets = [];
        // ==========================================
        // RESTAURAR CÁMARA DESDE EL HISTORIAL
        // ==========================================

        if (restoreView) {
          this.viewer.setViewState(restoreView);
        }
        for (const h of hotspots) {
          const wayfinding = h.style === 'wayfinding';
          const button = this.makeHotspot(h, {
            wayfindingLabel: wayfinding,
          });

          if (wayfinding) {
            const instance = this.viewer.addWayfindingHotspot(
              button,
              h.x,
              h.y,
              h
            );
            this.wayfindingTargets.push({ config: h, instance });
          } else {
            this.viewer.addHotspot(button, h.x, h.y);
          }
        }
        this.hotspotEditor?.setViewer(
          this.viewer,
          this.wayfindingTargets
        );
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

  // ==========================================
  // SELECCIONAR PLANTA DEL EDIFICIO
  // ==========================================

  selectFloor(floor) {
    const floors = {
      ground: {
        image: 'planos/Plano-plantaBaja.jpg',
        title: 'Plano de planta baja'
      },

      upper: {
        image: 'planos/Plano-plantaAlta.jpg',
        title: 'Plano de planta alta'
      }
    };

    const selected = floors[floor];

    if (!selected) {
      return;
    }

    const groundBtn = this.root.querySelector(
      '[data-act="floor-ground"]'
    );

    const upperBtn = this.root.querySelector(
      '[data-act="floor-upper"]'
    );

    // No seleccionar plantas deshabilitadas.
    if (floor === 'upper' && upperBtn.disabled) {
      return;
    }

    const image = this.root.querySelector(
      '.floor-plan-image'
    );

    image.src = assetUrl(selected.image);
    image.alt = selected.title;

    groundBtn.classList.toggle(
      'active',
      floor === 'ground'
    );

    upperBtn.classList.toggle(
      'active',
      floor === 'upper'
    );

    groundBtn.setAttribute(
      'aria-pressed',
      String(floor === 'ground')
    );

    upperBtn.setAttribute(
      'aria-pressed',
      String(floor === 'upper')
    );
  }

  // ==========================================
  // MENÚ FIJO PARA EXTERIORES
  // Norte - Este - Ingresar - Oeste - Sur
  // ==========================================

  renderExteriorDock() {

    this.dock.replaceChildren();

    this.dock.classList.remove('dock-carousel', 'dock--interior');
    this.dock.classList.add('dock--exterior');

    const items = [
      { id: 'norte', label: 'Norte' },
      { id: 'este', label: 'Este' },
      { id: 'entrada', label: 'Ingresar', enter: true },
      { id: 'oeste', label: 'Oeste' },
      { id: 'sur', label: 'Sur' }
    ];

    for (const item of items) {

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'exterior-dock-item';
      button.textContent = item.label;
      button.title = item.label;

      if (item.enter) {
        button.classList.add('exterior-dock-enter');
      }

      const isActive = item.id === this.current?.id;

      button.classList.toggle('active', isActive);

      if (isActive) {
        button.setAttribute('aria-current', 'page');
      }

      const scene = this.byId.get(item.id);

      button.disabled =
        !scene ||
        !this.available.has(item.id);

      button.addEventListener('click', () => {

        if (this.transitioning) return;

        if (item.id === this.current?.id) return;

        if (item.enter) {
          // Acceso directo al interior
          this.goTo('entrada');
        } else {
          // Mantener transiciones exteriores
          this.goToExterior(item.id);
        }

      });

      this.dock.appendChild(button);
    }
  }

  
  // ==========================================
  // CARRUSEL INTERIOR CIRCULAR
  // CINCO PANORÁMICAS VISIBLES
  // ==========================================

  renderDockCarousel(scenes) {

    const total = scenes.length;
    const visibleCount = Math.min(5, total);

    this.dock.replaceChildren();

    this.dock.classList.remove('dock--exterior');
    this.dock.classList.add('dock-carousel', 'dock--interior');

    if (total === 0) return;

    // Normalizar índices negativos y positivos
    const normalize = (index) => {
      return ((index % total) + total) % total;
    };

    this.carouselStart = normalize(
      this.carouselStart ?? 0
    );

    // ========================================
    // FUNCIÓN PARA DESPLAZAR LA LISTA
    // ========================================

    const move = (direction) => {

      if (total <= 1) return;

      this.carouselStart = normalize(
        this.carouselStart + direction
      );

      this.renderDockCarousel(scenes);
    };

    // ========================================
    // FLECHA IZQUIERDA
    // ========================================

    const previous = document.createElement('button');

    previous.type = 'button';
    previous.className = 'carousel-arrow';
    previous.textContent = '‹';

    previous.setAttribute(
      'aria-label',
      'Mostrar espacios anteriores'
    );

    previous.title = 'Espacios anteriores';
    previous.disabled = total <= 1;

    previous.addEventListener('click', () => {
      move(-1);
    });

    // ========================================
    // CINCO OPCIONES VISIBLES
    // ========================================

    const viewport = document.createElement('div');

    viewport.className = 'carousel-viewport';

    viewport.style.gridTemplateColumns =
      `repeat(${visibleCount}, minmax(0, 1fr))`;

    for (let i = 0; i < visibleCount; i++) {

      const index = normalize(
        this.carouselStart + i
      );

      const scene = scenes[index];

      const button = document.createElement('button');

      button.type = 'button';
      button.className = 'carousel-scene';

      button.textContent = scene.title;
      button.title = scene.title;

      const active = scene.id === this.current?.id;

      button.classList.toggle('active', active);

      if (active) {
        button.setAttribute('aria-current', 'page');
      }

      button.addEventListener('click', () => {

        if (this.transitioning) return;

        if (scene.id === this.current?.id) return;

        // Conserva el historial
        this.goTo(scene.id);
      });

      viewport.appendChild(button);
    }

    // ========================================
    // FLECHA DERECHA
    // ========================================

    const next = document.createElement('button');

    next.type = 'button';
    next.className = 'carousel-arrow';
    next.textContent = '›';

    next.setAttribute(
      'aria-label',
      'Mostrar espacios siguientes'
    );

    next.title = 'Espacios siguientes';
    next.disabled = total <= 1;

    next.addEventListener('click', () => {
      move(1);
    });

    this.dock.append(
      previous,
      viewport,
      next
    );
  }


  // Botones de arriba y barra de abajo según el grupo (exterior / interior)
  updateChrome() {
    const exterior = this.current.group === 'exterior';

    // ==========================================
    // PLANO DISPONIBLE SOLO EN INTERIORES
    // ==========================================

    this.sheetBtn.hidden = exterior;

    // Si regresamos al exterior con el plano
    // abierto, cerrar automáticamente el visor.
    if (exterior) {
      this.sheetModal.hidden = true;
    }

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


    
    // ==========================================
    // NAVEGACIÓN INFERIOR POR TIPO DE ESCENA
    // ==========================================

    if (exterior) {

      // Exterior: cinco botones fijos
      this.renderExteriorDock();

    } else {

      // Interior: cinco entradas circulares
      const scenes = this.scenesOf('interior');

      const currentIndex = scenes.findIndex(
        (scene) => scene.id === this.current.id
      );

      // Colocar la panorámica actual en el
      // centro del conjunto de cinco.
      this.carouselStart = scenes.length > 0
        ? (currentIndex - 2 + scenes.length) % scenes.length
        : 0;

      this.renderDockCarousel(scenes);
    }


    this.updateNavigationButtons();
  }

  pause() {
    this.unbindEventListeners();
    this.travelController?.abort();
    this.videoOverlay.hidden = true;
    for (const video of this.travelVideos.values()) video.pause();
    this.viewer?.pause?.();
  }

  resume() {
    this.bindEventListeners();
    this.viewer?.resume?.();
    if (this.current?.group === 'exterior') this.preloadTravelVideos();
  }
}
