import * as THREE from "three";
import { CONFIG } from "../config.js";
import { BallController } from "./BallController.js";
import { CameraController } from "./CameraController.js";
import { ChunkManager } from "./ChunkManager.js";
import { CollisionSystem } from "./CollisionSystem.js";
import { DifficultyManager } from "./DifficultyManager.js";
import { GhostSystem } from "./GhostSystem.js";
import { Input } from "./Input.js";
import { ScoreManager } from "./ScoreManager.js";
import { AudioSystem } from "./AudioSystem.js";
import { ParticleSystem } from "../effects/Particles.js";
import { Trail } from "../effects/Trail.js";
import { HUD } from "../ui/HUD.js";

export class Game {
  constructor(root) {
    this.root = root;
    this.clock = new THREE.Clock();
    this.elapsed = 0;
    this.state = "menu";
    this.dailyMode = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbfe8ef);
    this.scene.fog = new THREE.FogExp2(0xc7eef4, 0.011);

    this.camera = new THREE.PerspectiveCamera(66, window.innerWidth / window.innerHeight, 0.1, 900);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.root.prepend(this.renderer.domElement);

    this.input = new Input();
    this.difficultyManager = new DifficultyManager();
    this.score = new ScoreManager();
    this.chunkManager = new ChunkManager(this.scene);
    this.ball = new BallController(this.scene);
    this.cameraController = new CameraController(this.camera);
    this.collisionSystem = new CollisionSystem();
    this.particles = new ParticleSystem(this.scene);
    this.trail = new Trail(this.scene);
    this.ghost = new GhostSystem(this.scene);
    this.audio = new AudioSystem();
    this.hud = new HUD();

    this.createLighting();
    this.createSkyRig();
    this.resetWorld(this.getDailySeed());

    this.hud.bind({
      onStartRun: () => this.startRun(this.state === "gameover" && this.dailyMode),
      onDailyRun: () => this.startRun(true)
    });
    this.hud.showMenu(this.score.bestScore);
    this.hud.update(this.score.getSnapshot(), this.ball);

    window.addEventListener("resize", () => this.onResize());
    this.renderer.setAnimationLoop(() => this.tick());
  }

  createLighting() {
    const hemi = new THREE.HemisphereLight(0xeafcff, 0x274760, 1.7);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d0, 3.1);
    sun.position.set(-28, 56, 36);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    this.scene.add(sun);

    const rim = new THREE.DirectionalLight(0x61f0ff, 1.1);
    rim.position.set(36, 18, -28);
    this.scene.add(rim);
  }

  createSkyRig() {
    this.skyRig = new THREE.Group();
    const auroraMaterialA = new THREE.MeshBasicMaterial({
      color: 0x48ffbd,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const auroraMaterialB = new THREE.MeshBasicMaterial({
      color: 0xff5fa8,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    for (let i = 0; i < 5; i += 1) {
      const geometry = new THREE.PlaneGeometry(70 + i * 18, 7 + i * 2, 12, 1);
      const material = i % 2 ? auroraMaterialB : auroraMaterialA;
      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.position.set(-45 + i * 24, 54 + i * 3, -150 - i * 22);
      ribbon.rotation.set(-0.32, 0.08 * i, -0.1 + i * 0.04);
      this.skyRig.add(ribbon);
    }
    this.scene.add(this.skyRig);
  }

  resetWorld(seed) {
    this.seed = seed;
    this.chunkManager.reset(seed, (distance) => this.difficultyManager.getDifficultyForDistance(distance));
    const track = this.chunkManager.getTrackInfo(5);
    this.ball.reset(track);
    this.cameraController.reset(this.ball);
    this.collisionSystem.reset();
    this.trail.reset();
    this.ghost.reset();
  }

  startRun(daily = false) {
    this.audio.resume();
    this.dailyMode = daily;
    const retrySeed = !daily && this.state === "gameover" && this.seed;
    const seed = daily ? this.getDailySeed() : retrySeed ? this.seed : `run-${Date.now().toString(36)}`;
    this.resetWorld(seed);
    this.score.reset(seed);
    this.ghost.start(seed);
    this.elapsed = 0;
    this.state = "running";
    this.hud.showRun(seed, this.ghost.getStatus());
  }

  endRun(reason) {
    if (this.state !== "running") return;
    this.state = "gameover";
    const snapshot = this.score.finishRun();
    snapshot.ghostActive = this.ghost.getStatus().active;
    snapshot.ghostSaved = this.ghost.finish(snapshot);
    this.hud.showGameOver(reason, snapshot);
  }

  tick() {
    const dt = Math.min(this.clock.getDelta(), 0.033);
    this.elapsed += dt;

    if (this.input.consumeRestart() && this.state !== "running") {
      this.startRun(this.dailyMode);
    }

    if (this.state === "running") {
      this.updateRun(dt);
    } else {
      this.updateAttract(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  updateRun(dt) {
    const difficulty = this.difficultyManager.getDifficulty(this.score.runTime, this.ball.distance);
    this.chunkManager.update(this.ball.position.z, (distance) => this.difficultyManager.getDifficultyForDistance(distance));
    const scoreState = this.score.getSnapshot();
    this.ball.update(dt, this.input, difficulty, (z) => this.chunkManager.getTrackInfo(z), scoreState, this.particles);
    this.score.update(dt, this.ball, difficulty);
    this.ghost.update(dt, this.ball, this.score.runTime);
    this.chunkManager.updateVisuals(dt, this.elapsed, this.score.flowActive);
    this.collisionSystem.update(
      dt,
      this.ball,
      this.chunkManager,
      this.score,
      this.particles,
      this.cameraController,
      this.audio,
      (reason) => this.endRun(reason)
    );

    const track = this.chunkManager.getTrackInfo(this.ball.position.z);
    this.cameraController.update(dt, this.ball, track, this.score.flowActive);
    this.trail.update(dt, this.ball, this.score.flowActive);
    this.particles.update(dt);
    this.updateSkyRig();
    this.hud.update(this.score.getSnapshot(), this.ball);
  }

  updateAttract(dt) {
    const track = this.chunkManager.getTrackInfo(this.ball.position.z);
    this.ball.position.z -= dt * 5;
    this.ball.position.y = this.chunkManager.getTrackInfo(this.ball.position.z).groundY + this.ball.radius;
    this.ball.updateMesh(false);
    if (this.ball.position.z < -60) {
      this.resetWorld(this.getDailySeed());
    }
    this.chunkManager.updateVisuals(dt, this.elapsed, false);
    this.cameraController.update(dt, this.ball, track, false);
    this.trail.update(dt, this.ball, false);
    this.particles.update(dt);
    this.updateSkyRig();
  }

  updateSkyRig() {
    this.skyRig.position.set(this.ball.position.x * 0.12, this.ball.position.y * 0.1, this.ball.position.z);
    this.skyRig.children.forEach((child, index) => {
      child.material.opacity = (index % 2 ? 0.12 : 0.18) + Math.sin(this.elapsed * 0.8 + index) * 0.035;
    });
  }

  getDailySeed() {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `daily-seed-${yyyy}-${mm}-${dd}`;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
