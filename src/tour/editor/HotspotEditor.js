
import './hotspotEditor.css';

export class HotspotEditor {
  constructor(root, scenes) {
    this.scenes = scenes;
    this.scene = null;
    this.point = null;

    this.panel = document.createElement('aside');
    this.panel.className = 'hotspot-editor';

    this.panel.innerHTML = `
      <div class="he-title">
        <strong>Editor de flechas</strong>
        <button type="button" data-he="close">×</button>
      </div>

      <p class="he-scene">Elegí un punto en la imagen</p>

      <div class="he-coordinates">
        <span>X: <b data-he="x">—</b></span>
        <span>Y: <b data-he="y">—</b></span>
      </div>

      <label>
        Destino
        <select data-he="destination"></select>
      </label>

      <label>
        Dirección de la flecha
        <select data-he="direction">
          <option value="forward">Adelante</option>
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
          <option value="back">Atrás</option>
        </select>
      </label>

      <label>
        Texto visible
        <input
          data-he="label"
          placeholder="Ej. Talleres"
        />
      </label>

      <label>
        Orientación al llegar
        <input
          data-he="yaw"
          type="number"
          value="0"
          step="5"
        />
      </label>

      <button type="button" data-he="copy">
        Copiar configuración
      </button>

      <p class="he-help">
        Girá la panorámica y hacé clic sobre
        la puerta o camino donde irá la flecha.
      </p>

      <p class="he-message" aria-live="polite"></p>
    `;

    root.appendChild(this.panel);

    this.xLabel = this.panel.querySelector('[data-he="x"]');
    this.yLabel = this.panel.querySelector('[data-he="y"]');
    this.destination = this.panel.querySelector(
      '[data-he="destination"]'
    );

    this.direction = this.panel.querySelector(
      '[data-he="direction"]'
    );

    this.label = this.panel.querySelector('[data-he="label"]');
    this.yaw = this.panel.querySelector('[data-he="yaw"]');
    this.message = this.panel.querySelector('[class="he-message"]');

    // Lista de destinos existentes
    for (const scene of scenes) {
      const option = document.createElement('option');

      option.value = scene.id;
      option.textContent = scene.title;

      this.destination.appendChild(option);
    }

    this.destination.addEventListener('change', () => {
      const selected = this.scenes.find(
        (s) => s.id === this.destination.value
      );

      this.label.value = selected?.title ?? '';
    });

    this.panel.querySelector('[data-he="copy"]')
      .addEventListener('click', () => this.copy());

    this.panel.querySelector('[data-he="close"]')
      .addEventListener('click', () => {
        this.panel.hidden = true;
      });
  }

  // Panorámica abierta actualmente
  setScene(scene) {
    this.scene = scene;
    this.point = null;

    this.panel.querySelector('.he-scene').textContent =
      `Origen: ${scene.title}`;

    this.xLabel.textContent = '—';
    this.yLabel.textContent = '—';
    this.message.textContent = '';

    const destination = this.scenes.find(
      (s) => s.id !== scene.id && s.group === 'interior'
    );

    if (destination) {
      this.destination.value = destination.id;
      this.label.value = destination.title;
    }
  }

  // Recibe las coordenadas del visor 360°
  capture(scene, { x, y }) {
    if (!scene || !Number.isFinite(x) ||
        !Number.isFinite(y)) {
      return;
    }

    this.setSceneIfChanged(scene);

    this.point = {
      x: Number((x * 100).toFixed(2)),
      y: Number((y * 100).toFixed(2))
    };

    this.xLabel.textContent = `${this.point.x}%`;
    this.yLabel.textContent = `${this.point.y}%`;

    this.panel.hidden = false;
    this.message.textContent = 'Posición capturada.';
  }

  setSceneIfChanged(scene) {
    if (this.scene?.id !== scene.id) {
      this.setScene(scene);
    }
  }

  // Genera el objeto para interiores.js
  getCode() {
    if (!this.point) return null;

    const selected = this.scenes.find(
      (scene) => scene.id === this.destination.value
    );

    if (!selected) return null;

    const hotspot = {
      x: this.point.x,
      y: this.point.y,
      to: selected.id,
      style: 'wayfinding',
      direction: this.direction.value,
      label: this.label.value.trim() || selected.title,
      arrivalYaw: Number(this.yaw.value) || 0
    };

    return (
      `// Escena de origen: ${this.scene.id}\n` +
      JSON.stringify(hotspot, null, 2)
    );
  }

  async copy() {
    const code = this.getCode();

    if (!code) {
      this.message.textContent =
        'Primero seleccioná un punto de la imagen.';
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.message.textContent = 'Código copiado.';
    } catch {
      this.message.textContent =
        'No se pudo copiar. Revisá los permisos del navegador.';
    }
  }
}
