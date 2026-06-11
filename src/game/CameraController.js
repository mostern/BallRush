import * as THREE from "three";
import { CONFIG } from "../config.js";
import { clamp, damp, lerp } from "./math.js";

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, 9, 22);
    this.lookTarget = new THREE.Vector3();
    this.shake = 0;
    this.camera.position.copy(this.position);
  }

  reset(ball) {
    this.position.set(ball.position.x, ball.position.y + 8, ball.position.z + 22);
    this.lookTarget.copy(ball.position);
    this.camera.position.copy(this.position);
    this.camera.lookAt(ball.position.x, ball.position.y + 1.2, ball.position.z - 16);
    this.camera.fov = 66;
    this.camera.updateProjectionMatrix();
    this.shake = 0;
  }

  addShake(amount) {
    this.shake = Math.max(this.shake, amount);
  }

  update(dt, ball, trackInfo, flowActive) {
    const speedT = clamp((ball.speed - CONFIG.baseSpeed) / (CONFIG.maxSpeed - CONFIG.baseSpeed), 0, 1);
    const target = new THREE.Vector3(
      ball.position.x * 0.42 + trackInfo.centerX * 0.2,
      ball.position.y + lerp(7.4, 12.4, speedT),
      ball.position.z + lerp(18, 30, speedT)
    );
    this.position.lerp(target, 1 - Math.exp(-5.2 * dt));
    const shakeOffset = this.getShakeOffset(dt);
    this.camera.position.copy(this.position).add(shakeOffset);

    const lookAhead = new THREE.Vector3(
      ball.position.x * 0.62 + trackInfo.centerX * 0.38,
      ball.position.y + 0.85,
      ball.position.z - lerp(18, 32, speedT)
    );
    this.lookTarget.lerp(lookAhead, 1 - Math.exp(-6.5 * dt));
    this.camera.lookAt(this.lookTarget);

    const targetFov = lerp(64, flowActive ? 84 : 79, speedT);
    this.camera.fov = damp(this.camera.fov, targetFov, 3, dt);
    this.camera.updateProjectionMatrix();
  }

  getShakeOffset(dt) {
    if (this.shake <= 0.001) return new THREE.Vector3();
    this.shake *= Math.pow(0.025, dt);
    return new THREE.Vector3(
      (Math.random() - 0.5) * this.shake,
      (Math.random() - 0.5) * this.shake,
      (Math.random() - 0.5) * this.shake
    );
  }
}
