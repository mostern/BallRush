import { CONFIG, STORAGE_KEYS } from "../config.js";
import { clamp } from "./math.js";

export class ScoreManager {
  constructor() {
    this.bestScore = readNumber(STORAGE_KEYS.bestScore);
    this.bestDistance = readNumber(STORAGE_KEYS.bestDistance);
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
    this.landings = 0;
    this.perfectLandings = 0;
    this.checkpoints = 0;
    this.checkpointStreak = 0;
    this.longestCheckpointStreak = 0;
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

  landing(event) {
    if (!event || event.airtime < 0.32) return { scored: false, perfect: false };

    this.landings += 1;
    const airtimeScore = Math.floor((90 + event.airtime * 180) * this.multiplier);
    this.score += airtimeScore;
    this.addFlow(6 + Math.min(18, event.airtime * 5));

    if (event.perfect) {
      this.perfectLandings += 1;
      this.combo += 2;
      this.longestCombo = Math.max(this.longestCombo, this.combo);
      this.comboTimer = CONFIG.comboWindow;
      this.multiplier = clamp(1 + Math.floor(this.combo / 8), 1, 5);
      this.score += 240 * this.multiplier;
      this.addFlow(16);
    }

    return { scored: true, perfect: event.perfect, points: airtimeScore };
  }

  checkpoint() {
    this.checkpoints += 1;
    this.checkpointStreak += 1;
    this.longestCheckpointStreak = Math.max(this.longestCheckpointStreak, this.checkpointStreak);
    this.combo += 2;
    this.longestCombo = Math.max(this.longestCombo, this.combo);
    this.comboTimer = CONFIG.comboWindow;
    this.multiplier = clamp(1 + Math.floor(this.combo / 8), 1, 5);
    this.score += (160 + this.checkpointStreak * 45) * this.multiplier;
    this.addFlow(10 + Math.min(12, this.checkpointStreak * 1.5));
  }

  missCheckpoint() {
    this.checkpointStreak = 0;
  }

  finishRun() {
    this.newBest = this.score > this.bestScore;
    if (this.newBest) {
      this.bestScore = Math.floor(this.score);
      writeValue(STORAGE_KEYS.bestScore, String(this.bestScore));
    }
    if (this.distance > this.bestDistance) {
      this.bestDistance = Math.floor(this.distance);
      writeValue(STORAGE_KEYS.bestDistance, String(this.bestDistance));
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
      landings: this.landings,
      perfectLandings: this.perfectLandings,
      checkpoints: this.checkpoints,
      checkpointStreak: this.checkpointStreak,
      longestCheckpointStreak: this.longestCheckpointStreak,
      bestScore: Math.floor(this.bestScore),
      bestDistance: Math.floor(this.bestDistance),
      newBest: this.newBest,
      runTime: this.runTime
    };
  }
}

function readNumber(key) {
  if (typeof localStorage === "undefined") return 0;
  return Number(localStorage.getItem(key) || 0);
}

function writeValue(key, value) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
}
