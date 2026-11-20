import * as THREE from 'three';

// Posición de un punto de la imagen (u, v entre 0 y 1) como dirección 3D
function directionFromImage(u, v) {
  const lon = THREE.MathUtils.degToRad(-270 + 360 * u);
  const lat = THREE.MathUtils.degToRad((0.5 - v) * 180);
  return new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.sin(lat), -Math.cos(lon) * Math.cos(lat));
}

function wayfindingPlacement(x, y, config = {}) {
  const direction = directionFromImage(x / 100, y / 100);
  const horizontal = new THREE.Vector3(direction.x, 0, direction.z).normalize();
  const floorY = -2.2;
  const distance = THREE.MathUtils.clamp(
    direction.y < -0.02 ? floorY / direction.y : 16,
    5,
    18
  );
  const basePosition = horizontal.multiplyScalar(distance);
  basePosition.y = floorY;
  const offsets = { forward: 0, right: 90, back: 180, left: -90 };
  const radialBearing = Math.atan2(direction.x, -direction.z);
  const bearing = Number.isFinite(config.heading)
    ? THREE.MathUtils.degToRad(config.heading)
    : radialBearing + THREE.MathUtils.degToRad(
        offsets[config.direction] ?? 0
      );

  return { direction, basePosition, bearing };
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
    this.wayfindingHotspots = [];
    this.wayfindingRaycaster = new THREE.Raycaster();
    this.wayfindingPointer = null;
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

      const wayfinding = this.getWayfindingAt(e);
      if (wayfinding) {
        this.wayfindingPointer = {
          hotspot: wayfinding,
          x: e.clientX,
          y: e.clientY,
        };
        this.container.setPointerCapture?.(e.pointerId);
        return;
      }

      drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
      this.autoRotate = false;
      this.container.setPointerCapture?.(e.pointerId);
    };
    this.onMove = (e) => {
      if (e.pointerType !== 'touch' && !drag && !this.wayfindingPointer) {
        this.setHoveredWayfinding(this.getWayfindingAt(e));
      }

      if (this.wayfindingPointer) {
        return;
      }

      if (!drag) return;
      const k = 0.12 * (this.fov / 75);
      this.lon -= (e.clientX - drag.x) * k;
      this.lat += (e.clientY - drag.y) * k;
      this.clampView();
      drag.x = e.clientX; drag.y = e.clientY;
    };
    this.onUp = (e) => {
      if (this.wayfindingPointer) {
        const pressed = this.wayfindingPointer;
        this.wayfindingPointer = null;
        const released = this.getWayfindingAt(e);
        if (
          pressed.hotspot === released &&
          Math.hypot(e.clientX - pressed.x, e.clientY - pressed.y) < 12
        ) {
          pressed.hotspot.label.click();
        }
        return;
      }

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
    this.onLeave = () => {
      if (!this.wayfindingPointer) {
        this.setHoveredWayfinding(null);
      }
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
      this.wayfindingPointer = null;
      this.setHoveredWayfinding(null);
    };

    this.container.addEventListener(
      'pointercancel',
      this.onCancel
    );

    this.container.addEventListener(
      'pointerleave',
      this.onLeave
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
    const toHotspot = new THREE.Vector3();
    this.last = performance.now();
    this.loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
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

      if (this.wayfindingHotspots.length) {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        this.camera.getWorldDirection(forward);

        for (const hotspot of this.wayfindingHotspots) {
          const pulse = Math.sin(now * 0.002 + hotspot.phase);
          hotspot.group.scale.setScalar(1 + pulse * 0.012);
          hotspot.arrowTransform.scale.setScalar(
            hotspot.scale * (hotspot.hovered ? 1.045 : 1)
          );
          hotspot.group.position
            .copy(hotspot.basePosition)
            .addScaledVector(hotspot.forward, pulse * 0.06);
          hotspot.material.opacity = 1;
          hotspot.outlineMaterial.opacity = hotspot.hovered ? 0.95 : 0.58;
          for (let i = 0; i < hotspot.shadowMaterials.length; i++) {
            hotspot.shadowMaterials[i].opacity =
              hotspot.shadowOpacities[i] * (hotspot.hovered ? 1.12 : 1);
          }

          toHotspot.copy(hotspot.group.position);
          if (toHotspot.dot(forward) <= 0) {
            hotspot.label.style.display = 'none';
            continue;
          }

          point.copy(hotspot.group.position).project(this.camera);
          if (
            point.z > 1 ||
            Math.abs(point.x) > 1 ||
            Math.abs(point.y) > 1
          ) {
            hotspot.label.style.display = 'none';
            continue;
          }

          hotspot.label.style.display = '';
          hotspot.label.style.left = `${(point.x * 0.5 + 0.5) * w}px`;
          hotspot.label.style.top = `${(-point.y * 0.5 + 0.5) * h}px`;
          hotspot.label.style.transform ='translate(-50%, calc(-50% - 22px))';
        }
      }

      this.raf = requestAnimationFrame(this.loop);
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

  addWayfindingHotspot(label, x, y, options = {}) {
    if (typeof options === 'number') options = { heading: options };
    if (!options) options = {};
    const { direction, basePosition, bearing } =
      wayfindingPlacement(x, y, options);

    const group = new THREE.Group();
    group.position.copy(basePosition);
    group.rotation.y = bearing;

    const shadowMaterials = [];
    const shadowOpacities = [0.045, 0.075, 0.11];
    for (const [index, opacity] of shadowOpacities.entries()) {
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(1, 32),
        new THREE.MeshBasicMaterial({
          color: 0x07121a,
          transparent: true,
          opacity,
          depthTest: false,
          depthWrite: false,
        })
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.012 + index * 0.002;
      const size = 1.65 - index * 0.3;
      shadow.scale.set(
        0.35 * size,
        0.55 * size,
        1
    );
      shadow.renderOrder = 8 + index;
      group.add(shadow);
      shadowMaterials.push(shadow.material);
    }

    const arrowTransform = new THREE.Group();
    group.add(arrowTransform);


    // ==========================================
    // FLECHA COMPACTA TIPO CHEVRON SÓLIDO
    // ==========================================

    const shape = new THREE.Shape();

    // Punta de la flecha
    shape.moveTo(0, 0.62);

    // Lateral derecho
    shape.lineTo(0.46, -0.48);

    // Hendidura central
    shape.lineTo(0, -0.22);

    // Lateral izquierdo
    shape.lineTo(-0.46, -0.48);

    // Cerrar silueta
    shape.closePath();


    const geometry = new THREE.ShapeGeometry(shape);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const arrow = new THREE.Mesh(geometry, material);
    arrow.rotation.x = -Math.PI / 2;
    arrow.renderOrder = 11;
    arrowTransform.add(arrow);

    const outlineGeometry = new THREE.BufferGeometry().setFromPoints(
      shape.getPoints(24)
    );
    const outlineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.58,
      depthTest: false,
      depthWrite: false,
    });
    const outline = new THREE.LineLoop(outlineGeometry, outlineMaterial);
    outline.rotation.x = -Math.PI / 2;
    outline.renderOrder = 12;
    arrowTransform.add(outline);

    const hitGeometry = new THREE.PlaneGeometry(
      1.4,
      1.6
    );
    const hitMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    const hitArea = new THREE.Mesh(hitGeometry, hitMaterial);
    hitArea.rotation.x = -Math.PI / 2;
    hitArea.renderOrder = 13;
    arrowTransform.add(hitArea);
    hitArea.userData.wayfindingHotspot = null;

    label.classList.add('pano', 'hotspot--wayfinding-label');
    label.style.display = 'none';
    this.layer.appendChild(label);

    const hotspot = {
      label,
      group,
      arrowTransform,
      hitArea,
      direction,
      forward: new THREE.Vector3(
        Math.sin(bearing),
        0,
        -Math.cos(bearing)
      ),
      basePosition: basePosition.clone(),
      material,
      outlineMaterial,
      shadowMaterials,
      shadowOpacities,
      scale: 1,
      phase: Math.random() * Math.PI * 2,
      hovered: false,
    };
    hitArea.userData.wayfindingHotspot = hotspot;
    this.scene.add(group);
    this.updateWayfindingHotspot(hotspot, { x, y, ...options });
    this.wayfindingHotspots.push(hotspot);
    return hotspot;
  }

  updateWayfindingHotspot(hotspot, config) {
    const x = Number.isFinite(config.x) ? config.x : hotspot.config.x;
    const y = Number.isFinite(config.y) ? config.y : hotspot.config.y;
    const { direction, basePosition, bearing } =
      wayfindingPlacement(x, y, config);

    const rotateX = Number.isFinite(config.rotateX) ? config.rotateX : 0;
    const rotateY = Number.isFinite(config.rotateY) ? config.rotateY : 0;
    const rotateZ = Number.isFinite(config.rotateZ) ? config.rotateZ : 0;
    const scale = Number.isFinite(config.scale) && config.scale > 0
      ? config.scale
      : 1;

    hotspot.direction.copy(direction);
    hotspot.basePosition.copy(basePosition);
    hotspot.group.position.copy(basePosition);
    hotspot.group.rotation.y = bearing;
    hotspot.forward.set(Math.sin(bearing), 0, -Math.cos(bearing));
    hotspot.arrowTransform.rotation.set(
      THREE.MathUtils.degToRad(rotateX),
      THREE.MathUtils.degToRad(rotateY),
      THREE.MathUtils.degToRad(rotateZ)
    );
    hotspot.scale = scale;
    hotspot.config = {
      ...config,
      x,
      y,
      rotateX,
      rotateY,
      rotateZ,
      scale,
    };
  }

  removeWayfindingHotspot(hotspot) {
    const index = this.wayfindingHotspots.indexOf(hotspot);
    if (index < 0) return;

    this.wayfindingHotspots.splice(index, 1);
    this.scene.remove(hotspot.group);
    hotspot.label.remove();
    this.setHoveredWayfinding(null);

    hotspot.group.traverse((child) => {
      child.geometry?.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material?.dispose();
      }
    });
  }

  getWayfindingAt(event) {
    if (!this.wayfindingHotspots.length) return null;

    const rect = this.canvas.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return null;
    }

    this.wayfindingRaycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      ),
      this.camera
    );

    const hits = this.wayfindingRaycaster.intersectObjects(
      this.wayfindingHotspots.map((hotspot) => hotspot.hitArea),
      false
    );
    return hits[0]?.object.userData.wayfindingHotspot ?? null;
  }

  setHoveredWayfinding(hotspot) {
    for (const item of this.wayfindingHotspots) {
      item.hovered = item === hotspot;
    }
    this.canvas.style.cursor = hotspot ? 'pointer' : 'grab';
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
  pause() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  resume() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.resize();
    this.raf = requestAnimationFrame(this.loop);
  }

  resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  
  dispose() {
    this.running = false;
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
      'pointerleave',
      this.onLeave
    );

    this.container.removeEventListener(
      'wheel',
      this.onWheel
    );

    this.container.style.touchAction = '';

    for (const hotspot of [...this.wayfindingHotspots]) {
      this.removeWayfindingHotspot(hotspot);
    }

    // Liberar recursos de Three.js
    this.texture.dispose();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

    this.renderer.dispose();

    this.canvas.remove();
    this.layer.remove();
  }

}
