import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { createDemoBuilding } from './demoBuilding.js';
import { calculateArchitectureBounds } from './calculateArchitectureBounds.js';
import { trimOversizedTerrain } from './trimOversizedTerrain.js';

// Los archivos se buscan en este orden. OBJ funciona sin MTL,
// aunque en ese caso no conserva los materiales originales.
const MODEL_FILES = [
  { url: '/models/escuela.glb', format: 'GLB' },
  { url: '/models/escuela.obj', format: 'OBJ' },
  { url: '/models/escuela.dae', format: 'DAE' },
];

async function modelExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type') || '';
    return response.ok && !contentType.includes('text/html');
  } catch {
    return false;
  }
}

async function loadModel(file) {
  switch (file.format) {
    case 'GLB':
      return (await new GLTFLoader().loadAsync(file.url)).scene;
    case 'OBJ':
      return await new OBJLoader().loadAsync(file.url);
    case 'DAE':
      return (await new ColladaLoader().loadAsync(file.url)).scene;
    default:
      throw new Error(`Formato no soportado: ${file.format}`);
  }
}

function applyTemporaryObjMaterial(object) {
  const whiteMaterial = new THREE.MeshStandardMaterial({
    color: 0xaeb8bd,
    roughness: 0.9,
    metalness: 0,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  object.traverse((child) => {
    if (!child.isMesh) return;

    child.material = whiteMaterial;
    child.castShadow = false;
    child.receiveShadow = true;
  });
}

export async function loadBuilding(scene) {
  let object = null;
  let source = 'DEMO';

  for (const file of MODEL_FILES) {
    if (!(await modelExists(file.url))) continue;
    object = await loadModel(file);
    source = file.format;
    break;
  }

  if (!object) {
    object = createDemoBuilding();
  } else if (source === 'OBJ') {
    applyTemporaryObjMaterial(object);
  }

  // Recortamos únicamente el terreno lejano del OBJ.
  // Así la superficie enorme deja de tapar el encuadre arquitectónico.
  if (source === 'OBJ') {
    const originalBounds = new THREE.Box3().setFromObject(object);
    const buildingBounds = calculateArchitectureBounds(object, originalBounds);
    trimOversizedTerrain(object, buildingBounds, 14);
  }

  // Centramos en X/Z para facilitar los controles; mantenemos el suelo en Y=0.
  object.updateMatrixWorld(true);
  const originalBounds = new THREE.Box3().setFromObject(object);
  const originalCenter = originalBounds.getCenter(new THREE.Vector3());
  object.position.x -= originalCenter.x;
  object.position.z -= originalCenter.z;
  object.position.y -= originalBounds.min.y;

  scene.add(object);
  object.updateMatrixWorld(true);

  const terrainBounds = new THREE.Box3().setFromObject(object);

  // La parcela es muchísimo mayor que la escuela.
  // Para enfocar la cámara utilizamos la geometría elevada del edificio.
  const bounds = source === 'OBJ'
    ? calculateArchitectureBounds(object, terrainBounds)
    : terrainBounds;

  return {
    object,
    source,
    bounds,
    terrainBounds,
    center: bounds.getCenter(new THREE.Vector3()),
    size: bounds.getSize(new THREE.Vector3()),
  };
}
