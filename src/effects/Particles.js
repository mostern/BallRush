import * as THREE from "three";

export class ParticleSystem {
  constructor(scene, maxParticles = 900) {
    this.maxParticles = maxParticles;
    this.cursor = 0;
    this.particles = Array.from({ length: maxParticles }, () => ({
      life: 0,
      maxLife: 1,
      velocity: new THREE.Vector3()
    }));
    this.positions = new Float32Array(maxParticles * 3);
    this.colors = new Float32Array(maxParticles * 3);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("color", new THREE.BufferAttribute(this.colors, 3));
    this.material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.86,
      depthWrite: false
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  spawnBurst(position, count, colorHex, speed = 5, life = 0.6) {
    const color = new THREE.Color(colorHex);
    for (let i = 0; i < count; i += 1) {
      const index = this.cursor;
      this.cursor = (this.cursor + 1) % this.maxParticles;
      const particle = this.particles[index];
      particle.life = life * (0.65 + Math.random() * 0.65);
      particle.maxLife = particle.life;
      particle.velocity.set(
        (Math.random() - 0.5) * speed,
        Math.random() * speed * 0.7,
        (Math.random() - 0.5) * speed
      );
      this.positions[index * 3] = position.x;
      this.positions[index * 3 + 1] = position.y;
      this.positions[index * 3 + 2] = position.z;
      this.colors[index * 3] = color.r;
      this.colors[index * 3 + 1] = color.g;
      this.colors[index * 3 + 2] = color.b;
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  update(dt) {
    for (let i = 0; i < this.maxParticles; i += 1) {
      const particle = this.particles[i];
      if (particle.life <= 0) continue;
      particle.life -= dt;
      particle.velocity.y -= 9.8 * dt;
      this.positions[i * 3] += particle.velocity.x * dt;
      this.positions[i * 3 + 1] += particle.velocity.y * dt;
      this.positions[i * 3 + 2] += particle.velocity.z * dt;
      const t = Math.max(0, particle.life / particle.maxLife);
      this.colors[i * 3] *= 0.96 + t * 0.04;
      this.colors[i * 3 + 1] *= 0.96 + t * 0.04;
      this.colors[i * 3 + 2] *= 0.96 + t * 0.04;
      if (particle.life <= 0) {
        this.positions[i * 3 + 1] = -10000;
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }
}
