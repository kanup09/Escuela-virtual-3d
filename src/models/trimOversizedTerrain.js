import * as THREE from 'three';

/**
 * Oculta los triángulos del terreno que se extienden mucho más allá del edificio.
 * Conserva un margen alrededor de los volúmenes arquitectónicos.
 *
 * Importante: se aplica únicamente al OBJ actual, que tiene un terreno enorme.
 * No modifica el archivo original ni se aplica automáticamente a futuros GLB.
 */
export function trimOversizedTerrain(object, architectureBounds, margin = 14) {
  const minX = architectureBounds.min.x - margin;
  const maxX = architectureBounds.max.x + margin;
  const minZ = architectureBounds.min.z - margin;
  const maxZ = architectureBounds.max.z + margin;

  object.traverse((mesh) => {
    if (!mesh.isMesh) return;

    // OBJLoader produce geometría no indexada; cada 3 vértices forman una cara.
    const original = mesh.geometry;
    const geometry = original.index ? original.toNonIndexed() : original;
    const position = geometry.getAttribute('position');
    if (!position) return;

    const attributes = {};
    for (const name of Object.keys(geometry.attributes)) {
      attributes[name] = [];
    }

    const groups = geometry.groups.length
      ? geometry.groups
      : [{ start: 0, count: position.count, materialIndex: 0 }];

    const newGroups = [];
    let retainedVertices = 0;

    for (const group of groups) {
      const first = retainedVertices;
      const end = Math.min(group.start + group.count, position.count);

      for (let i = group.start; i + 2 < end; i += 3) {
        let inside = true;

        for (let j = i; j < i + 3; j += 1) {
          const x = position.getX(j);
          const z = position.getZ(j);
          if (x < minX || x > maxX || z < minZ || z > maxZ) {
            inside = false;
            break;
          }
        }

        if (!inside) continue;

        for (const [name, target] of Object.entries(attributes)) {
          const attribute = geometry.getAttribute(name);
          for (let j = i; j < i + 3; j += 1) {
            for (let k = 0; k < attribute.itemSize; k += 1) {
              target.push(attribute.getComponent(j, k));
            }
          }
        }
        retainedVertices += 3;
      }

      if (retainedVertices > first) {
        newGroups.push({
          start: first,
          count: retainedVertices - first,
          materialIndex: group.materialIndex,
        });
      }
    }

    const trimmed = new THREE.BufferGeometry();
    for (const [name, values] of Object.entries(attributes)) {
      const size = geometry.getAttribute(name).itemSize;
      trimmed.setAttribute(name, new THREE.Float32BufferAttribute(values, size));
    }
    for (const group of newGroups) {
      trimmed.addGroup(group.start, group.count, group.materialIndex);
    }
    trimmed.computeBoundingBox();
    trimmed.computeBoundingSphere();
    mesh.geometry = trimmed;
    original.dispose();
    if (geometry !== original) geometry.dispose();
  });
}
