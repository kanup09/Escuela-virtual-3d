// Zoom y desplazamiento para la imagen del plano:
// rueda, arrastre, pellizco (celular), doble clic/toque y botones + / − / ⟲.
export class PlanZoom {
  constructor(container, img, { min = 1, max = 6 } = {}) {
    this.container = container;
    this.img = img;
    this.min = min;
    this.max = max;
    this.s = 1;
    this.x = 0;
    this.y = 0;
    this.pointers = new Map();
    this.lastPinch = 0;

    container.classList.add('plan-zoom');
    img.draggable = false;

    this.controls = document.createElement('div');
    this.controls.className = 'plan-zoom-ctl';
    this.controls.innerHTML = `
      <button type="button" data-pz="in" aria-label="Acercar plano">+</button>
      <button type="button" data-pz="out" aria-label="Alejar plano">−</button>
    `;
    container.appendChild(this.controls);

    this.controls.addEventListener('click', (e) => {
      const act = e.target.closest('[data-pz]')?.dataset.pz;
      if (act === 'in') this.zoomAt(1.5);
      if (act === 'out') this.zoomAt(1 / 1.5);
    });
    this.controls.addEventListener('pointerdown', (e) => e.stopPropagation());

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const p = this.point(e.clientX, e.clientY);
      this.zoomAt(Math.exp(-e.deltaY * 0.0015), p.x, p.y);
    }, { passive: false });

    container.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.plan-zoom-ctl')) return;
      this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      container.setPointerCapture?.(e.pointerId);
      this.lastPinch = this.pinchDistance();
      container.classList.add('is-grabbing');
    });

    container.addEventListener('pointermove', (e) => {
      const prev = this.pointers.get(e.pointerId);
      if (!prev) return;

      const cur = { x: e.clientX, y: e.clientY };
      this.pointers.set(e.pointerId, cur);

      if (this.pointers.size >= 2) {
        const dist = this.pinchDistance();
        if (this.lastPinch > 0) {
          const [a, b] = [...this.pointers.values()];
          const p = this.point((a.x + b.x) / 2, (a.y + b.y) / 2);
          this.zoomAt(dist / this.lastPinch, p.x, p.y);
        }
        this.lastPinch = dist;
        return;
      }

      this.x += cur.x - prev.x;
      this.y += cur.y - prev.y;
      this.apply();
    });

    const end = (e) => {
      this.pointers.delete(e.pointerId);
      this.lastPinch = this.pinchDistance();
      if (!this.pointers.size) container.classList.remove('is-grabbing');
    };
    container.addEventListener('pointerup', end);
    container.addEventListener('pointercancel', end);

    container.addEventListener('dblclick', (e) => {
      if (e.target.closest('.plan-zoom-ctl')) return;
      const p = this.point(e.clientX, e.clientY);
      if (this.s > this.min * 1.05) this.reset();
      else this.zoomAt(2.5, p.x, p.y);
    });

    // Al cambiar de plano o de tamaño, volver a encuadrar
    img.addEventListener('load', () => this.reset());
    new ResizeObserver(() => this.apply()).observe(container);
  }

  pinchDistance() {
    if (this.pointers.size < 2) return 0;
    const [a, b] = [...this.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  point(clientX, clientY) {
    const r = this.container.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  }

  // factor: multiplicador de zoom; (px, py): punto fijo (por defecto el centro)
  zoomAt(factor, px, py) {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    px ??= w / 2;
    py ??= h / 2;

    const next = Math.min(this.max, Math.max(this.min, this.s * factor));
    const k = next / this.s;
    this.x = px - (px - this.x) * k;
    this.y = py - (py - this.y) * k;
    this.s = next;
    this.apply();
  }

  reset() {
    this.s = 1;
    this.x = 0;
    this.y = 0;
    this.apply();
  }

  apply() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    // Que la imagen nunca se salga del todo del recuadro
    this.x = Math.min(0, Math.max(w - w * this.s, this.x));
    this.y = Math.min(0, Math.max(h - h * this.s, this.y));

    this.img.style.transform =
      `translate(${this.x}px, ${this.y}px) scale(${this.s})`;
  }
}
