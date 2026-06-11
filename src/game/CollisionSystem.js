import * as THREE from "three";
import { CONFIG } from "../config.js";

export class CollisionSystem {
  constructor() {
    this.offTrackTimer = 0;
    this.flowWasActive = false;
  }

  reset() {
    this.offTrackTimer = 0;
    this.flowWasActive = false;
  }

  update(dt, ball, chunkManager, score, effects, camera, audio, endRun) {
    const scoreState = score.getSnapshot();
    const track = chunkManager.getTrackInfo(ball.position.z);
    const edgeDistance = Math.abs(ball.position.x - track.centerX) - track.width / 2;
    if (edgeDistance > -ball.radius * 0.15 && ball.grounded) {
      this.offTrackTimer += dt;
      ball.velocityX += Math.sign(track.centerX - ball.position.x) * 12 * dt;
    } else {
      this.offTrackTimer = Math.max(0, this.offTrackTimer - dt * 2);
    }
    if (edgeDistance > ball.radius * 1.4 || this.offTrackTimer > CONFIG.offTrackGrace) {
      endRun("Fall");
      return;
    }

    if (scoreState.flowActive && !this.flowWasActive) {
      effects.spawnBurst(ball.position, 80, 0xff3f9e, 8, 0.9);
      camera.addShake(0.55);
      audio.flow();
    }
    this.flowWasActive = scoreState.flowActive;

    for (const chunk of chunkManager.getNearbyChunks(ball.position.z)) {
      this.handleRamps(dt, ball, chunk, effects, audio);
      this.handleGates(dt, ball, chunk, score, effects, audio);
      this.handleCollectibles(dt, ball, chunk, score, effects, audio);
      if (this.handleObstacles(ball, chunk, score, effects, camera, audio, endRun)) return;
    }
  }

  handleRamps(dt, ball, chunk, effects, audio) {
    for (const ramp of chunk.ramps) {
      const dz = Math.abs(ball.position.z - ramp.z);
      const dx = Math.abs(ball.position.x - ramp.x);
      if (ball.grounded && dz < Math.max(1.6, ball.speed * dt + 0.8) && dx < ramp.width / 2 && performance.now() - ramp.usedAt > 700) {
        ramp.usedAt = performance.now();
        ball.forceJump(CONFIG.rampJumpForce);
        effects.spawnBurst(ball.position, 34, 0xfff0b0, 7.5, 0.7);
        audio.jump();
      }
    }
  }

  handleCollectibles(dt, ball, chunk, score, effects, audio) {
    for (const collectible of chunk.collectibles) {
      if (collectible.collected) continue;
      this.applyMagnet(dt, ball, collectible);
      const distance = Math.hypot(ball.position.x - collectible.x, ball.position.y - collectible.mesh.position.y, ball.position.z - collectible.z);
      if (distance < ball.radius + 0.9) {
        collectible.collected = true;
        collectible.mesh.visible = false;
        score.collect(collectible.type);
        if (collectible.type === "shield") {
          ball.addShield();
          audio.shield();
        } else if (collectible.type === "boost") {
          ball.activateBoost();
          audio.jump();
        } else {
          if (collectible.type === "gold") ball.activateMagnet();
          audio.collect(collectible.type === "gold");
        }
        const colors = {
          crystal: 0x55ecff,
          gold: 0xffcf4a,
          flow: 0xff3f9e,
          shield: 0x79ff98,
          boost: 0xff6b35
        };
        effects.spawnBurst(collectible.mesh.position, collectible.type === "gold" ? 36 : 22, colors[collectible.type] || 0x55ecff, 4.8, 0.55);
      }
    }
  }

  applyMagnet(dt, ball, collectible) {
    if (ball.magnetTimer <= 0) return;
    const dx = ball.position.x - collectible.x;
    const dy = ball.position.y - collectible.mesh.position.y;
    const dz = ball.position.z - collectible.z;
    const distance = Math.hypot(dx, dy, dz);
    if (distance > CONFIG.magnetRadius || distance < 0.001) return;

    const pull = (1 - distance / CONFIG.magnetRadius) * CONFIG.magnetPullStrength * dt;
    collectible.x += (dx / distance) * pull;
    collectible.z += (dz / distance) * pull;
    collectible.mesh.position.x = collectible.x;
    collectible.mesh.position.z = collectible.z;
    collectible.mesh.position.y += (dy / distance) * pull * 0.35;
  }

  handleGates(dt, ball, chunk, score, effects, audio) {
    for (const gate of chunk.gates) {
      if (gate.passed || gate.missed) continue;
      const crossingWindow = Math.max(1.2, ball.speed * dt + 0.8);
      if (ball.position.z > gate.z + crossingWindow) continue;
      if (ball.position.z < gate.z - crossingWindow) {
        gate.missed = true;
        gate.mesh.visible = false;
        score.missCheckpoint();
        continue;
      }

      const dx = Math.abs(ball.position.x - gate.x);
      if (dx <= gate.width / 2) {
        gate.passed = true;
        gate.mesh.visible = false;
        score.checkpoint();
        effects.spawnBurst(new THREE.Vector3(gate.x, gate.mesh.position.y + 2.4, gate.z), 42, 0x55ecff, 5.8, 0.58);
        audio.collect(true);
      }
    }
  }

  handleObstacles(ball, chunk, score, effects, camera, audio, endRun) {
    for (const obstacle of chunk.obstacles) {
      if (obstacle.cleared) continue;
      const dx = ball.position.x - obstacle.x;
      const dz = ball.position.z - obstacle.z;
      const planarDistance = Math.hypot(dx, dz);
      const collisionDistance = ball.radius + obstacle.radius * 0.72;
      const verticalClose = Math.abs(ball.position.y - obstacle.mesh.position.y) < ball.radius + obstacle.radius * 1.3;
      if (planarDistance < collisionDistance && verticalClose) {
        if (score.flowActive && obstacle.breakable) {
          this.clearObstacle(obstacle, score, effects, camera, audio);
          return false;
        }
        if (ball.consumeShield()) {
          this.clearObstacle(obstacle, score, effects, camera, audio, true);
          return false;
        }
        effects.spawnBurst(ball.position, 90, 0xff4c6d, 9, 0.85);
        camera.addShake(1.35);
        audio.crash();
        endRun("Crash");
        return true;
      }

      if (!obstacle.passed && ball.position.z < obstacle.z - obstacle.radius && planarDistance < obstacle.radius + CONFIG.nearMissRadius) {
        obstacle.passed = true;
        score.nearMiss();
        effects.spawnBurst(new THREE.Vector3(obstacle.x, obstacle.mesh.position.y + 0.8, obstacle.z), 16, 0xffffff, 3.8, 0.38);
      }
    }
    return false;
  }

  clearObstacle(obstacle, score, effects, camera, audio, shielded = false) {
    obstacle.cleared = true;
    obstacle.mesh.visible = false;
    score.breakObstacle();
    const position = obstacle.mesh.position.clone();
    effects.spawnBurst(position, shielded ? 48 : 62, shielded ? 0x79ff98 : 0xff3f9e, 7, 0.72);
    camera.addShake(shielded ? 0.42 : 0.62);
    audio.shield();
  }
}
