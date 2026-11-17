import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SETTINGS } from '../config/settings.js';
import { WalkPhysics } from '../physics/WalkPhysics.js';

const DOWN = new THREE.Vector3(0, -1, 0);
const UP = new THREE.Vector3(0, 1, 0);
const MOVEMENT_KEYS = [
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'ShiftLeft', 'ShiftRight',
];
const STORAGE_KEY = 'escuela.walkStart.v1';

export function createNavigation(camera, canvas, building, onModeChanged, notify = () => {}) {
  const orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.075;
  orbit.maxDistance = building.focus.radius * 6;

  const walk = new PointerLockControls(camera, canvas);
  walk.pointerSpeed = SETTINGS.mouseSensitivity;

  const physics = new WalkPhysics(building.colliders, {
    radius: SETTINGS.playerRadius,
    height: SETTINGS.playerHeight,
    gravity: SETTINGS.gravity,
  });

  const raycaster = new THREE.Raycaster();
  raycaster.firstHitOnly = true;

  const keys = new Set();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const move = new THREE.Vector3();

  let mode = 'orbit';
  let picking = false;
  let marker = null;

  // ---------- Punto de inicio ----------
  function readSavedStart() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.z)) return saved;
    } catch { /* sin datos guardados */ }
    return null;
  }

  function groundHeightAt(x, z) {
    raycaster.set(new THREE.Vector3(x, building.bounds.max.y + 5, z), DOWN);
    raycaster.far = Infinity;
    const hit = raycaster.intersectObjects(building.colliders, false)[0];
    return hit ? hit.point.y : building.bounds.min.y;
  }

  function getStart() {
    const s = readSavedStart() ?? SETTINGS.walkStart;
    const y = s.y ?? groundHeightAt(s.x, s.z);
    return { x: s.x, y, z: s.z, yaw: THREE.MathUtils.degToRad(s.yaw ?? 0) };
  }

  function placeMarker(point) {
    if (!marker) {
      marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 6, 16),
        new THREE.MeshBasicMaterial({ color: 0xe5484d })
      );
      marker.raycast = () => {};
      building.object.parent.add(marker);
    }
    marker.position.set(point.x, point.y + 3, point.z);
    marker.visible = true;
  }

  function startPicking() {
    if (mode !== 'orbit') return;
    picking = true;
    canvas.style.cursor = 'crosshair';
    notify('Tocá en el modelo el lugar donde querés empezar (por ejemplo, la entrada)');
  }

  function savePickedStart(point) {
    const c = building.focus.center;
    // Mira hacia el centro de la escuela
    const yawDeg = THREE.MathUtils.radToDeg(Math.atan2(-(c.x - point.x), -(c.z - point.z)));
    const start = {
      x: +point.x.toFixed(2),
      y: +point.y.toFixed(2),
      z: +point.z.toFixed(2),
      yaw: Math.round(yawDeg),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(start)); } catch { /* ignorar */ }

    const text = `walkStart: { x: ${start.x}, y: ${start.y}, z: ${start.z}, yaw: ${start.yaw} }`;
    console.log('Punto de inicio fijado. Copiá esto en src/config/settings.js:\n' + text);
    try { navigator.clipboard?.writeText(text); } catch { /* ignorar */ }
    notify(`Inicio fijado ✓ ${text}`);
    placeMarker(point);
  }

  let downX = 0;
  let downY = 0;
  canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('pointerup', (e) => {
    if (!picking || mode !== 'orbit') return;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return; // fue un arrastre
    const rect = canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(ndc, camera);
    raycaster.far = Infinity;
    const hit = raycaster.intersectObjects(building.colliders, false)[0];
    if (!hit) return;
    picking = false;
    canvas.style.cursor = '';
    savePickedStart(hit.point);
  });

  // ---------- Modos ----------
  function emitChange() {
    onModeChanged(mode);
  }

  function reset() {
    walk.unlock();
    mode = 'orbit';
    keys.clear();
    orbit.enabled = true;

    const { center, radius } = building.focus;
    camera.position.copy(center).add(new THREE.Vector3(radius * 0.9, radius * 0.55, radius * 0.95));
    orbit.target.copy(center);
    camera.lookAt(center);
    orbit.update();
    emitChange();
  }

  function respawn() {
    const s = getStart();
    physics.teleport(s.x, s.y + 0.05, s.z);
    camera.rotation.set(0, s.yaw, 0, 'YXZ');
    camera.position.set(s.x, s.y + 0.05 + SETTINGS.cameraHeight, s.z);
  }

  function setMode(nextMode) {
    if (nextMode !== 'walk') {
      reset();
      return;
    }
    picking = false;
    canvas.style.cursor = '';
    if (marker) marker.visible = false;
    mode = 'walk';
    orbit.enabled = false;
    respawn();
    walk.lock();
    emitChange();
  }

  function onKeyDown(event) {
    if (!MOVEMENT_KEYS.includes(event.code) && event.code !== 'KeyR') return;
    if (event.code === 'KeyR') {
      if (mode === 'walk') respawn();
      return;
    }
    keys.add(event.code);
    if (mode === 'walk') event.preventDefault();
  }

  function onKeyUp(event) {
    keys.delete(event.code);
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  walk.addEventListener('unlock', () => {
    if (mode !== 'walk') return;
    mode = 'orbit';
    orbit.enabled = true;
    orbit.target.copy(camera.position).addScaledVector(UP, -SETTINGS.cameraHeight)
      .add(new THREE.Vector3(0, 0, -5));
    orbit.update();
    emitChange();
  });

  function update(deltaSeconds) {
    if (mode === 'orbit') {
      orbit.update();
      return;
    }
    if (!walk.isLocked) return;

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, UP).normalize();
    move.set(0, 0, 0);

    if (keys.has('KeyW') || keys.has('ArrowUp')) move.add(forward);
    if (keys.has('KeyS') || keys.has('ArrowDown')) move.sub(forward);
    if (keys.has('KeyD') || keys.has('ArrowRight')) move.add(right);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) move.sub(right);

    if (move.lengthSq() > 0) {
      const running = keys.has('ShiftLeft') || keys.has('ShiftRight');
      const speed = SETTINGS.walkSpeed * (running ? SETTINGS.runMultiplier : 1);
      move.normalize().multiplyScalar(speed);
    }

    physics.step(deltaSeconds, move);

    // Si se cayó fuera del modelo, vuelve al inicio
    if (physics.position.y < building.bounds.min.y - 30) respawn();

    camera.position.set(
      physics.position.x,
      physics.position.y + SETTINGS.cameraHeight,
      physics.position.z
    );
  }

  reset();
  return { reset, setMode, update, startPicking, getMode: () => mode };
}
