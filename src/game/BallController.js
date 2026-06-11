import * as THREE from "three";
import { CONFIG } from "../config.js";
import { clamp, damp } from "./math.js";

export class BallController {
  constructor(scene) {
    this.radius = CONFIG.ballRadius;
    this.group = new THREE.Group();
    this.mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(this.radius, 4),
      new THREE.MeshStandardMaterial({
        color: 0xf8fbff,
        roughness: 0.42,
        metalness: 0.05,
        emissive: 0x78e7ff,
        emissiveIntensity: 0.05
      })
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3f7f,
      roughness: 0.3,
      emissive: 0xff2d75,
      emissiveIntensity: 0.12
    });
    const stripeA = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.035, 8, 48), stripeMaterial);
    const stripeB = stripeA.clone();
    stripeA.rotation.x = Math.PI / 2;
    stripeB.rotation.y = Math.PI / 2;
    this.group.add(this.mesh, stripeA, stripeB);
    scene.add(this.group);

    this.position = new THREE.Vector3();
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = CONFIG.baseSpeed;
    this.distance = 0;
    this.grounded = true;
    this.boostTimer = 0;
    this.shields = 0;
    this.squash = 0;
    this.airborneTime = 0;
  }

  reset(trackInfo) {
    const groundY = trackInfo?.groundY ?? 0;
    this.position.set(trackInfo?.centerX ?? 0, groundY + this.radius, 5);
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = CONFIG.baseSpeed;
    this.distance = 0;
    this.grounded = true;
    this.boostTimer = 0;
    this.shields = 0;
    this.squash = 0;
    this.airborneTime = 0;
    this.group.rotation.set(0, 0, 0);
    this.mesh.material.emissiveIntensity = 0.05;
    this.updateMesh(false);
  }

  update(dt, input, difficulty, getTrackInfo, scoreState, effects) {
    const currentTrack = getTrackInfo(this.position.z);
    const surfaceFriction = this.getSurfaceFriction(currentTrack.surface);
    const steerPower = scoreState.flowActive ? CONFIG.steeringForce * 1.18 : CONFIG.steeringForce;
    this.velocityX += input.steer * steerPower * dt;
    this.velocityX *= Math.pow(surfaceFriction, dt * 60);

    this.boostTimer = Math.max(0, this.boostTimer - dt);
    let desiredSpeed = CONFIG.baseSpeed + difficulty.speedBonus + scoreState.runTime * CONFIG.speedIncreasePerSecond;
    if (input.boost) desiredSpeed *= 1.16;
    if (input.brake) desiredSpeed *= 0.72;
    if (this.boostTimer > 0) desiredSpeed *= 1.28;
    if (scoreState.flowActive) desiredSpeed *= 1.07;
    desiredSpeed = clamp(desiredSpeed, CONFIG.baseSpeed * 0.55, CONFIG.maxSpeed);
    this.speed = damp(this.speed, desiredSpeed, 1.9, dt);

    if (input.consumeJump() && this.grounded) {
      this.forceJump(CONFIG.jumpForce);
      effects.spawnBurst(this.position, 18, 0xffffff, 4, 0.42);
    }

    this.position.z -= this.speed * dt;
    this.position.x += this.velocityX * dt;
    this.velocityY -= CONFIG.gravity * dt;
    this.position.y += this.velocityY * dt;

    const nextTrack = getTrackInfo(this.position.z);
    const groundY = nextTrack.groundY + this.radius;
    if (this.position.y <= groundY) {
      if (!this.grounded && this.velocityY < -5) {
        this.squash = clamp(Math.abs(this.velocityY) / 26, 0.15, 0.45);
        effects.spawnBurst(this.position, 26, 0xdff8ff, 5.8, 0.55);
      }
      this.position.y = groundY;
      this.velocityY = 0;
      this.grounded = true;
      this.airborneTime = 0;
    } else {
      this.grounded = false;
      this.airborneTime += dt;
    }

    this.distance = Math.max(this.distance, -this.position.z);
    this.squash = damp(this.squash, 0, 9, dt);
    this.updateMesh(scoreState.flowActive);
  }

  getSurfaceFriction(surface) {
    if (surface === "ice") return 0.965;
    if (surface === "powder") return 0.84;
    if (surface === "stone") return 0.89;
    return CONFIG.lateralFriction;
  }

  forceJump(force) {
    this.velocityY = Math.max(this.velocityY, force);
    this.grounded = false;
  }

  activateBoost(duration = 3) {
    this.boostTimer = Math.max(this.boostTimer, duration);
  }

  addShield() {
    this.shields += 1;
  }

  consumeShield() {
    if (this.shields <= 0) return false;
    this.shields -= 1;
    return true;
  }

  updateMesh(flowActive) {
    this.group.position.copy(this.position);
    const roll = this.speed / this.radius / 60;
    this.mesh.rotation.x -= roll;
    this.mesh.rotation.z -= this.velocityX / this.radius / 80;
    const stretch = this.grounded ? this.squash : clamp(this.velocityY / 60, -0.1, 0.18);
    this.group.scale.set(1 + stretch * 0.35, 1 - stretch * 0.45, 1 + stretch * 0.35);
    this.mesh.material.emissiveIntensity = flowActive ? 0.45 : this.boostTimer > 0 ? 0.22 : 0.05;
  }
}
