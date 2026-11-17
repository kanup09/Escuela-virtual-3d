import { createScene } from './core/createScene.js';
import { loadBuilding } from './models/loadBuilding.js';
import { createNavigation } from './controls/Navigation.js';
import { setupButtons } from './ui/setupButtons.js';
import './styles/main.css';

const viewer = document.querySelector('#viewer');
const status = document.querySelector('#status');
const { scene, camera, renderer } = createScene(viewer);

try {
  const building = await loadBuilding(scene);
  status.textContent = building.source === 'DEMO'
    ? 'Modelo de prueba · Esperando tu escuela'
    : `Modelo cargado: ${building.source}`;

  let updateUI = () => {};
  const navigation = createNavigation(
    camera,
    renderer.domElement,
    building,
    (mode) => updateUI(mode)
  );

  updateUI = setupButtons(navigation);
  let previousTime = performance.now();

  function animate(currentTime) {
    requestAnimationFrame(animate);
    const deltaSeconds = (currentTime - previousTime) / 1000;
    previousTime = currentTime;
    navigation.update(deltaSeconds);
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
} catch (error) {
  console.error('Error al iniciar el recorrido:', error);
  status.textContent = 'Error al cargar la escena';
}
