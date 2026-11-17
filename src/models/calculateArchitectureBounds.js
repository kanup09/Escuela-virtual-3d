import * as THREE from 'three';

/**
 * Calcula el volumen de la arquitectura sin tener en cuenta toda la parcela.
 *
 * El OBJ recibido contiene un terreno aproximado de 307 x 407 metros.
 * El edificio se encuentra concentrado en una zona mucho menor.
 * Usamos puntos situados por encima de la cota del terreno para encuadrarlo.
 */
export function calculateArchitectureBounds(object, completeBounds) {
  const architectureBounds = new THREE.Box3();
  const vertex = new THREE.Vector3();
  const minimumElevation = completeBounds.min.y + 1.5;

  object.updateMatrixWorld(true);

  object.traverse((child) => {
    if (!child.isMesh) return;

    const positions = child.geometry.getAttribute('position');
    if (!positions) return;

    for (let index = 0; index < positions.count; index += 1) {
      vertex.fromBufferAttribute(positions, index);
      vertex.applyMatrix4(child.matrixWorld);

      if (vertex.y > minimumElevation) {
        architectureBounds.expandByPoint(vertex);
      }
    }
  });

  // Si algún futuro modelo no contiene geometría elevada,
  // volvemos al encuadre general para evitar una caja vacía.
  if (architectureBounds.isEmpty()) {
    return completeBounds.clone();
  }

  return architectureBounds;
}
