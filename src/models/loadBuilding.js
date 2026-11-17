import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ColladaLoader } from 'three/addons/loaders/ColladaLoader.js';
import { createDemoBuilding } from './demoBuilding.js';
import { prepareColliders } from '../physics/prepareColliders.js';
import { SETTINGS } from '../config/settings.js';

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

  const BASE = import.meta.env.BASE_URL;

  if (await modelExists(`${BASE}models/escuela.glb`)) {
    object = (await new GLTFLoader().loadAsync(`${BASE}models/escuela.glb`)).scene;
    source = 'GLB';
  } else if (await modelExists(`${BASE}models/escuela.dae`)) {
    object = (await new ColladaLoader().loadAsync(`${BASE}models/escuela.dae`)).scene;
    source = 'DAE';
  }
  
  if (await modelExists(`${BASE}models/escuela.glb`)) {
    object = (await new GLTFLoader().loadAsync(`${BASE}models/escuela.glb`)).scene;
    source = 'GLB';
  } else if (await modelExists(`${BASE}models/escuela.dae`)) {
    object = (await new ColladaLoader().loadAsync(`${BASE}models/escuela.dae`)).scene;
    source = 'DAE';
  } else {
    object = createDemoBuilding();
    source = 'DEMO';
  }
  

  scene.add(object);
  const colliders = prepareColliders(object);
  const bounds = new THREE.Box3().setFromObject(object);

  // Zona de interés: la escuela (el modelo trae también calles y terreno)
  const school = SETTINGS.school;
  const focus = school
    ? { center: new THREE.Vector3(...school.center), radius: school.radius }
    : {
        center: bounds.getCenter(new THREE.Vector3()),
        radius: Math.max(...bounds.getSize(new THREE.Vector3()).toArray(), 10),
      };

  return { object, source, bounds, colliders, focus };
}
