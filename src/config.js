export const CONFIG = Object.freeze({
  baseSpeed: 18,
  maxSpeed: 76,
  speedIncreasePerSecond: 0.22,
  steeringForce: 44,
  lateralFriction: 0.91,
  forwardFriction: 0.995,
  jumpForce: 13.5,
  rampJumpForce: 17,
  gravity: 30,
  ballRadius: 1,
  chunkLength: 80,
  chunkWidthStart: 32,
  chunkWidthMin: 13,
  activeChunksAhead: 9,
  activeChunksBehind: 3,
  trackStartZ: 42,
  trackSlope: 0.155,
  maxCurveOffset: 34,
  flowMax: 100,
  flowDuration: 7.5,
  comboWindow: 3.1,
  offTrackGrace: 0.34,
  nearMissRadius: 3.2,
  ghostSampleInterval: 0.12,
  magnetDuration: 5,
  magnetRadius: 11,
  magnetPullStrength: 18,
  avalancheStartTime: 42,
  avalancheStartDistance: 900,
  avalancheStartGap: 92,
  avalancheMaxGap: 118,
  avalancheCatchGap: 12,
  avalancheBaseSpeed: 15,
  avalancheDifficultySpeed: 52,
  storagePrefix: "ballRush",
  legacyStoragePrefix: "snowballRush"
});

export const STORAGE_KEYS = Object.freeze({
  bestScore: `${CONFIG.storagePrefix}.bestScore`,
  bestDistance: `${CONFIG.storagePrefix}.bestDistance`,
  bestGhost: `${CONFIG.storagePrefix}.bestGhost`,
  selectedSkin: `${CONFIG.storagePrefix}.selectedSkin`,
  selectedLevel: `${CONFIG.storagePrefix}.selectedLevel`
});

export const LEGACY_STORAGE_KEYS = Object.freeze({
  bestScore: `${CONFIG.legacyStoragePrefix}.bestScore`,
  bestDistance: `${CONFIG.legacyStoragePrefix}.bestDistance`,
  bestGhost: `${CONFIG.legacyStoragePrefix}.bestGhost`,
  selectedSkin: `${CONFIG.legacyStoragePrefix}.selectedSkin`
});

export function readStorage(key, legacyKey = null) {
  if (typeof localStorage === "undefined") return null;
  const value = localStorage.getItem(key);
  if (value !== null || !legacyKey) return value;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) localStorage.setItem(key, legacyValue);
  return legacyValue;
}

export function writeStorage(key, value) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
}
