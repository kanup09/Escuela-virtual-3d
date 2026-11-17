import * as THREE from 'three';

// Movimiento de una persona dentro del modelo: gravedad, pisos, rampas y
// choques contra paredes/barandas usando una cápsula (como un cuerpo humano).
// Los "colliders" deben tener su transformación aplicada (ver prepareColliders).

const _box = new THREE.Box3();
const _triPoint = new THREE.Vector3();
const _capsulePoint = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _delta = new THREE.Vector3();
const _newPos = new THREE.Vector3();

export class WalkPhysics {
  constructor(colliders, { radius = 0.3, height = 1.75, gravity = 20 } = {}) {
    this.colliders = colliders;
    this.radius = radius;
    this.height = height;
    this.gravity = gravity;
    this.position = new THREE.Vector3(); // posición de los pies
    this.velocity = new THREE.Vector3();
    this.onGround = false;
    this.segment = new THREE.Line3();
  }

  teleport(x, y, z) {
    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.onGround = false;
  }

  // move: velocidad horizontal deseada en m/s (x, z)
  step(deltaSeconds, move) {
    const SUBSTEPS = 4; // evita atravesar paredes finas
    const dt = Math.min(deltaSeconds, 0.05) / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) this.substep(dt, move);
  }

  substep(dt, move) {
    const v = this.velocity;
    v.y = this.onGround ? -this.gravity * dt : v.y - this.gravity * dt;

    this.position.x += move.x * dt;
    this.position.z += move.z * dt;
    this.position.y += v.y * dt;

    const r = this.radius;
    const seg = this.segment;
    seg.start.copy(this.position); seg.start.y += r;
    seg.end.copy(this.position);   seg.end.y += this.height - r;

    _box.makeEmpty();
    _box.expandByPoint(seg.start);
    _box.expandByPoint(seg.end);
    _box.min.addScalar(-r);
    _box.max.addScalar(r);

    for (const mesh of this.colliders) {
      const bvh = mesh.geometry.boundsTree;
      if (!bvh) continue;
      bvh.shapecast({
        intersectsBounds: (box) => box.intersectsBox(_box),
        intersectsTriangle: (tri) => {
          const distance = tri.closestPointToSegment(seg, _triPoint, _capsulePoint);
          if (distance < r) {
            const depth = r - distance;
            _dir.copy(_capsulePoint).sub(_triPoint).normalize();
            seg.start.addScaledVector(_dir, depth);
            seg.end.addScaledVector(_dir, depth);
          }
        },
      });
    }

    _newPos.copy(seg.start); _newPos.y -= r;
    _delta.copy(_newPos).sub(this.position);
    const offset = Math.max(0, _delta.length() - 1e-5);
    _delta.normalize().multiplyScalar(offset);
    this.position.add(_delta);

    this.onGround = _delta.y > Math.abs(dt * v.y * 0.25);
    if (this.onGround) {
      v.y = 0;
    } else {
      _delta.normalize();
      v.addScaledVector(_delta, -_delta.dot(v));
    }
  }
}
