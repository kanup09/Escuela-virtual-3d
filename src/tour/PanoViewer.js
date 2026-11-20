import * as THREE from 'three';

// Posición de un punto de la imagen (u, v entre 0 y 1) como dirección 3D
function directionFromImage(u, v) {
  const lon = THREE.MathUtils.degToRad(-270 + 360 * u);
  const lat = THREE.MathUtils.degToRad((0.5 - v) * 180);
  return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), -Math.cos(lon) * Math.cos(lat));
}

// Visor de panoramas 360° (imagen equirectangular, proporción 2:1).
export class PanoViewer {
  constructor(container, image, {
    yaw = 0,
    autoRotate = false,
    minYaw = null,   // límite hacia la izquierda, en grados desde el centro inicial
    maxYaw = null,   // límite hacia la derecha
    minPitch = null, // límite hacia abajo (como máximo -85)
    maxPitch = null, // límite hacia arriba (como máximo 85)
    onPick = null,
  } = {}) {
    this.container = container;
    this.lon = -90 + yaw; // -90 = centro de la imagen
    this.lat = 0;
    this.fov = 75;

    // Límites de giro (relativos al centro inicial de la imagen)
    const center = this.lon;
    this.minLon = minYaw == null ? -Infinity : center + minYaw;
    this.maxLon = maxYaw == null ? Infinity : center + maxYaw;
    this.minLat = Math.max(-85, minPitch ?? -85);
    this.maxLat = Math.min(85, maxPitch ?? 85);
    this.autoRotate = autoRotate;
    this.running = true;
    this.hotspots = [];
    this.onPick = onPick;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'pano-canvas';
    container.appendChild(this.canvas);

    this.layer = document.createElement('div');
    this.layer.className = 'pano-layer';
    container.appendChild(this.layer);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1100);

    // Si la imagen es más grande de lo que soporta la placa de video, se reduce
    const max = this.renderer.capabilities.maxTextureSize;
    let source = image;
    if (image.naturalWidth > max) {
      const c = document.createElement('canvas');
      c.width = max;
      c.height = Math.round(max * image.naturalHeight / image.naturalWidth);
      c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
      source = c;
    }
    this.texture = new THREE.Texture(source);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.texture.needsUpdate = true;

