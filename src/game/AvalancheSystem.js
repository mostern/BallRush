import * as THREE from "three";
import { CONFIG } from "../config.js";
import { getLevel } from "./levels.js";
import { clamp } from "./math.js";

export class AvalancheSystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.wallMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3fbff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.wall = new THREE.Mesh(new THREE.PlaneGeometry(74, 22, 8, 2), this.wallMaterial);
    this.wall.position.y = 8;
    this.group.add(this.wall);

    this.chunks = [];
    this.chunkMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8f7ff,
      roughness: 0.84,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
      flatShading: true
    });
    for (let i = 0; i < 18; i += 1) {
      const chunk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.5 + Math.random() * 1.4, 0), this.chunkMaterial);
      chunk.position.set((Math.random() - 0.5) * 42, Math.random() * 8, (Math.random() - 0.5) * 9);
      chunk.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.group.add(chunk);
      this.chunks.push(chunk);
    }
    this.effectColor = 0xf3fbff;
    this.applyLevel(getLevel());
    this.group.visible = false;
    scene.add(this.group);
    this.reset();
  }

  applyLevel(level) {
    const chase = getLevel(level?.id || level).chase;
    this.wallMaterial.color.setHex(chase.wall);
    this.chunkMaterial.color.setHex(chase.chunk);
    this.effectColor = chase.effect;
  }

  reset() {
    this.active = false;
    this.gap = CONFIG.avalancheMaxGap;
    this.danger = 0;
    this.warningTimer = 0;
    this.group.visible = false;
    this.wallMaterial.opacity = 0;
  }

  update(dt, ball, difficulty, runTime, getTrackInfo, effects, camera) {
    const shouldActivate = runTime >= CONFIG.avalancheStartTime || ball.distance >= CONFIG.avalancheStartDistance;
    if (!this.active && shouldActivate) {
      this.active = true;
      this.gap = CONFIG.avalancheStartGap;
      this.group.visible = true;
    }

    if (!this.active) return false;

    const avalancheSpeed = CONFIG.avalancheBaseSpeed + difficulty.value * CONFIG.avalancheDifficultySpeed + runTime * 0.06;
    this.gap += (ball.speed - avalancheSpeed) * dt;
    this.gap = clamp(this.gap, 0, CONFIG.avalancheMaxGap);
    this.danger = 1 - clamp((this.gap - CONFIG.avalancheCatchGap) / (CONFIG.avalancheMaxGap - CONFIG.avalancheCatchGap), 0, 1);

    const wallZ = ball.position.z + this.gap;
    const wallTrack = getTrackInfo(wallZ);
    this.group.position.set(wallTrack.centerX, wallTrack.groundY + 1.8, wallZ);
    this.group.rotation.set(-0.08, 0, Math.sin(runTime * 0.7) * 0.05);
    this.group.scale.setScalar(0.84 + this.danger * 0.34);
    this.wallMaterial.opacity = 0.05 + this.danger * 0.48;

    for (const [index, chunk] of this.chunks.entries()) {
      chunk.rotation.x += dt * (0.7 + index * 0.015);
      chunk.rotation.y += dt * (0.4 + index * 0.02);
      chunk.position.z += dt * (1.4 + this.danger * 8);
      if (chunk.position.z > 8) chunk.position.z = -8;
    }

    this.warningTimer -= dt;
    if (this.danger > 0.64 && this.warningTimer <= 0) {
      camera.addShake(0.08 + this.danger * 0.16);
      effects.spawnBurst(ball.position, 14, this.effectColor, 4 + this.danger * 3, 0.35);
      this.warningTimer = 0.2;
    }

    return this.gap <= CONFIG.avalancheCatchGap;
  }

  getStatus() {
    return {
      active: this.active,
      gap: this.gap,
      danger: this.danger
    };
  }

  getEffectColor() {
    return this.effectColor;
  }
}
