import { PanZoomImage } from './PanZoomImage.js';
import { assetUrl } from './tourConfig.js';

// Pantalla de inicio: render exterior que se acerca solo hacia la entrada
// y muestra el botón "Ingresar". También se puede tocar cada zona.
export class ExteriorView {
  constructor(root, config, title, { onEnter, on3D }) {
    this.root = root;
    this.config = config;
    this.onEnter = onEnter;
    this.target = null;
    this.userTouched = false;
    this.timers = [];

    root.classList.add('ext');
    root.innerHTML = `
      <div class="stage"></div>
      <div class="bar bar-left"><span class="brand"></span></div>
      <div class="bar bar-right"><button class="pill" data-act="3d">Recorrido 3D</button></div>
      <div class="zoom-ctl">
        <button class="round" data-act="in" aria-label="Acercar">+</button>
        <button class="round" data-act="out" aria-label="Alejar">−</button>
      </div>
      <p class="ext-hint">Tocá una zona para acercarte</p>
      <button class="enter-btn" hidden>Ingresar</button>
      <div class="fade"></div>
      <div class="toast" hidden></div>`;
    root.querySelector('.brand').textContent = title;

    this.enterBtn = root.querySelector('.enter-btn');
    this.fade = root.querySelector('.fade');
    this.toast = root.querySelector('.toast');
    this.hint = root.querySelector('.ext-hint');

    this.pz = new PanZoomImage(root.querySelector('.stage'), assetUrl(config.image), { maxScale: 4 });
    this.pz.onUserMove = () => {
      this.userTouched = true;
      if (this.pz.s < 1.3) this.hideEnter();
    };

    for (const h of config.hotspots) {
      const b = document.createElement('button');
      b.className = 'hotspot';
      b.style.left = `${h.x}%`;
      b.style.top = `${h.y}%`;
      b.innerHTML = '<i></i><span></span>';
      b.querySelector('span').textContent = h.label;
      b.addEventListener('click', () => { this.userTouched = true; this.zoomTo(h); });
      this.pz.wrap.appendChild(b);
    }

    root.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]')?.dataset.act;
      if (act === '3d') on3D();
      if (act === 'in') this.pz.zoomBy(1.4);
      if (act === 'out') this.pz.zoomBy(1 / 1.4);
    });
    this.enterBtn.addEventListener('click', () => this.enter());

    // Modo ajuste: abrir la página con ?debug y tocar la imagen para ver x/y en %
    if (new URLSearchParams(location.search).has('debug')) {
      this.pz.wrap.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const p = this.pz.pointToFraction(e.clientX, e.clientY);
        const text = `x: ${(p.x * 100).toFixed(0)}, y: ${(p.y * 100).toFixed(0)}`;
        console.log(text);
        this.toast.textContent = text;
        this.toast.hidden = false;
        try { navigator.clipboard?.writeText(text); } catch { /* ignorar */ }
      });
    }

    // Zoom automático hacia la entrada al abrir la página
    this.pz.ready.then((ok) => {
      if (!ok) return;
      const intro = config.hotspots.find((h) => h.label === config.intro) ?? config.hotspots[0];
      this.later(() => { if (!this.userTouched && intro) this.zoomTo(intro, 4500); }, 1400);
    });
  }

  later(fn, ms) {
    const t = setTimeout(fn, ms);
    this.timers.push(t);
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  zoomTo(h, ms = 1600) {
    this.target = h;
    this.hint.classList.add('gone');
    this.hideEnter();
    // En pantallas verticales (celular) se acerca menos
    const portrait = this.pz.vw < this.pz.vh ? 0.65 : 1;
    this.pz.focusOn(h.x / 100, h.y / 100, (h.zoom ?? 2.4) * portrait, ms);
    this.later(() => this.showEnter(), ms - 100);
  }

  showEnter() {
    this.enterBtn.hidden = false;
    this.enterBtn.classList.remove('pop');
    void this.enterBtn.offsetWidth; // reinicia la animación
    this.enterBtn.classList.add('pop');
  }

  hideEnter() {
    this.enterBtn.hidden = true;
  }

  enter() {
    const h = this.target;
    if (!h) return;
    this.hideEnter();
    this.pz.focusOn(this.pz.fx, this.pz.fy, this.pz.s * 1.8, 1000);
    this.later(() => this.fade.classList.add('on'), 450);
    this.later(() => this.onEnter(h.scene), 1050);
  }

  // Al volver desde el interior
  reset() {
    this.clearTimers();
    this.userTouched = true;
    this.target = null;
    this.hint.classList.remove('gone');
    this.hideEnter();
    this.fade.classList.remove('on');
    this.pz.focusOn(0.5, 0.5, 1, 0);
  }
}
