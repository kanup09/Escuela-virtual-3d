import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

// Activa el raycast acelerado (BVH): hace rápidos los choques y los clics
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

// Deja todas las mallas con su transformación "horneada" en la geometría
// (así mundo = local) y les arma el BVH. Devuelve la lista de mallas.
export function prepareColliders(root) {
  root.updateMatrixWorld(true);
  const meshes = [];
  root.traverse((o) => { if (o.isMesh) meshes.push(o); });

  const seen = new Set();
  for (const mesh of meshes) {
    if (seen.has(mesh.geometry)) mesh.geometry = mesh.geometry.clone();
    seen.add(mesh.geometry);
    mesh.geometry.applyMatrix4(mesh.matrixWorld);
    mesh.geometry.computeBoundsTree();
  }
  for (const mesh of meshes) {
    mesh.removeFromParent();
    mesh.position.set(0, 0, 0);
    mesh.quaternion.identity();
    mesh.scale.set(1, 1, 1);
    mesh.updateMatrixWorld(true);
    root.add(mesh);
  }
  return meshes;
}
