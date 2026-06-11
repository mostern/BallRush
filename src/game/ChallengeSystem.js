import { RNG } from "./RNG.js";
import { clamp } from "./math.js";

const CHALLENGE_COUNT = 3;

const TEMPLATES = [
  {
    id: "distance",
    label: "Distance",
    unit: "m",
    targets: [450, 700, 1000, 1300],
    points: [260, 380, 520, 700],
    value: (snapshot) => snapshot.distance
  },
  {
    id: "crystals",
    label: "Crystals",
    unit: "",
    targets: [12, 20, 30, 40],
    points: [240, 340, 480, 650],
    value: (snapshot) => snapshot.crystals
  },
  {
    id: "combo",
    label: "Combo",
    unit: "x",
    targets: [6, 10, 14, 18],
    points: [280, 420, 580, 760],
    value: (snapshot) => snapshot.longestCombo
  },
  {
    id: "gates",
    label: "Gates",
    unit: "",
    targets: [1, 2, 3, 4],
    points: [260, 400, 560, 760],
    value: (snapshot) => snapshot.checkpoints
  },
  {
    id: "perfectLandings",
    label: "Perfect",
    unit: "",
    targets: [1, 2, 3, 4],
    points: [320, 480, 660, 860],
    value: (snapshot) => snapshot.perfectLandings
  },
  {
    id: "nearMisses",
    label: "Near Miss",
    unit: "",
    targets: [2, 4, 6, 8],
    points: [300, 440, 620, 820],
    value: (snapshot) => snapshot.nearMisses
  },
  {
    id: "airtime",
    label: "Airtime",
    unit: "s",
    targets: [1.5, 3, 4.5, 6],
    points: [260, 380, 540, 720],
    value: (snapshot) => snapshot.airtime
  },
  {
    id: "flowBursts",
    label: "Flow",
    unit: "",
    targets: [1, 1, 2, 2],
    points: [320, 440, 680, 860],
    value: (snapshot) => snapshot.flowBursts
  }
];

export class ChallengeSystem {
  constructor() {
    this.seed = "";
    this.daily = false;
    this.levelId = "";
    this.challenges = [];
    this.bonusEarned = 0;
  }

  start(seed, { daily = false, level = null } = {}) {
    this.seed = seed;
    this.daily = daily;
    this.levelId = level?.id || "";
    this.bonusEarned = 0;
    this.challenges = this.generate(seed, daily, this.levelId);
  }

  update(snapshot) {
    const newlyCompleted = [];

    for (const challenge of this.challenges) {
      const nextProgress = clamp(challenge.value(snapshot), 0, challenge.target);
      challenge.progress = nextProgress;
      challenge.percent = challenge.target > 0 ? nextProgress / challenge.target : 1;

      if (!challenge.completed && nextProgress >= challenge.target) {
        challenge.completed = true;
        this.bonusEarned += challenge.points;
        newlyCompleted.push(this.cloneChallenge(challenge));
      }
    }

    return newlyCompleted;
  }

  getState() {
    const completed = this.challenges.filter((challenge) => challenge.completed).length;
    return {
      seed: this.seed,
      daily: this.daily,
      levelId: this.levelId,
      completed,
      total: this.challenges.length,
      bonusEarned: this.bonusEarned,
      challenges: this.challenges.map((challenge) => this.cloneChallenge(challenge))
    };
  }

  generate(seed, daily, levelId) {
    const rng = new RNG(`${seed}:goals:${levelId}`);
    const pool = [...TEMPLATES];
    shuffle(pool, rng);
    return pool.slice(0, CHALLENGE_COUNT).map((template, index) => {
      const tier = clamp(rng.int(0, 2) + (daily ? 1 : 0), 0, template.targets.length - 1);
      const target = template.targets[tier];
      return {
        id: `${template.id}-${index}`,
        type: template.id,
        label: template.label,
        unit: template.unit,
        target,
        progress: 0,
        percent: 0,
        points: template.points[tier],
        completed: false,
        value: template.value
      };
    });
  }

  cloneChallenge(challenge) {
    return {
      id: challenge.id,
      type: challenge.type,
      label: challenge.label,
      unit: challenge.unit,
      target: challenge.target,
      progress: challenge.progress,
      percent: challenge.percent,
      points: challenge.points,
      completed: challenge.completed
    };
  }
}

function shuffle(items, rng) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = rng.int(0, i);
    [items[i], items[j]] = [items[j], items[i]];
  }
}
