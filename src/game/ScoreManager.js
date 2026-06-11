import { CONFIG, STORAGE_KEYS } from "../config.js";
import { clamp } from "./math.js";

export class ScoreManager {
  constructor() {
    this.bestScore = Number(localStorage.getItem(STORAGE_KEYS.bestScore) || 0);
    this.bestDistance = Number(localStorage.getItem(STORAGE_KEYS.bestDistance) || 0);
    this.reset("daily");
  }

  reset(seed) {
    this.seed = seed;
    this.score = 0;
    this.distance = 0;
    this.maxSpeed = 0;
    this.crystals = 0;
    this.combo = 0;
    this.multiplier = 1;
    this.comboTimer = 0;
    this.longestCombo = 0;
    this.flow = 0;
    this.flowActive = false;
    this.flowTimer = 0;
    this.nearMisses = 0;
    this.airtime = 0;
    this.runTime = 0;
    this.newBest = false;
  }

  update(dt, ball, difficulty) {
    this.runTime += dt;
    this.distance = Math.max(this.distance, ball.distance);
    this.maxSpeed = Math.max(this.maxSpeed, ball.speed);
    this.score += (ball.speed * 0.42 + difficulty.value * 18) * this.multiplier * dt;
    this.comboTimer = Math.max(0, this.comboTimer - dt);
    if (this.comboTimer === 0 && this.combo > 0 && !this.flowActive) {
      this.combo = 0;
      this.multiplier = 1;
    }

    if (!ball.grounded) {
      this.airtime += dt;
      this.score += dt * 4 * this.multiplier;
      this.addFlow(dt * 2.4);
    }

    if (ball.speed > 46) this.addFlow(dt * 1.15);

    if (this.flowActive) {
      this.flowTimer -= dt;
      this.score += dt * 26 * this.multiplier;
      if (this.flowTimer <= 0) {
        this.flowActive = false;
        this.flow = 18;
      }
    }
  }

  collect(type) {
    this.crystals += type === "gold" ? 5 : 1;
    this.combo += 1;
    this.longestCombo = Math.max(this.longestCombo, this.combo);
    this.comboTimer = CONFIG.comboWindow;
    this.multiplier = clamp(1 + Math.floor(this.combo / 8), 1, 5);

    const baseScore = type === "gold" ? 420 : type === "flow" ? 120 : 90;
    this.score += baseScore * this.multiplier;
    this.addFlow(type === "flow" ? 28 : type === "gold" ? 18 : 8);
  }

  nearMiss() {
    this.nearMisses += 1;
    this.combo += 1;
    this.longestCombo = Math.max(this.longestCombo, this.combo);
    this.comboTimer = CONFIG.comboWindow;
    this.multiplier = clamp(1 + Math.floor(this.combo / 8), 1, 5);
    this.score += 180 * this.multiplier;
    this.addFlow(14);
  }

  addFlow(amount) {
    if (this.flowActive) return;
    this.flow = clamp(this.flow + amount, 0, CONFIG.flowMax);
    if (this.flow >= CONFIG.flowMax) {
      this.flowActive = true;
      this.flowTimer = CONFIG.flowDuration;
      this.flow = CONFIG.flowMax;
    }
  }

  breakObstacle() {
    this.score += 260 * this.multiplier;
    this.addFlow(5);
  }

  finishRun() {
    this.newBest = this.score > this.bestScore;
    if (this.newBest) {
      this.bestScore = Math.floor(this.score);
      localStorage.setItem(STORAGE_KEYS.bestScore, String(this.bestScore));
    }
    if (this.distance > this.bestDistance) {
      this.bestDistance = Math.floor(this.distance);
      localStorage.setItem(STORAGE_KEYS.bestDistance, String(this.bestDistance));
    }
    return this.getSnapshot();
  }

  getSnapshot() {
    return {
      seed: this.seed,
      score: Math.floor(this.score),
      distance: Math.floor(this.distance),
      maxSpeed: Math.floor(this.maxSpeed),
      crystals: this.crystals,
      combo: this.combo,
      multiplier: this.multiplier,
      longestCombo: this.longestCombo,
      flow: this.flow,
      flowActive: this.flowActive,
      flowTimer: this.flowTimer,
      nearMisses: this.nearMisses,
      airtime: this.airtime,
      bestScore: Math.floor(this.bestScore),
      bestDistance: Math.floor(this.bestDistance),
      newBest: this.newBest,
      runTime: this.runTime
    };
  }
}
