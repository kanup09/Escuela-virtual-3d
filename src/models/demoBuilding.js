import * as THREE from 'three';

// Maqueta de prueba: no representa los planos de la escuela.
export function createDemoBuilding() {
  const group = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: '#d1d7d9' });
  const glass = new THREE.MeshStandardMaterial({ color: '#538ba0' });
  const roof = new THREE.MeshStandardMaterial({ color: '#9e6658' });
  const groundMaterial = new THREE.MeshStandardMaterial({ color: '#d2d7d0' });

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(115, 95), groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  group.add(ground);

  function addBox(width, height, depth, x, y, z, material) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    group.add(mesh);
  }

  addBox(35, 11, 16, -22, 5.5, -13, concrete);
  addBox(27, 9, 15, 23, 4.5, -14, concrete);
  addBox(15, 7, 19, 24, 3.5, 17, concrete);
  addBox(36, 0.65, 17, -22, 11.3, -13, roof);
  addBox(28, 0.65, 16, 23, 9.3, -14, roof);

  for (const z of [-4.7, -21.3]) {
    for (let i = 0; i < 7; i++) {
      for (let level = 0; level < 2; level++) {
        addBox(3.2, 2.7, 0.16, -36 + i * 4.5, 3 + level * 5, z, glass);
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    for (let level = 0; level < 2; level++) {
      addBox(3.4, 2.5, 0.16, 13 + i * 4.7, 2.8 + level * 4, -6.4, glass);
    }
  }

  return group;
}
