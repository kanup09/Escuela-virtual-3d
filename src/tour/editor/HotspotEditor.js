import './hotspotEditor.css';

export class HotspotEditor {
  constructor(root, scenes) {
    this.scenes = scenes;
    this.scene = null;
    this.point = null;
    this.viewer = null;
    this.targets = [];
    this.activeTarget = null;
    this.preview = null;
    this.drafts = new WeakMap();

    this.panel = document.createElement('aside');
    this.panel.className = 'hotspot-editor';
    this.panel.innerHTML = `
      <div class="he-title">
        <strong>Editor de flechas</strong>
        <button type="button" data-he="close" aria-label="Cerrar editor">×</button>
      </div>

      <p class="he-scene">Elegí un punto en la imagen</p>

      <label>
        Flecha
        <select data-he="target">
          <option value="new">Nueva flecha</option>
        </select>
      </label>

      <div class="he-grid he-position">
        <label>
          Posición X (%)
          <input data-he="x" type="number" min="0" max="100" step="0.01">
        </label>
        <label>
          Posición Y (%)
          <input data-he="y" type="number" min="0" max="100" step="0.01">
        </label>
      </div>

      <label>
        Destino
        <select data-he="destination"></select>
      </label>

      <label>
        Dirección
        <select data-he="direction">
          <option value="forward">Adelante</option>
          <option value="back">Atrás</option>
          <option value="left">Izquierda</option>
          <option value="right">Derecha</option>
        </select>
      </label>

      <div class="he-grid he-rotation">
        <label>
          Inclinación horizontal (X)
          <input data-he="rotateX" type="number" step="1" value="0">
        </label>
        <label>
          Rotación/orientación (Y)
          <input data-he="rotateY" type="number" step="1" value="0">
        </label>
        <label>
          Inclinación vertical (Z)
          <input data-he="rotateZ" type="number" step="1" value="0">
        </label>
      </div>

      <label>
        Escala
        <input data-he="scale" type="number" min="0.2" max="3" step="0.05" value="1">
      </label>

      <label>
        Nombre del destino
        <input data-he="label" placeholder="Ej. Planta Alta 1">
      </label>

      <label>
        Orientación de cámara al llegar (arrivalYaw)
        <input data-he="yaw" type="number" step="5" value="0">
      </label>

      <button type="button" data-he="copy">
        Copiar configuración
      </button>

      <p class="he-help">
        Para crear una flecha, hacé clic en el piso o camino. Ajustá los controles
        para ver la vista previa en la panorámica.
      </p>

      <p class="he-message" aria-live="polite"></p>
    `;

    root.appendChild(this.panel);

    this.targetSelect = this.panel.querySelector('[data-he="target"]');
    this.xInput = this.panel.querySelector('[data-he="x"]');
    this.yInput = this.panel.querySelector('[data-he="y"]');
    this.destination = this.panel.querySelector('[data-he="destination"]');
    this.direction = this.panel.querySelector('[data-he="direction"]');
    this.rotateX = this.panel.querySelector('[data-he="rotateX"]');
    this.rotateY = this.panel.querySelector('[data-he="rotateY"]');
    this.rotateZ = this.panel.querySelector('[data-he="rotateZ"]');
    this.scale = this.panel.querySelector('[data-he="scale"]');
    this.label = this.panel.querySelector('[data-he="label"]');
    this.yaw = this.panel.querySelector('[data-he="yaw"]');
    this.message = this.panel.querySelector('.he-message');

    for (const scene of scenes.filter((item) => item.group === 'interior')) {
      const option = document.createElement('option');
      option.value = scene.id;
      option.textContent = scene.title;
      this.destination.appendChild(option);
    }

    this.targetSelect.addEventListener('change', () => this.selectTarget());
    this.destination.addEventListener('change', () => {
      const selected = this.scenes.find(
        (scene) => scene.id === this.destination.value
      );
      if (selected) this.label.value = selected.title;
      this.updatePreview();
    });

    for (const input of this.panel.querySelectorAll('input, select')) {
      if (input === this.targetSelect || input === this.destination) continue;
      input.addEventListener('input', () => this.updatePreview());
      input.addEventListener('change', () => this.updatePreview());
    }

    this.panel.querySelector('[data-he="copy"]')
      .addEventListener('click', () => this.copy());

    this.panel.querySelector('[data-he="close"]')
      .addEventListener('click', () => {
        this.panel.hidden = true;
      });
  }

  setScene(scene) {
    this.clearPreview();
    this.scene = scene;
    this.targets = [];
    this.activeTarget = null;
    this.point = null;

    this.panel.querySelector('.he-scene').textContent =
      `Origen: ${scene.title}`;
    this.message.textContent = '';
    this.populateTargets();

    const destination = this.scenes.find(
      (item) => item.id !== scene.id && item.group === 'interior'
    );
    if (destination) {
      this.destination.value = destination.id;
      this.label.value = destination.title;
    }

    this.setPosition(null);
    this.setDefaults();
  }

  setViewer(viewer, targets = []) {
    this.clearPreview();
    this.viewer = viewer;
    this.targets = targets;
    this.populateTargets();
  }

