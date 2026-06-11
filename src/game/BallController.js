import * as THREE from "three";
import { CONFIG } from "../config.js";
import { clamp, damp } from "./math.js";
import { getSkin } from "./skins.js";

export class BallController {
  constructor(scene) {
    this.radius = CONFIG.ballRadius;
    this.group = new THREE.Group();
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8fbff,
      roughness: 0.42,
      metalness: 0.05,
      emissive: 0x78e7ff,
      emissiveIntensity: 0.05
    });
    this.mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(this.radius, 4),
      this.coreMaterial
    );
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0xff3f7f,
      roughness: 0.3,
      emissive: 0xff2d75,
      emissiveIntensity: 0.12
    });
    const stripeA = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.035, 8, 48), this.stripeMaterial);
    const stripeB = stripeA.clone();
    stripeA.rotation.x = Math.PI / 2;
    stripeB.rotation.y = Math.PI / 2;
    this.magnetRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x79ff98,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.magnetRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.026, 8, 72), this.magnetRingMaterial);
    this.magnetRing.rotation.x = Math.PI / 2;
    this.magnetRing.visible = false;
    this.group.add(this.mesh, stripeA, stripeB, this.magnetRing);
    scene.add(this.group);

    this.position = new THREE.Vector3();
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = CONFIG.baseSpeed;
    this.distance = 0;
    this.grounded = true;
    this.boostTimer = 0;
    this.magnetTimer = 0;
    this.shields = 0;
    this.squash = 0;
    this.airborneTime = 0;
    this.baseEmissiveIntensity = 0.05;
    this.surfaceParticleTimer = 0;
    this.lastSurface = "snow";
    this.lastLanding = null;
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
    this.magnetTimer = 0;
    this.shields = 0;
    this.squash = 0;
    this.airborneTime = 0;
    this.group.rotation.set(0, 0, 0);
    this.mesh.material.emissiveIntensity = 0.05;
    this.surfaceParticleTimer = 0;
    this.lastSurface = trackInfo?.surface || "snow";
    this.lastLanding = null;
    this.updateMesh(false);
  }

  applySkin(id) {
    const skin = getSkin(id);
    this.skinId = skin.id;
    this.baseEmissiveIntensity = skin.emissiveIntensity;
    this.coreMaterial.color.setHex(skin.color);
    this.coreMaterial.emissive.setHex(skin.emissive);
    this.coreMaterial.emissiveIntensity = skin.emissiveIntensity;
    this.coreMaterial.roughness = skin.roughness;
    this.coreMaterial.metalness = skin.metalness;
    this.coreMaterial.opacity = skin.opacity;
    this.coreMaterial.transparent = skin.opacity < 1;
    this.coreMaterial.depthWrite = skin.opacity >= 1;
    this.stripeMaterial.color.setHex(skin.accent);
    this.stripeMaterial.emissive.setHex(skin.accent);
  }

  update(dt, input, difficulty, getTrackInfo, scoreState, effects) {
    this.lastLanding = null;
    const currentTrack = getTrackInfo(this.position.z);
    const surface = this.getSurfaceProfile(currentTrack.surface);
    const rushIntensity = currentTrack.rush ? currentTrack.rushIntensity : 0;
    const steerPower = (scoreState.flowActive ? CONFIG.steeringForce * 1.18 : CONFIG.steeringForce) * surface.steerMultiplier;
    this.velocityX += input.steer * steerPower * dt;
    this.velocityX *= Math.pow(surface.lateralFriction, dt * 60);

    this.boostTimer = Math.max(0, this.boostTimer - dt);
    this.magnetTimer = Math.max(0, this.magnetTimer - dt);
    let desiredSpeed = CONFIG.baseSpeed + difficulty.speedBonus + scoreState.runTime * CONFIG.speedIncreasePerSecond;
    desiredSpeed *= surface.speedMultiplier;
    if (input.boost) desiredSpeed *= 1.16;
    if (input.brake) desiredSpeed *= 0.72;
    if (this.boostTimer > 0) desiredSpeed *= 1.28;
    if (scoreState.flowActive) desiredSpeed *= 1.07;
    if (rushIntensity > 0) desiredSpeed *= 1 + rushIntensity * 0.16;
    desiredSpeed = clamp(desiredSpeed, CONFIG.baseSpeed * 0.55, CONFIG.maxSpeed + rushIntensity * 16);
    this.speed = damp(this.speed, desiredSpeed, 1.9, dt);

    if (input.consumeJump() && this.grounded) {
      this.forceJump(CONFIG.jumpForce);
      effects.spawnBurst(this.position, 18, 0xffffff, 4, 0.42);
    }

    this.updateSurfaceEffects(dt, currentTrack.surface, effects);

    this.position.z -= this.speed * dt;
    this.position.x += this.velocityX * dt;
    this.velocityY -= CONFIG.gravity * dt;
    this.position.y += this.velocityY * dt;

    const nextTrack = getTrackInfo(this.position.z);
    const groundY = nextTrack.groundY + this.radius;
    if (this.position.y <= groundY) {
      if (!this.grounded && this.velocityY < -5) {
        const impact = Math.abs(this.velocityY);
        this.lastLanding = {
          airtime: this.airborneTime,
          impact,
          lateralSpeed: Math.abs(this.velocityX),
          perfect: this.airborneTime >= 0.38 && Math.abs(this.velocityX) < 7.2 && impact < 28
        };
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

  getSurfaceProfile(surface) {
    if (surface === "ice") return { lateralFriction: 0.972, speedMultiplier: 1.08, steerMultiplier: 0.82 };
    if (surface === "powder") return { lateralFriction: 0.78, speedMultiplier: 0.76, steerMultiplier: 0.92 };
    if (surface === "boost") return { lateralFriction: 0.9, speedMultiplier: 1.22, steerMultiplier: 1.03 };
    if (surface === "stone") return { lateralFriction: 0.88, speedMultiplier: 0.93, steerMultiplier: 0.84 };
    return { lateralFriction: CONFIG.lateralFriction, speedMultiplier: 1, steerMultiplier: 1 };
  }

  updateSurfaceEffects(dt, surface, effects) {
    if (!this.grounded || surface === "snow") {
      this.lastSurface = surface;
      return;
    }

    this.surfaceParticleTimer -= dt;
    if (surface !== this.lastSurface) {
      this.surfaceParticleTimer = 0;
      this.lastSurface = surface;
    }
    if (this.surfaceParticleTimer > 0) return;

    const color = surface === "boost" ? 0xffd166 : surface === "ice" ? 0x71f2ff : surface === "powder" ? 0xffffff : 0x9ca3a6;
    const count = surface === "boost" ? 16 : 8;
    const speed = surface === "boost" ? 5.5 : 2.8;
    effects.spawnBurst(this.position, count, color, speed, 0.28);
    this.surfaceParticleTimer = surface === "boost" ? 0.055 : 0.12;
  }

  forceJump(force) {
    this.velocityY = Math.max(this.velocityY, force);
    this.grounded = false;
  }

  activateBoost(duration = 3) {
    this.boostTimer = Math.max(this.boostTimer, duration);
  }

  activateMagnet(duration = CONFIG.magnetDuration) {
    this.magnetTimer = Math.max(this.magnetTimer, duration);
    this.magnetRing.visible = true;
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
    this.mesh.material.emissiveIntensity = flowActive
      ? Math.max(0.45, this.baseEmissiveIntensity * 1.35)
      : this.boostTimer > 0
        ? Math.max(0.22, this.baseEmissiveIntensity)
        : this.baseEmissiveIntensity;
    this.magnetRing.visible = this.magnetTimer > 0;
    if (this.magnetTimer > 0) {
      const pulse = 0.45 + Math.sin(performance.now() * 0.012) * 0.18;
      this.magnetRing.scale.setScalar(1 + Math.sin(performance.now() * 0.008) * 0.08);
      this.magnetRing.rotation.z += 0.025;
      this.magnetRingMaterial.opacity = pulse;
    } else {
      this.magnetRingMaterial.opacity = 0;
    }
  }
}
