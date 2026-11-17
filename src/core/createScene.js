import * as THREE from 'three';
import { SETTINGS } from '../config/settings.js';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SETTINGS.backgroundColor);

  const camera = new THREE.PerspectiveCamera(
    SETTINGS.fieldOfView,
    1,
    0.05,
    3000
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.6;
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.HemisphereLight(0xffffff, 0x91a7b5, 2.2);
  scene.add(ambientLight);

  const sun = new THREE.DirectionalLight(0xffffff, 2.5);
  sun.position.set(30, 80, 45);
  scene.add(sun);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener('resize', resize);
  resize();

  return { scene, camera, renderer };
}
