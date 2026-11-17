import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { createDemoBuilding } from './demoBuilding.js';

async function modelExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok && (response.headers.get('content-type') || '').indexOf('text/html') === -1;
  } catch {
    return false;
  }
}

export async function loadBuilding(scene) {
  let object;
  let source;

  if (await modelExists('/models/escuela.glb')) {
    object = (await new GLTFLoader().loadAsync('/models/escuela.glb')).scene;
    source = 'GLB';
  } else if (await modelExists('/models/escuela.dae')) {
    object = (await new ColladaLoader().loadAsync('/models/escuela.dae')).scene;
    source = 'DAE';
  } else {
    object = createDemoBuilding();
    source = 'DEMO';
  }

  scene.add(object);
  const bounds = new THREE.Box3().setFromObject(object);

  return {
    object,
    source,
    bounds,
    center: bounds.getCenter(new THREE.Vector3()),
    size: bounds.getSize(new THREE.Vector3()),
  };
}
