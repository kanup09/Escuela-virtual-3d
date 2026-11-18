import * as THREE from 'three';

// Visor de panoramas 360° (imagen equirectangular, proporción 2:1).
export class PanoViewer {
  constructor(container, image, { yaw = 0 } = {}) {
    this.container = container;
    this.lon = -90 + yaw; // -90 = centro de la imagen
    this.lat = 0;
    this.fov = 75;
    this.autoRotate = true;
    this.running = true;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.canvas = this.renderer.domElement;
    this.canvas.className = 'pano-canvas';
    container.appendChild(this.canvas);

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

    let drag = null;
    this.onDown = (e) => { drag = { x: e.clientX, y: e.clientY }; this.autoRotate = false; this.canvas.setPointerCapture?.(e.pointerId); };
    this.onMove = (e) => {
      if (!drag) return;
      const k = 0.12 * (this.fov / 75);
      this.lon -= (e.clientX - drag.x) * k;
      this.lat += (e.clientY - drag.y) * k;
      this.lat = Math.max(-85, Math.min(85, this.lat));
      drag = { x: e.clientX, y: e.clientY };
    };
    this.onUp = () => { drag = null; };
    this.onWheel = (e) => { e.preventDefault(); this.setFov(this.fov + e.deltaY * 0.05); this.autoRotate = false; };
    this.canvas.addEventListener('pointerdown', this.onDown);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerup', this.onUp);
    this.canvas.addEventListener('pointercancel', this.onUp);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    this.last = performance.now();
    this.loop = (now) => {
      this.raf = requestAnimationFrame(this.loop);
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      if (!this.running) return;
      if (this.autoRotate) this.lon += 4 * dt; // gira despacio hasta que lo tocan
      const phi = THREE.MathUtils.degToRad(this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon);
      this.camera.lookAt(Math.sin(theta) * Math.cos(phi), Math.sin(phi), -Math.cos(theta) * Math.cos(phi));
      this.renderer.render(this.scene, this.camera);
    };
    this.raf = requestAnimationFrame(this.loop);
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
    this.texture.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.renderer.dispose();
    this.canvas.remove();
  }
}
