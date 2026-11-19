import { PanZoomImage } from './PanZoomImage.js';
import { PanoViewer } from './PanoViewer.js';
import { assetUrl } from './tourConfig.js';

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

    root.classList.add('tv');
    root.innerHTML = `
      <div class="stage"></div>
      <div class="bar bar-left">
        <span class="brand"></span>
        <button class="pill dark" data-act="exterior" hidden>← Exterior</button>
      </div>
      <div class="bar bar-right"><button class="pill" data-act="3d">Recorrido 3D</button></div>
      <div class="zoom-ctl">
        <button class="round" data-act="in" aria-label="Acercar">+</button>
        <button class="round" data-act="out" aria-label="Alejar">−</button>
      </div>
      <nav class="dock"></nav>
      <div class="fade on"></div>
      <div class="toast" hidden></div>`;
    root.querySelector('.brand').textContent = tour.title;

    this.stage = root.querySelector('.stage');
    this.dock = root.querySelector('.dock');
    this.fade = root.querySelector('.fade');
    this.toast = root.querySelector('.toast');
    this.brand = root.querySelector('.brand');
    this.backBtn = root.querySelector('[data-act="exterior"]');

    root.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === '3d') on3D();
      if (act === 'in') this.viewer?.zoomBy?.(1.4);
      if (act === 'out') this.viewer?.zoomBy?.(1 / 1.4);
      if (act === 'exterior') this.goTo(this.lastExterior ?? this.scenesOf('exterior')[0]?.id);
    });

    document.addEventListener('keydown', (e) => {
      if (this.root.hidden || !this.current) return;
      if (e.key === 'ArrowLeft') this.step(-1);
      if (e.key === 'ArrowRight') this.step(1);
    });

    this.ready = this.init();
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
    const list = this.scenesOf(this.current.group);
    const i = list.findIndex((s) => s.id === this.current.id);
    if (list.length > 1) this.goTo(list[(i + dir + list.length) % list.length].id);
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

  makeHotspot(h) {
    const b = document.createElement('button');
    b.className = 'hotspot';
    const dot = document.createElement('i');
    const text = document.createElement('span');
    text.textContent = h.label ?? this.byId.get(h.to)?.title ?? '';
    if (h.sub) {
      const small = document.createElement('small');
      small.textContent = h.sub;
      text.appendChild(small);
    }
    b.append(dot, text);
    b.addEventListener('click', () => this.goTo(h.to));
    return b;
  }

  async goTo(id, instant = false) {
    const scene = this.byId.get(id);
    if (!scene) return;
    const token = ++this.token;
    this.fade.classList.add('on');
    if (!instant) await wait(250);

    const url = assetUrl(scene.image);
    const img = await loadImage(url);
    if (token !== this.token) return;

    this.clearViewer();
    this.current = scene;
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
        this.viewer = new PanoViewer(this.stage, img, {
          yaw: scene.yaw ?? 0,
          autoRotate: scene.autoRotate ?? false,
          minYaw: scene.minYaw,
          maxYaw: scene.maxYaw,
          minPitch: scene.minPitch,
          maxPitch: scene.maxPitch,
          onPick: pick,
        });
        for (const h of hotspots) this.viewer.addHotspot(this.makeHotspot(h), h.x, h.y);
      } else {
        this.viewer = new PanZoomImage(this.stage, url, { maxScale: 4 });
        await this.viewer.ready;
        for (const h of hotspots) {
          const b = this.makeHotspot(h);
          b.style.left = `${h.x}%`;
          b.style.top = `${h.y}%`;
          this.viewer.wrap.appendChild(b);
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
    if (token === this.token) this.fade.classList.remove('on');
  }

  // Botones de arriba y barra de abajo según el grupo (exterior / interior)
  updateChrome() {
    const exterior = this.current.group === 'exterior';
    this.brand.hidden = !exterior;
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
      chip.addEventListener('click', () => { if (s.id !== this.current.id) this.goTo(s.id); });
      this.dock.appendChild(chip);
    }
    this.dock.querySelector('.active')?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }

  pause() { this.viewer?.pause?.(); }
  resume() { this.viewer?.resume?.(); }
}
