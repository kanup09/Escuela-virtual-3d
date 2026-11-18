import { PanZoomImage } from './PanZoomImage.js';
import { PanoViewer } from './PanoViewer.js';
import { assetUrl } from './tourConfig.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Vistas del interior: cada escena es una imagen común (zoom y arrastre)
// o un panorama 360° (se detecta por la proporción 2:1).
export class InteriorView {
  constructor(root, tour, { onExit, on3D }) {
    this.root = root;
    this.scenes = tour.scenes;
    this.index = 0;
    this.viewer = null;
    this.token = 0;
    this.holdFade = false;

    root.classList.add('int');
    root.innerHTML = `
      <div class="stage"></div>
      <div class="bar bar-left">
        <button class="pill dark" data-act="menu">☰ Menú</button>
        <button class="round" data-act="exit" aria-label="Volver al exterior">↩</button>
      </div>
      <div class="bar bar-right"><button class="pill" data-act="3d">Recorrido 3D</button></div>
      <button class="arrow prev" data-act="prev" aria-label="Vista anterior">‹</button>
      <button class="arrow next" data-act="next" aria-label="Vista siguiente">›</button>
      <div class="zoom-ctl">
        <button class="round" data-act="in" aria-label="Acercar">+</button>
        <button class="round" data-act="out" aria-label="Alejar">−</button>
      </div>
      <div class="scene-title"></div>
      <nav class="drawer" hidden><h3>Recorrido</h3><ul></ul></nav>
      <div class="fade on"></div>`;

    this.stage = root.querySelector('.stage');
    this.fade = root.querySelector('.fade');
    this.titleEl = root.querySelector('.scene-title');
    this.drawer = root.querySelector('.drawer');

    const list = root.querySelector('.drawer ul');
    this.items = this.scenes.map((scene, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      const thumb = new Image();
      thumb.alt = '';
      thumb.loading = 'lazy';
      thumb.src = assetUrl(scene.image);
      thumb.onerror = () => thumb.classList.add('empty');
      const label = document.createElement('span');
      label.textContent = scene.title;
      btn.append(thumb, label);
      btn.addEventListener('click', () => { this.drawer.hidden = true; this.goTo(i); });
      li.appendChild(btn);
      list.appendChild(li);
      return btn;
    });

    root.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (!act) { if (!e.target.closest('.drawer')) this.drawer.hidden = true; return; }
      if (act === 'menu') this.drawer.hidden = !this.drawer.hidden;
      if (act === 'exit') onExit();
      if (act === '3d') on3D();
      if (act === 'prev') this.step(-1);
      if (act === 'next') this.step(1);
      if (act === 'in') this.viewer?.zoomBy?.(1.4);
      if (act === 'out') this.viewer?.zoomBy?.(1 / 1.4);
    });

    document.addEventListener('keydown', (e) => {
      if (this.root.hidden || this.root.parentElement.hidden) return;
      if (e.key === 'ArrowLeft') this.step(-1);
      if (e.key === 'ArrowRight') this.step(1);
      if (e.key === 'Escape') this.drawer.hidden = true;
    });
  }

  step(dir) {
    const n = this.scenes.length;
    this.goTo((this.index + dir + n) % n);
  }

  async open(sceneId) {
    const i = this.scenes.findIndex((s) => s.id === sceneId);
    await this.goTo(i >= 0 ? i : 0, true);
  }

  clearViewer() {
    this.viewer?.dispose?.();
    this.viewer = null;
    this.stage.querySelector('.missing')?.remove();
  }

  async goTo(i, instant = false) {
    const token = ++this.token;
    this.index = i;
    const scene = this.scenes[i];
    this.fade.classList.add('on');
    if (!instant) await wait(280);

    const url = assetUrl(scene.image);
    const img = await loadImage(url);
    if (token !== this.token) return;

    this.clearViewer();
    this.titleEl.textContent = scene.title;
    this.items.forEach((b, k) => b.classList.toggle('active', k === i));

    if (!img) {
      const box = document.createElement('div');
      box.className = 'missing';
      const strong = document.createElement('strong');
      strong.textContent = scene.title;
      const p = document.createElement('p');
      p.textContent = 'Esta vista todavía no tiene imagen. Falta el archivo:';
      const code = document.createElement('code');
      code.textContent = `public/${scene.image}`;
      box.append(strong, p, code);
      this.stage.appendChild(box);
    } else {
      const ratio = img.naturalWidth / img.naturalHeight;
      const type = scene.type ?? (Math.abs(ratio - 2) < 0.03 ? 'pano' : 'flat');
      if (type === 'pano') {
        
        this.viewer = new PanoViewer(
          this.stage,
          img,
          {
            yaw: scene.yaw ?? 0,
            autoRotate: scene.autoRotate ?? true,
            minYaw: scene.minYaw,
            maxYaw: scene.maxYaw
          }
        );

      } else {
        this.viewer = new PanZoomImage(this.stage, url, { maxScale: 4 });
        await this.viewer.ready;
      }
    }
    if (token === this.token && !this.holdFade) this.fade.classList.remove('on');
  }

  pause() { this.viewer?.pause?.(); }
  resume() { this.viewer?.resume?.(); }
}
