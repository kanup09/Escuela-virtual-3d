// Imagen que cubre la pantalla y se puede acercar y mover (rueda, arrastre, botones).
// Las zonas tocables se agregan dentro de `wrap` y se mueven con la imagen.
export class PanZoomImage {
  constructor(container, src, { minScale = 1, maxScale = 4 } = {}) {
    this.container = container;
    this.min = minScale;
    this.max = maxScale;
    this.fx = 0.5; // punto de la imagen (0–1) que está en el centro de la pantalla
    this.fy = 0.5;
    this.s = 1;
    this.ratio = 1.5;
    this.failed = false;

    this.wrap = document.createElement('div');
    this.wrap.className = 'pz-wrap';
    this.img = new Image();
    this.img.className = 'pz-img';
    this.img.draggable = false;
    this.img.alt = '';
    this.wrap.appendChild(this.img);
    container.appendChild(this.wrap);

    this.ready = new Promise((resolve) => {
      this.img.onload = () => { this.ratio = this.img.naturalWidth / this.img.naturalHeight; this.layout(); resolve(true); };
      this.img.onerror = () => { this.failed = true; resolve(false); };
    });
    this.img.src = src;

    this.resizeObserver = new ResizeObserver(() => this.layout());
    this.resizeObserver.observe(container);

    let drag = null;
    this.onPointerDown = (e) => {
      if (e.target.closest('button')) return;
      drag = { x: e.clientX, y: e.clientY, moved: false };
      container.setPointerCapture?.(e.pointerId);
    };
    this.onPointerMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX; drag.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 0) drag.moved = true;
      this.fx -= dx / (this.s * this.W);
      this.fy -= dy / (this.s * this.H);
      this.apply(false);
      this.onUserMove?.();
    };
    this.onPointerUp = () => { drag = null; };
    this.onWheel = (e) => {
      e.preventDefault();
      this.s = Math.min(this.max, Math.max(this.min, this.s * Math.exp(-e.deltaY * 0.0015)));
      this.apply(false);
      this.onUserMove?.();
    };
    container.addEventListener('pointerdown', this.onPointerDown);
    container.addEventListener('pointermove', this.onPointerMove);
    container.addEventListener('pointerup', this.onPointerUp);
    container.addEventListener('pointercancel', this.onPointerUp);
    container.addEventListener('wheel', this.onWheel, { passive: false });
  }

  layout() {
    const vw = this.container.clientWidth;
    const vh = this.container.clientHeight;
    if (!vw || !vh) return;
    this.vw = vw; this.vh = vh;
    this.W = Math.max(vw, vh * this.ratio); // la imagen "cubre" la pantalla
    this.H = this.W / this.ratio;
    this.wrap.style.width = `${this.W}px`;
    this.wrap.style.height = `${this.H}px`;
    this.apply(false);
  }

  apply(animate = false, ms = 600) {
    if (!this.W) return;
    const { s, vw, vh, W, H } = this;
    // El punto (fx, fy) de la imagen queda en el centro de la pantalla,
    // sin dejar nunca bordes vacíos.
    let tx = vw / 2 - s * this.fx * W;
    let ty = vh / 2 - s * this.fy * H;
    tx = Math.min(0, Math.max(vw - s * W, tx));
    ty = Math.min(0, Math.max(vh - s * H, ty));
    this.fx = (vw / 2 - tx) / (s * W);
    this.fy = (vh / 2 - ty) / (s * H);
    this.wrap.style.transition = animate ? `transform ${ms}ms cubic-bezier(.4,0,.2,1)` : 'none';
    this.wrap.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    this.wrap.style.setProperty('--s', s);
  }

  focusOn(fx, fy, scale, ms = 0) {
    this.fx = fx; this.fy = fy;
    this.s = Math.min(this.max, Math.max(this.min, scale));
    this.apply(ms > 0, ms);
  }

  zoomBy(factor) {
    this.s = Math.min(this.max, Math.max(this.min, this.s * factor));
    this.apply(true, 250);
    this.onUserMove?.();
  }

  // Posición (0–1) de un clic dentro de la imagen
  pointToFraction(clientX, clientY) {
    const r = this.wrap.getBoundingClientRect();
    return { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height };
  }

  dispose() {
    this.resizeObserver.disconnect();
    const c = this.container;
    c.removeEventListener('pointerdown', this.onPointerDown);
    c.removeEventListener('pointermove', this.onPointerMove);
    c.removeEventListener('pointerup', this.onPointerUp);
    c.removeEventListener('pointercancel', this.onPointerUp);
    c.removeEventListener('wheel', this.onWheel);
    this.wrap.remove();
  }
}