    const geometry = new THREE.SphereGeometry(500, 64, 40);
    geometry.scale(-1, 1, 1);
    this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ map: this.texture }));
    this.scene.add(this.mesh);

    const raycaster = new THREE.Raycaster();
    let drag = null;
    this.onDown = (e) => {
      if (e.target.closest?.('.hotspot')) {
        return;
      }
      drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
      this.autoRotate = false;
      this.container.setPointerCapture?.(e.pointerId);
    };
    this.onMove = (e) => {
      if (!drag) return;
      const k = 0.12 * (this.fov / 75);
      this.lon -= (e.clientX - drag.x) * k;
      this.lat += (e.clientY - drag.y) * k;
      this.clampView();
      drag.x = e.clientX; drag.y = e.clientY;
    };
    this.onUp = (e) => {
      if (drag && this.onPick && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 5) {
        // Clic sin arrastrar (modo ?debug): devuelve la posición en la imagen
        const rect = this.canvas.getBoundingClientRect();
        const ndc = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        raycaster.setFromCamera(ndc, this.camera);
        const hit = raycaster.intersectObject(this.mesh)[0];
        if (hit?.uv) this.onPick({ x: hit.uv.x, y: 1 - hit.uv.y });
      }
      drag = null;
    };
    this.onWheel = (e) => { e.preventDefault(); this.setFov(this.fov + e.deltaY * 0.05); this.autoRotate = false; };
    
    // ==========================================
    // CONTROLES Y CAPTURA DE COORDENADAS
    // ==========================================

    // Escuchar sobre el contenedor completo:
    // funciona incluso si pano-layer está
    // por encima del canvas.

    this.container.style.touchAction = 'none';

    this.container.addEventListener(
      'pointerdown',
      this.onDown
    );

    this.container.addEventListener(
      'pointermove',
      this.onMove
    );

    this.container.addEventListener(
      'pointerup',
      this.onUp
    );

    this.onCancel = () => {
      drag = null;
    };

    this.container.addEventListener(
      'pointercancel',
      this.onCancel
    );

    this.container.addEventListener(
      'wheel',
      this.onWheel,
      { passive: false }
    );


    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    const forward = new THREE.Vector3();
    const point = new THREE.Vector3();
    this.last = performance.now();
    this.loop = (now) => {
      this.raf = requestAnimationFrame(this.loop);
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      if (!this.running) return;
      if (this.autoRotate) this.lon += 4 * dt;
      this.clampView();
      const phi = THREE.MathUtils.degToRad(this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon);
      this.camera.lookAt(Math.sin(theta) * Math.cos(phi), Math.sin(phi), -Math.cos(theta) * Math.cos(phi));
      this.camera.updateMatrixWorld();
      this.renderer.render(this.scene, this.camera);

      // Botones sobre la imagen: siguen su punto al girar
      if (this.hotspots.length) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.getWorldDirection(forward);
        for (const hs of this.hotspots) {
          if (hs.dir.dot(forward) < 0.05) { hs.el.style.display = 'none'; continue; }
          point.copy(hs.dir).multiplyScalar(100).project(this.camera);
          hs.el.style.display = '';
          hs.el.style.transform = `translate(${(point.x * 0.5 + 0.5) * w}px, ${(-point.y * 0.5 + 0.5) * h}px) translate(-50%, -50%)`;
        }
      }
    };
    this.raf = requestAnimationFrame(this.loop);
  }

  // ==========================================
  // ACTIVAR O ACTUALIZAR EL EDITOR
  // ==========================================

  setPickHandler(callback) {
    this.onPick =
      typeof callback === 'function'
        ? callback
        : null;
  }

  // x, y en % de la imagen
  addHotspot(el, x, y) {
    el.classList.add('pano');
    el.style.display = 'none';
    this.layer.appendChild(el);
    this.hotspots.push({ el, dir: directionFromImage(x / 100, y / 100) });
  }


  // ==========================================
  // OBTENER ESTADO ACTUAL DE LA CÁMARA
  // ==========================================

  getViewState() {
    return {
      lon: this.lon,
      lat: this.lat,
      fov: this.fov,

      // Conservamos los límites originales
      minLon: this.minLon,
      maxLon: this.maxLon
    };
  }

  // ==========================================
  // RESTAURAR ESTADO DE LA CÁMARA
  // ==========================================

  setViewState(state) {
    if (!state) {
      return;
    }

    // Recuperar límites anteriores
    if (typeof state.minLon === 'number') {
      this.minLon = state.minLon;
    }

    if (typeof state.maxLon === 'number') {
      this.maxLon = state.maxLon;
    }

    // Recuperar orientación
    if (Number.isFinite(state.lon)) {
      this.lon = state.lon;
    }

    if (Number.isFinite(state.lat)) {
      this.lat = state.lat;
    }

    // Recuperar zoom
    if (Number.isFinite(state.fov)) {
      this.setFov(state.fov);
    }

    // Respetar límites de giro
    this.clampView();

    // Evitar movimiento automático
    this.autoRotate = false;
  }

  clampView() {
    this.lon = Math.max(this.minLon, Math.min(this.maxLon, this.lon));
    this.lat = Math.max(this.minLat, Math.min(this.maxLat, this.lat));
  }

  setFov(value) {
    this.fov = Math.max(35, Math.min(100, value));
    this.camera.fov = this.fov;
    this.camera.updateProjectionMatrix();
  }

  zoomBy(factor) { this.setFov(this.fov / factor); this.autoRotate = false; }
  pause() { this.running = false; }
  resume() { this.running = true; this.last = performance.now(); this.resize(); }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  
  dispose() {
    cancelAnimationFrame(this.raf);

    this.resizeObserver.disconnect();

    // Eliminar controles del visor
    this.container.removeEventListener(
      'pointerdown',
      this.onDown
    );

    this.container.removeEventListener(
      'pointermove',
      this.onMove
    );

    this.container.removeEventListener(
      'pointerup',
      this.onUp
    );

    this.container.removeEventListener(
      'pointercancel',
      this.onCancel
    );

    this.container.removeEventListener(
      'wheel',
      this.onWheel
    );

    // Liberar recursos de Three.js
    this.texture.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

    this.renderer.dispose();

    this.canvas.remove();
    this.layer.remove();
  }

}
