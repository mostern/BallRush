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
  storagePrefix: "snowballRush"
});

export const STORAGE_KEYS = Object.freeze({
  bestScore: `${CONFIG.storagePrefix}.bestScore`,
  bestDistance: `${CONFIG.storagePrefix}.bestDistance`,
  bestGhost: `${CONFIG.storagePrefix}.bestGhost`,
  selectedSkin: `${CONFIG.storagePrefix}.selectedSkin`
});
