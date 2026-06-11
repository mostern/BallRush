import * as THREE from "three";

export class Trail {
  constructor(scene, maxPoints = 64) {
    this.maxPoints = maxPoints;
    this.points = [];
    this.accumulator = 0;
    this.positions = new Float32Array(maxPoints * 3);
    this.colors = new Float32Array(maxPoints * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setDrawRange(0, 0);
    this.material = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.72
    });
    this.line = new THREE.Line(this.geometry, this.material);
    this.line.frustumCulled = false;
    scene.add(this.line);
  }

  reset() {
    this.points.length = 0;
    this.geometry.setDrawRange(0, 0);
  }

  update(dt, ball, flowActive) {
    this.accumulator += dt;
    if (this.accumulator > 0.025) {
      this.accumulator = 0;
      this.points.unshift(ball.position.clone().add(new THREE.Vector3(0, -0.2, 0.8)));
      if (this.points.length > this.maxPoints) this.points.pop();
    }

    const hot = new THREE.Color(flowActive ? 0xff3f7f : 0x71f2ff);
    const cold = new THREE.Color(0xffffff);
    for (let i = 0; i < this.maxPoints; i += 1) {
      const point = this.points[i];
      const base = i * 3;
      if (point) {
        this.positions[base] = point.x;
        this.positions[base + 1] = point.y;
        this.positions[base + 2] = point.z;
        const t = 1 - i / this.maxPoints;
        const color = cold.clone().lerp(hot, t);
        this.colors[base] = color.r * t;
        this.colors[base + 1] = color.g * t;
        this.colors[base + 2] = color.b * t;
      } else {
        this.positions[base] = 0;
        this.positions[base + 1] = -10000;
        this.positions[base + 2] = 0;
      }
    }
    this.geometry.setDrawRange(0, this.points.length);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
