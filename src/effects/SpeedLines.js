import * as THREE from "three";
import { CONFIG } from "../config.js";
import { damp } from "../game/math.js";

export class SpeedLines {
  constructor(scene, maxLines = 78) {
    this.maxLines = maxLines;
    this.intensity = 0;
    this.phase = 0;
    this.positions = new Float32Array(maxLines * 2 * 3);
    this.lines = Array.from({ length: maxLines }, () => ({
      lane: (Math.random() - 0.5) * 30,
      height: 1.5 + Math.random() * 8,
      depth: Math.random() * 62,
      length: 3.5 + Math.random() * 8,
      speed: 16 + Math.random() * 26
    }));
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.mesh = new THREE.LineSegments(this.geometry, this.material);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    scene.add(this.mesh);
  }

  reset() {
    this.intensity = 0;
    this.phase = 0;
    this.mesh.visible = false;
  }

  update(dt, ball, flowActive) {
    const speedT = Math.max(0, Math.min(1, (ball.speed - 30) / (CONFIG.maxSpeed - 30)));
    const target = flowActive ? Math.max(0.68, speedT) : speedT;
    this.intensity = damp(this.intensity, target, 5.4, dt);
    this.phase += dt * Math.max(1, ball.speed * 0.08);
    this.mesh.visible = this.intensity > 0.025;
    this.material.opacity = Math.min(0.72, this.intensity * 0.78);

    for (let i = 0; i < this.maxLines; i += 1) {
      const line = this.lines[i];
      const active = i / this.maxLines < this.intensity;
      const base = i * 6;
      if (!active) {
        this.positions[base + 1] = -10000;
        this.positions[base + 4] = -10000;
        continue;
      }

      const stream = (line.depth + this.phase * line.speed) % 72;
      const x = ball.position.x + line.lane;
      const y = ball.position.y + line.height;
      const z = ball.position.z - stream - 8;
      this.positions[base] = x;
      this.positions[base + 1] = y;
      this.positions[base + 2] = z;
      this.positions[base + 3] = x + line.lane * 0.012;
      this.positions[base + 4] = y - 0.08;
      this.positions[base + 5] = z + line.length + ball.speed * 0.08;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }
}
