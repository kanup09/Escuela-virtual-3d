import { createScene } from './core/createScene.js';
import { loadBuilding } from './models/loadBuilding.js';
import { createNavigation } from './controls/Navigation.js';
import { setupButtons } from './ui/setupButtons.js';

const app = document.querySelector('#app');
const status = document.querySelector('#status');
let navigation = null;
let initPromise = null;
let active = false;

async function init() {
  const viewer = document.querySelector('#viewer');
  const { scene, camera, renderer } = createScene(viewer);

  try {
    const building = await loadBuilding(scene);
    status.textContent = building.source === 'DEMO'
      ? 'Modelo de prueba · Esperando tu escuela'
      : `Modelo cargado: ${building.source}`;

    let updateUI = () => {};
    navigation = createNavigation(
      camera,
      renderer.domElement,
      building,
      (mode) => updateUI(mode),
      (message) => { status.textContent = message; }
    );

    updateUI = setupButtons(navigation);
    let previousTime = performance.now();

    function animate(currentTime) {
      requestAnimationFrame(animate);
      const deltaSeconds = (currentTime - previousTime) / 1000;
      previousTime = currentTime;
      if (!active) return; // no dibuja mientras se ve el tour
      navigation.update(deltaSeconds);
      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
  } catch (error) {
    console.error('Error al iniciar el recorrido:', error);
    status.textContent = 'Error al cargar la escena';
  }
}

export function setBackHandler(handler) {
  document.querySelector('#back-tour').onclick = handler;
}

export async function showViewer3D() {
  app.hidden = false;
  active = true;
  initPromise ??= init();
  await initPromise;
  window.dispatchEvent(new Event('resize'));
}

export function hideViewer3D() {
  active = false;
  navigation?.reset();
  app.hidden = true;
}
