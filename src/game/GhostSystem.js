import * as THREE from "three";
import { CONFIG, STORAGE_KEYS } from "../config.js";
import { lerp } from "./math.js";

const STORE_VERSION = 1;
const MAX_STORED_RUNS = 8;

export class GhostSystem {
  constructor(scene) {
    this.scene = scene;
    this.seed = "";
    this.recording = [];
    this.recordTimer = 0;
    this.replay = null;
    this.replayIndex = 0;
    this.visible = false;

    this.group = new THREE.Group();
    this.shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(CONFIG.ballRadius * 0.96, 3),
      new THREE.MeshStandardMaterial({
        color: 0x92f6ff,
        roughness: 0.18,
        metalness: 0.08,
        transparent: true,
        opacity: 0.34,
        emissive: 0x55ecff,
        emissiveIntensity: 0.4,
        depthWrite: false
      })
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.52,
      depthWrite: false
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.025, 8, 48), ringMaterial);
    const ringB = ringA.clone();
    ringA.rotation.x = Math.PI / 2;
    ringB.rotation.y = Math.PI / 2;
    this.group.add(this.shell, ringA, ringB);
    this.group.visible = false;
    scene.add(this.group);
  }

  start(seed) {
    this.seed = seed;
    this.recording = [];
    this.recordTimer = 0;
    this.replayIndex = 0;
    this.replay = this.loadReplay(seed);
    this.visible = Boolean(this.replay?.frames?.length);
    this.group.visible = this.visible;
    if (this.visible) {
      const first = this.replay.frames[0];
      this.group.position.set(first.x, first.y, first.z);
    }
  }

  reset() {
    this.recording = [];
    this.recordTimer = 0;
    this.replayIndex = 0;
    this.replay = null;
    this.visible = false;
    this.group.visible = false;
  }

  update(dt, ball, runTime) {
    this.recordTimer -= dt;
    if (this.recordTimer <= 0) {
      this.recordTimer = CONFIG.ghostSampleInterval;
      this.recording.push({
        t: round(runTime, 2),
        x: round(ball.position.x, 2),
        y: round(ball.position.y, 2),
        z: round(ball.position.z, 2),
        s: round(ball.speed, 1)
      });
    }

    if (!this.visible || !this.replay) return;

    const frames = this.replay.frames;
    while (this.replayIndex < frames.length - 2 && frames[this.replayIndex + 1].t < runTime) {
      this.replayIndex += 1;
    }
    const a = frames[this.replayIndex];
    const b = frames[Math.min(this.replayIndex + 1, frames.length - 1)];
    if (!a || !b) return;

    const span = Math.max(0.001, b.t - a.t);
    const t = Math.min(1, Math.max(0, (runTime - a.t) / span));
    this.group.position.set(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
    this.group.rotation.x -= (b.s || CONFIG.baseSpeed) * dt * 0.7;
    this.group.rotation.z += (b.x - a.x) * 0.02;
    this.shell.material.opacity = 0.26 + Math.sin(runTime * 8) * 0.06;
  }

  finish(snapshot) {
    if (this.recording.length < 8) return false;

    const store = this.readStore();
    const current = store.runs[this.seed];
    const shouldSave =
      !current ||
      snapshot.score > current.score ||
      snapshot.distance > current.distance ||
      snapshot.newBest;

    if (!shouldSave) return false;

    store.runs[this.seed] = {
      seed: this.seed,
      score: snapshot.score,
      distance: snapshot.distance,
      createdAt: Date.now(),
      frames: this.recording
    };
    this.pruneStore(store);
    this.writeStore(store);
    return true;
  }

  getStatus() {
    return {
      active: this.visible,
      score: this.replay?.score || 0,
      distance: this.replay?.distance || 0
    };
  }

  loadReplay(seed) {
    const store = this.readStore();
    return store.runs[seed] || null;
  }

  readStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.bestGhost) || "null");
      if (parsed?.version === STORE_VERSION && parsed.runs && typeof parsed.runs === "object") {
        return parsed;
      }
    } catch {}
    return { version: STORE_VERSION, runs: {} };
  }

  writeStore(store) {
    try {
      localStorage.setItem(STORAGE_KEYS.bestGhost, JSON.stringify(store));
    } catch {
      const entries = Object.entries(store.runs).sort(([, a], [, b]) => b.createdAt - a.createdAt);
      store.runs = Object.fromEntries(entries.slice(0, Math.max(1, Math.floor(MAX_STORED_RUNS / 2))));
      localStorage.setItem(STORAGE_KEYS.bestGhost, JSON.stringify(store));
    }
  }

  pruneStore(store) {
    const entries = Object.entries(store.runs).sort(([, a], [, b]) => b.createdAt - a.createdAt);
    store.runs = Object.fromEntries(entries.slice(0, MAX_STORED_RUNS));
  }
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