  populateTargets() {
    this.targetSelect.replaceChildren();

    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = 'Nueva flecha';
    this.targetSelect.appendChild(newOption);

    this.targets.forEach(({ config }, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = config.label || config.to || `Flecha ${index + 1}`;
      this.targetSelect.appendChild(option);
    });

    this.targetSelect.value = 'new';
  }

  selectTarget() {
    const index = Number(this.targetSelect.value);
    const target = this.targetSelect.value === 'new'
      ? null
      : this.targets[index];

    this.clearPreview();
    this.activeTarget = target ?? null;

    if (!target) {
      this.point = null;
      this.setPosition(null);
      this.setDefaults();
      this.message.textContent = 'Seleccioná una posición en la panorámica.';
      return;
    }

    const config = this.drafts.get(target.config) ?? target.config;
    this.point = { x: config.x, y: config.y };
    this.setForm(config);
    this.setPosition(this.point);
    this.panel.hidden = false;
    this.updatePreview();
  }

  setForm(config) {
    this.destination.value = config.to ?? '';
    this.direction.value = config.direction ?? 'forward';
    this.rotateX.value = config.rotateX ?? 0;
    this.rotateY.value = config.rotateY ?? 0;
    this.rotateZ.value = config.rotateZ ?? 0;
    this.scale.value = config.scale ?? 1;
    this.label.value = config.label ?? '';
    this.yaw.value = config.arrivalYaw ?? 0;
  }

  setDefaults() {
    this.direction.value = 'forward';
    this.rotateX.value = '0';
    this.rotateY.value = '0';
    this.rotateZ.value = '0';
    this.scale.value = '1';
    this.yaw.value = '0';
  }

  setPosition(point) {
    this.xInput.value = point ? point.x : '';
    this.yInput.value = point ? point.y : '';
    this.point = point;
  }

  capture(scene, { x, y }) {
    if (!scene || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (this.scene?.id !== scene.id) this.setScene(scene);

    this.setPosition({
      x: Number((x * 100).toFixed(2)),
      y: Number((y * 100).toFixed(2)),
    });
    this.panel.hidden = false;
    this.message.textContent = 'Posición capturada; vista previa actualizada.';
    this.updatePreview();
  }

  getConfig() {
    const x = Number(this.xInput.value);
    const y = Number(this.yInput.value);
    const arrivalYaw = Number(this.yaw.value);
    const scale = Number(this.scale.value);
    const rotateX = Number(this.rotateX.value);
    const rotateY = Number(this.rotateY.value);
    const rotateZ = Number(this.rotateZ.value);

    if (
      !this.scene ||
      this.xInput.value.trim() === '' ||
      this.yInput.value.trim() === '' ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 0 || x > 100 ||
      y < 0 || y > 100 ||
      !this.destination.value ||
      !Number.isFinite(arrivalYaw) ||
      !Number.isFinite(scale) ||
      !Number.isFinite(rotateX) ||
      !Number.isFinite(rotateY) ||
      !Number.isFinite(rotateZ) ||
      scale < 0.2 ||
      scale > 3
    ) {
      return null;
    }

    return {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      to: this.destination.value,
      style: 'wayfinding',
      direction: this.direction.value,
      rotateX,
      rotateY,
      rotateZ,
      scale,
      label: this.label.value.trim() ||
        this.destination.selectedOptions[0]?.textContent ||
        this.destination.value,
      arrivalYaw,
    };
  }

  updatePreview() {
    const config = this.getConfig();
    if (!config) return;

    this.point = { x: config.x, y: config.y };
    if (!this.viewer) return;

    let target;
    if (this.activeTarget) {
      target = this.activeTarget.instance;
      this.drafts.set(this.activeTarget.config, config);
    } else {
      if (!this.preview) {
        const label = document.createElement('button');
        label.type = 'button';
        label.className = 'hotspot hotspot--wayfinding';
        const text = document.createElement('span');
        text.className = 'hotspot-text';
        label.appendChild(text);
        this.preview = this.viewer.addWayfindingHotspot(
          label,
          config.x,
          config.y,
          config
        );
      }
      target = this.preview;
    }

    this.viewer.updateWayfindingHotspot(target, config);
    const text = target.label.querySelector('.hotspot-text');
    if (text) text.textContent = config.label;
  }

  clearPreview() {
    if (this.preview && this.viewer) {
      this.viewer.removeWayfindingHotspot(this.preview);
    }
    this.preview = null;
  }

  getCode() {
    const config = this.getConfig();
    if (!config || !this.point) return null;

    return (
      `// Escena de origen: ${this.scene.id}\n` +
      JSON.stringify(config, null, 2)
    );
  }

  async copy() {
    const code = this.getCode();

    if (!code) {
      this.message.textContent =
        'Seleccioná una posición y completá los datos de la flecha.';
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      this.message.textContent = 'Configuración copiada.';
    } catch {
      this.message.textContent =
        'No se pudo copiar. Revisá los permisos del navegador.';
    }
  }
}
