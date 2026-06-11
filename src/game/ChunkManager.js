import * as THREE from "three";
import { CONFIG } from "../config.js";
import { RNG } from "./RNG.js";
import { clamp, lerp, smoothstep } from "./math.js";

const CHUNK_TYPES = [
  "straight",
  "softCurve",
  "hardCurve",
  "narrowPath",
  "jumpRamp",
  "crystalLine",
  "obstacleField",
  "splitPath"
];

export class ChunkManager {
  constructor(scene) {
    this.scene = scene;
    this.chunks = [];
    this.rng = new RNG("daily");
    this.nextIndex = 0;
    this.nextCenterX = 0;
    this.materials = this.createMaterials();
  }

  reset(seed, difficultyProvider) {
    this.dispose();
    this.rng = new RNG(seed);
    this.nextIndex = 0;
    this.nextCenterX = 0;
    while (this.chunks.length < CONFIG.activeChunksAhead) {
      this.addChunk(difficultyProvider(this.nextIndex * CONFIG.chunkLength));
    }
  }

  dispose() {
    for (const chunk of this.chunks) {
      this.scene.remove(chunk.group);
      chunk.group.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
    }
    this.chunks.length = 0;
  }

  update(ballZ, difficultyProvider) {
    const targetAhead = ballZ - CONFIG.chunkLength * CONFIG.activeChunksAhead;
    while (!this.chunks.length || this.chunks[this.chunks.length - 1].endZ > targetAhead) {
      this.addChunk(difficultyProvider(this.nextIndex * CONFIG.chunkLength));
    }

    const behindLimit = ballZ + CONFIG.chunkLength * CONFIG.activeChunksBehind;
    while (this.chunks.length && this.chunks[0].endZ > behindLimit) {
      const old = this.chunks.shift();
      this.scene.remove(old.group);
      old.group.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
      });
    }
  }

  addChunk(difficulty) {
    const chunk = this.generateChunk(this.nextIndex, difficulty);
    this.buildChunkObjects(chunk);
    this.chunks.push(chunk);
    this.nextIndex += 1;
  }

  generateChunk(index, difficulty) {
    const length = CONFIG.chunkLength;
    const startZ = CONFIG.trackStartZ - index * length;
    const endZ = startZ - length;
    const type = this.pickChunkType(difficulty.value);
    const startX = this.nextCenterX;
    const curveSign = this.rng.chance(0.5) ? -1 : 1;
    const curveAmount = type === "straight" ? this.rng.range(-2.5, 2.5) : this.rng.range(3, difficulty.curveIntensity) * curveSign;
    const endX = clamp(startX + curveAmount, -CONFIG.maxCurveOffset, CONFIG.maxCurveOffset);
    this.nextCenterX = endX;

    const widthModifier = type === "narrowPath" ? 0.72 : type === "splitPath" ? 0.84 : type === "jumpRamp" ? 0.92 : 1;
    const width = clamp(difficulty.width * widthModifier, CONFIG.chunkWidthMin, CONFIG.chunkWidthStart);
    const surface = this.pickSurface(type, difficulty.biome.id);

    return {
      index,
      type,
      biome: difficulty.biome.id,
      length,
      startZ,
      endZ,
      startX,
      endX,
      width,
      surface,
      sway: this.rng.range(-2.2, 2.2) * difficulty.value,
      group: new THREE.Group(),
      obstacles: [],
      collectibles: [],
      ramps: []
    };
  }

  pickChunkType(value) {
    const roll = this.rng.next();
    if (value < 0.12) return roll < 0.42 ? "straight" : roll < 0.72 ? "crystalLine" : "softCurve";
    if (value < 0.34) {
      if (roll < 0.2) return "straight";
      if (roll < 0.46) return "softCurve";
      if (roll < 0.64) return "crystalLine";
      if (roll < 0.82) return "jumpRamp";
      return "obstacleField";
    }
    if (roll < 0.12) return "straight";
    if (roll < 0.28) return "softCurve";
    if (roll < 0.43) return "hardCurve";
    if (roll < 0.59) return "narrowPath";
    if (roll < 0.74) return "jumpRamp";
    if (roll < 0.88) return "obstacleField";
    return this.rng.choice(CHUNK_TYPES);
  }

  pickSurface(type, biome) {
    if (type === "jumpRamp") return "boost";
    if (biome === "iceCanyon" || biome === "crystalCave") return this.rng.chance(0.48) ? "ice" : "snow";
    if (biome === "stormPeak") return this.rng.chance(0.28) ? "powder" : "stone";
    return "snow";
  }

  buildChunkObjects(chunk) {
    chunk.group.name = `chunk-${chunk.index}-${chunk.type}`;
    chunk.group.add(this.createTerrainMesh(chunk));
    chunk.group.add(this.createShoulders(chunk));

    this.generateObstacles(chunk);
    this.generateCollectibles(chunk);
    if (chunk.type === "jumpRamp") this.generateRamp(chunk);

    this.scene.add(chunk.group);
  }

  createTerrainMesh(chunk) {
    const steps = 24;
    const vertices = [];
    const uvs = [];
    const indices = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const z = lerp(chunk.startZ, chunk.endZ, t);
      const center = this.centerAt(chunk, t);
      const width = this.widthAt(chunk, t);
      const y = this.groundY(z);
      const camber = Math.sin(t * Math.PI) * (chunk.type === "hardCurve" ? 0.38 : 0.16);
      vertices.push(center - width / 2, y - camber, z, center + width / 2, y + camber, z);
      uvs.push(0, t * 5, 1, t * 5);
      if (i < steps) {
        const row = i * 2;
        indices.push(row, row + 1, row + 2, row + 1, row + 3, row + 2);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, this.materials.terrain[chunk.biome] || this.materials.terrain.snowfield);
    mesh.receiveShadow = true;
    return mesh;
  }

  createShoulders(chunk) {
    const group = new THREE.Group();
    const steps = 12;
    const leftPoints = [];
    const rightPoints = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const z = lerp(chunk.startZ, chunk.endZ, t);
      const center = this.centerAt(chunk, t);
      const width = this.widthAt(chunk, t);
      const y = this.groundY(z) + 0.1;
      leftPoints.push(new THREE.Vector3(center - width / 2, y, z));
      rightPoints.push(new THREE.Vector3(center + width / 2, y, z));
    }
    const lineMaterial = this.materials.edgeLine;
    const leftLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(leftPoints), lineMaterial);
    const rightLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(rightPoints), lineMaterial);
    group.add(leftLine, rightLine);

    const wallGeometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const z = lerp(chunk.startZ, chunk.endZ, t);
      const center = this.centerAt(chunk, t);
      const width = this.widthAt(chunk, t);
      const y = this.groundY(z);
      vertices.push(center - width / 2, y - 0.1, z, center - width / 2 - 18, y - 9, z);
      vertices.push(center + width / 2, y - 0.1, z, center + width / 2 + 18, y - 9, z);
      if (i < steps) {
        const row = i * 4;
        indices.push(row, row + 1, row + 4, row + 1, row + 5, row + 4);
        indices.push(row + 2, row + 6, row + 3, row + 3, row + 6, row + 7);
      }
    }
    wallGeometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    wallGeometry.setIndex(indices);
    wallGeometry.computeVertexNormals();
    const walls = new THREE.Mesh(wallGeometry, this.materials.valley[chunk.biome] || this.materials.valley.snowfield);
    walls.receiveShadow = true;
    group.add(walls);
    return group;
  }

  generateObstacles(chunk) {
    const base = chunk.type === "obstacleField" ? 12 : chunk.type === "narrowPath" ? 7 : 5;
    const count = Math.floor(base + chunk.index * 0.11 + this.rng.range(0, 4));
    for (let i = 0; i < count; i += 1) {
      const t = this.rng.range(0.13, 0.96);
      const z = lerp(chunk.startZ, chunk.endZ, t);
      const center = this.centerAt(chunk, t);
      const width = this.widthAt(chunk, t);
      const lane = this.rng.choice([-0.42, -0.26, -0.08, 0.1, 0.28, 0.43]);
      const x = center + lane * width + this.rng.range(-0.8, 0.8);
      const radius = this.rng.range(0.8, chunk.type === "obstacleField" ? 1.75 : 1.35);
      const type = this.rng.choice(["rock", "tree", "ice", "spike"]);
      const obstacle = {
        type,
        x,
        z,
        radius,
        passed: false,
        cleared: false,
        breakable: type !== "tree" || radius < 1.15
      };
      obstacle.mesh = this.createObstacleMesh(obstacle, chunk);
      chunk.obstacles.push(obstacle);
      chunk.group.add(obstacle.mesh);
    }
  }

  createObstacleMesh(obstacle, chunk) {
    const y = this.groundY(obstacle.z);
    let mesh;
    if (obstacle.type === "tree") {
      const group = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 5), this.materials.trunk);
      const crown = new THREE.Mesh(new THREE.ConeGeometry(obstacle.radius * 0.92, obstacle.radius * 2.2, 6), this.materials.pine);
      trunk.position.y = 0.55;
      crown.position.y = 1.62;
      trunk.castShadow = true;
      crown.castShadow = true;
      group.add(trunk, crown);
      mesh = group;
    } else if (obstacle.type === "ice") {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(obstacle.radius * 1.45, obstacle.radius * 1.45, obstacle.radius * 1.45), this.materials.iceBlock);
      mesh.rotation.set(this.rng.range(-0.2, 0.2), this.rng.range(0, Math.PI), this.rng.range(-0.2, 0.2));
      mesh.castShadow = true;
    } else if (obstacle.type === "spike") {
      mesh = new THREE.Mesh(new THREE.ConeGeometry(obstacle.radius * 0.82, obstacle.radius * 2.4, 6), this.materials.spike);
      mesh.castShadow = true;
    } else {
      mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(obstacle.radius, 0), this.materials.rock);
      mesh.rotation.set(this.rng.range(0, 1), this.rng.range(0, 1), this.rng.range(0, 1));
      mesh.castShadow = true;
    }
    mesh.position.set(obstacle.x, y + obstacle.radius * 0.78, obstacle.z);
    mesh.userData.entity = obstacle;
    return mesh;
  }

  generateCollectibles(chunk) {
    const count = chunk.type === "crystalLine" ? 18 : chunk.type === "obstacleField" ? 8 : 12;
    const laneOffset = this.rng.range(-0.32, 0.32);
    for (let i = 0; i < count; i += 1) {
      const t = (i + 1) / (count + 1);
      const z = lerp(chunk.startZ, chunk.endZ, t);
      const center = this.centerAt(chunk, t);
      const width = this.widthAt(chunk, t);
      const wave = Math.sin(t * Math.PI * 2 + chunk.index) * 0.16;
      const x = center + (laneOffset + wave) * width;
      if (this.hasObstacleNear(chunk, x, z, 2.5)) continue;
      const roll = this.rng.next();
      const type = roll > 0.965 ? "shield" : roll > 0.925 ? "boost" : roll > 0.865 ? "gold" : roll > 0.79 ? "flow" : "crystal";
      const collectible = { type, x, z, collected: false, spin: this.rng.range(0, Math.PI * 2) };
      collectible.mesh = this.createCollectibleMesh(collectible);
      chunk.collectibles.push(collectible);
      chunk.group.add(collectible.mesh);
    }
  }

  createCollectibleMesh(collectible) {
    const colors = {
      crystal: [0x55ecff, 0x1ac7ff],
      gold: [0xffcf4a, 0xff7b2f],
      flow: [0xff3f9e, 0xff2ad4],
      shield: [0x79ff98, 0x28d865],
      boost: [0xff6b35, 0xffd166]
    };
    const [color, emissive] = colors[collectible.type] || colors.crystal;
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.62, 0),
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.24,
        metalness: 0.12,
        emissive,
        emissiveIntensity: collectible.type === "crystal" ? 0.7 : 1.05
      })
    );
    mesh.position.set(collectible.x, this.groundY(collectible.z) + 1.42, collectible.z);
    mesh.castShadow = true;
    mesh.userData.entity = collectible;
    return mesh;
  }

  generateRamp(chunk) {
    const t = 0.58;
    const z = lerp(chunk.startZ, chunk.endZ, t);
    const center = this.centerAt(chunk, t);
    const width = Math.min(this.widthAt(chunk, t) * 0.56, 13);
    const ramp = { x: center, z, width, usedAt: -Infinity };
    const halfW = width / 2;
    const halfL = 3.6;
    const h = 1.45;
    const vertices = [
      -halfW, 0, halfL, halfW, 0, halfL, -halfW, h, -halfL, halfW, h, -halfL,
      -halfW, 0, halfL, -halfW, h, -halfL, halfW, 0, halfL, halfW, h, -halfL
    ];
    const indices = [0, 1, 2, 1, 3, 2, 4, 2, 6, 2, 3, 6, 6, 3, 7, 4, 6, 5, 5, 6, 7];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, this.materials.ramp);
    mesh.position.set(center, this.groundY(z) + 0.08, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    ramp.mesh = mesh;
    chunk.ramps.push(ramp);
    chunk.group.add(mesh);
  }

  hasObstacleNear(chunk, x, z, radius) {
    return chunk.obstacles.some((obstacle) => Math.hypot(obstacle.x - x, obstacle.z - z) < radius + obstacle.radius);
  }

  updateVisuals(dt, elapsed, flowActive) {
    for (const chunk of this.chunks) {
      for (const collectible of chunk.collectibles) {
        if (collectible.collected) continue;
        collectible.spin += dt * (flowActive ? 4.5 : 2.4);
        collectible.mesh.rotation.set(collectible.spin * 0.32, collectible.spin, collectible.spin * 0.18);
        collectible.mesh.position.y = this.groundY(collectible.z) + 1.42 + Math.sin(elapsed * 3 + collectible.spin) * 0.12;
      }
    }
  }

  getNearbyChunks(z, range = 44) {
    return this.chunks.filter((chunk) => chunk.startZ + range >= z && chunk.endZ - range <= z);
  }

  getTrackInfo(z) {
    const chunk = this.getChunkAt(z);
    if (!chunk) {
      return {
        chunk: null,
        centerX: 0,
        width: CONFIG.chunkWidthStart,
        groundY: this.groundY(z),
        surface: "snow",
        biome: "snowfield"
      };
    }
    const t = clamp((chunk.startZ - z) / chunk.length, 0, 1);
    return {
      chunk,
      t,
      centerX: this.centerAt(chunk, t),
      width: this.widthAt(chunk, t),
      groundY: this.groundY(z),
      surface: chunk.surface,
      biome: chunk.biome
    };
  }

  getChunkAt(z) {
    return this.chunks.find((chunk) => z <= chunk.startZ && z >= chunk.endZ);
  }

  centerAt(chunk, t) {
    return lerp(chunk.startX, chunk.endX, smoothstep(t)) + Math.sin(t * Math.PI * 2) * chunk.sway;
  }

  widthAt(chunk, t) {
    const pinch = chunk.type === "splitPath" ? Math.sin(t * Math.PI) * 0.14 : 0;
    return chunk.width * (1 - pinch);
  }

  groundY(z) {
    return z * CONFIG.trackSlope + Math.sin(z * 0.033) * 0.28 + Math.sin(z * 0.011) * 0.42;
  }

  createMaterials() {
    return {
      terrain: {
        snowfield: new THREE.MeshStandardMaterial({ color: 0xeef9ff, roughness: 0.76, flatShading: true }),
        iceCanyon: new THREE.MeshStandardMaterial({ color: 0xb9f1ff, roughness: 0.42, metalness: 0.02, flatShading: true }),
        crystalCave: new THREE.MeshStandardMaterial({ color: 0x95d6f0, roughness: 0.54, flatShading: true }),
        auroraRidge: new THREE.MeshStandardMaterial({ color: 0xdaf7f4, roughness: 0.68, flatShading: true }),
        stormPeak: new THREE.MeshStandardMaterial({ color: 0xc8d2d7, roughness: 0.82, flatShading: true })
      },
      valley: {
        snowfield: new THREE.MeshStandardMaterial({ color: 0x8ec4d7, roughness: 0.88, flatShading: true }),
        iceCanyon: new THREE.MeshStandardMaterial({ color: 0x50a5bd, roughness: 0.72, flatShading: true }),
        crystalCave: new THREE.MeshStandardMaterial({ color: 0x323a63, roughness: 0.82, flatShading: true }),
        auroraRidge: new THREE.MeshStandardMaterial({ color: 0x4d8c8d, roughness: 0.78, flatShading: true }),
        stormPeak: new THREE.MeshStandardMaterial({ color: 0x5e6870, roughness: 0.9, flatShading: true })
      },
      edgeLine: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78 }),
      rock: new THREE.MeshStandardMaterial({ color: 0x596168, roughness: 0.92, flatShading: true }),
      iceBlock: new THREE.MeshStandardMaterial({ color: 0x75e8ff, roughness: 0.28, metalness: 0.06, emissive: 0x1ba6c8, emissiveIntensity: 0.18, flatShading: true }),
      spike: new THREE.MeshStandardMaterial({ color: 0xfd4f76, roughness: 0.36, emissive: 0x601024, emissiveIntensity: 0.25, flatShading: true }),
      trunk: new THREE.MeshStandardMaterial({ color: 0x6d4d35, roughness: 0.86, flatShading: true }),
      pine: new THREE.MeshStandardMaterial({ color: 0x17645f, roughness: 0.74, flatShading: true }),
      ramp: new THREE.MeshStandardMaterial({ color: 0xfff0b0, roughness: 0.54, emissive: 0xff8b2d, emissiveIntensity: 0.18, flatShading: true })
    };
  }
}
