export class RNG {
  constructor(seed) {
    this.seed = String(seed || "ball-rush");
    this.state = this.hash(this.seed);
  }

  hash(seed) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seed.length; i += 1) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min, max) {
    return min + (max - min) * this.next();
  }

  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  chance(probability) {
    return this.next() < probability;
  }

  choice(items) {
    return items[Math.floor(this.next() * items.length)];
  }
}
