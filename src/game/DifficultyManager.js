import { clamp, lerp } from "./math.js";

const BIOMES = [
  { id: "snowfield", label: "Snowfield", at: 0 },
  { id: "iceCanyon", label: "Ice Canyon", at: 900 },
  { id: "crystalCave", label: "Crystal Cave", at: 1900 },
  { id: "auroraRidge", label: "Aurora Ridge", at: 3200 },
  { id: "stormPeak", label: "Storm Peak", at: 4700 }
];

export class DifficultyManager {
  getDifficulty(runTime, distance) {
    const timeValue = clamp(runTime / 185, 0, 1);
    const distanceValue = clamp(distance / 5400, 0, 1);
    return this.makeDifficulty(timeValue * 0.62 + distanceValue * 0.38, distance);
  }

  getDifficultyForDistance(distance) {
    return this.makeDifficulty(clamp(distance / 5600, 0, 1), distance);
  }

  makeDifficulty(value, distance) {
    const biome = this.getBiome(distance);
    return {
      value,
      biome,
      width: lerp(32, 13, value),
      obstacleScale: lerp(0.35, 1, value),
      curveIntensity: lerp(4, 19, value),
      collectibleDensity: lerp(1, 0.58, value),
      speedBonus: lerp(0, 24, value)
    };
  }

  getBiome(distance) {
    let active = BIOMES[0];
    for (const biome of BIOMES) {
      if (distance >= biome.at) active = biome;
    }
    return active;
  }
}
