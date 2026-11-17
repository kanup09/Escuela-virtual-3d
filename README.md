import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { SETTINGS } from '../config/settings.js';

const UP = new THREE.Vector3(0, 1, 0);
const MOVEMENT_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

export function createNavigation(camera, canvas, building, onModeChanged) {
  const orbit = new OrbitControls(camera, canvas);
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.075;

  const walk = new PointerLockControls(camera, canvas);
  walk.pointerSpeed = SETTINGS.mouseSensitivity;

  const keys = new Set();
  const radius = Math.max(building.size.x, building.size.y, building.size.z, 10);
  const eyeHeight = Math.min(Math.max(SETTINGS.cameraHeight, building.size.y * 0.07), 3.2);

  let mode = 'orbit';
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const movement = new THREE.Vector3();

  function emitChange() {
    onModeChanged(mode);
  }

  function reset() {
    walk.unlock();
    mode = 'orbit';
    keys.clear();
    orbit.enabled = true;

    camera.position.copy(building.center).add(
      new THREE.Vector3(radius * 0.9, radius * 0.55, radius * 0.95)
    );
    orbit.target.copy(building.center);
    camera.lookAt(building.center);
    orbit.update();
    emitChange();
  }

  function setMode(nextMode) {
    if (nextMode !== 'walk') {
      reset();
      return;
    }

    mode = 'walk';
    orbit.enabled = false;
    camera.position.set(
      building.center.x,
      (building.terrainBounds?.min.y ?? building.bounds.min.y) + eyeHeight,
      building.bounds.max.z + Math.max(4, radius * 0.15)
    );
    camera.lookAt(building.center.x, camera.position.y, building.center.z);
    walk.lock();
    emitChange();
  }

  function onKeyDown(event) {
    if (!MOVEMENT_KEYS.includes(event.code)) return;
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
    orbit.target.copy(camera.position).add(new THREE.Vector3(0, 0, -5));
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
    movement.set(0, 0, 0);

    if (keys.has('KeyW') || keys.has('ArrowUp')) movement.add(forward);
    if (keys.has('KeyS') || keys.has('ArrowDown')) movement.sub(forward);
    if (keys.has('KeyD') || keys.has('ArrowRight')) movement.add(right);
    if (keys.has('KeyA') || keys.has('ArrowLeft')) movement.sub(right);

    if (movement.lengthSq() > 0) {
      const speed = SETTINGS.walkSpeed;
      const safeDelta = Math.min(deltaSeconds, 0.05);
      camera.position.addScaledVector(movement.normalize(), safeDelta * speed);
    }
  }

  reset();
  return { reset, setMode, update, getMode: () => mode };
}


## Ajustes de visualización del OBJ (17/11)

- La iluminación se redujo para evitar que la geometría sin MTL se vea quemada.
- El encuadre en órbita ahora se calcula a partir de la arquitectura elevada y no de toda la parcela (que mide aproximadamente 307 × 407 metros).
- `src/models/calculateArchitectureBounds.js` contiene la lógica modular del encuadre.
- Sigue faltando el MTL y las texturas originales.
- El recorrido WASD no tiene colisiones ni detección de pisos; se ajustará con el modelo definitivo.
