import * as THREE from "three";
import { getLevel } from "../game/levels.js";
import { damp } from "../game/math.js";

const DEFAULT_WEATHER = {
  color: 0xffdd78,
  opacityBase: 0.08,
  opacityScale: 0.24,
  sizeBase: 0.1,
  sizeScale: 0.1,
  fallSpeed: [2.2, 5.8],
  drift: 7.4,
  forwardBase: 1.4,
  forwardScale: 5.2,
  intensities: {
    snowfield: 0.18,
    iceCanyon: 0.12,
    crystalCave: 0.08,
    auroraRidge: 0.22,
    stormPeak: 0.34
  }
};

export class Snowfall {
  constructor(scene, maxFlakes = 520) {
    this.maxFlakes = maxFlakes;
    this.intensity = 0;
    this.weather = DEFAULT_WEATHER;
    this.positions = new Float32Array(maxFlakes * 3);
    this.flakes = Array.from({ length: maxFlakes }, () => ({
      x: 0,
      y: 0,
      z: 0,
      fallSpeed: 7 + Math.random() * 13,
      drift: (Math.random() - 0.5) * 3.4
    }));
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.18,
      transparent: true,
      opacity: 0.42,
      depthWrite: false
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
    this.reset({ x: 0, y: 0, z: 0 });
  }

  applyLevel(level) {
    const nextLevel = getLevel(level?.id || level);
    this.weather = { ...DEFAULT_WEATHER, ...nextLevel.weather };
    this.material.color.setHex(this.weather.color);
    for (const flake of this.flakes) {
      this.randomizeMotion(flake);
    }
  }

  reset(origin) {
    this.intensity = 0;
    for (let i = 0; i < this.maxFlakes; i += 1) this.respawn(i, origin, true);
    this.geometry.attributes.position.needsUpdate = true;
  }

  update(dt, ball, biomeId) {
    const target = this.weather.intensities[biomeId] ?? this.weather.intensities.snowfield;
    this.intensity = damp(this.intensity, target, 1.6, dt);
    this.material.opacity = this.weather.opacityBase + this.intensity * this.weather.opacityScale;
    this.material.size = this.weather.sizeBase + this.intensity * this.weather.sizeScale;

    const activeCount = Math.floor(this.maxFlakes * this.intensity);
    const origin = ball.position;
    for (let i = 0; i < this.maxFlakes; i += 1) {
      const base = i * 3;
      if (i >= activeCount) {
        this.positions[base + 1] = -10000;
        continue;
      }

      const flake = this.flakes[i];
      flake.y -= flake.fallSpeed * (0.7 + this.intensity) * dt;
      flake.x += flake.drift * dt;
      flake.z += (this.weather.forwardBase + this.intensity * this.weather.forwardScale) * dt;
      if (
        flake.y < origin.y - 6 ||
        flake.z > origin.z + 36 ||
        Math.abs(flake.x - origin.x) > 68
      ) {
        this.respawn(i, origin, false);
      }

      this.positions[base] = flake.x;
      this.positions[base + 1] = flake.y;
      this.positions[base + 2] = flake.z;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  respawn(index, origin, scatter) {
    const flake = this.flakes[index];
    flake.x = origin.x + (Math.random() - 0.5) * 112;
    flake.y = origin.y + (scatter ? Math.random() * 54 - 4 : 28 + Math.random() * 30);
    flake.z = origin.z - 92 + Math.random() * 126;
    this.randomizeMotion(flake);
  }

  randomizeMotion(flake) {
    const [minSpeed, maxSpeed] = this.weather.fallSpeed;
    flake.fallSpeed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    flake.drift = (Math.random() - 0.5) * this.weather.drift;
  }
}
