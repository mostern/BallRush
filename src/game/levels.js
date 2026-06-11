const BIOME_KEYS = ["snowfield", "iceCanyon", "crystalCave", "auroraRidge", "stormPeak"];

const commonSurface = {
  boost: {
    color: 0xffd166,
    emissive: 0xff8b2d,
    emissiveIntensity: 0.34,
    roughness: 0.44,
    opacity: 0.76
  }
};

export const LEVELS = Object.freeze([
  makeLevel({
    id: "summerHills",
    label: "Summer Hills",
    shortLabel: "Summer",
    tagline: "Warm meadow curves and fast golden lanes.",
    seedPrefix: "summer",
    ui: { color: 0x8ad85a, accent: 0xffd166 },
    weather: {
      color: 0xffdd78,
      opacityBase: 0.08,
      opacityScale: 0.24,
      sizeBase: 0.1,
      sizeScale: 0.1,
      fallSpeed: [2.2, 5.8],
      drift: 7.4,
      forwardBase: 1.4,
      forwardScale: 5.2,
      intensities: {
        snowfield: 0.18,
        iceCanyon: 0.12,
        crystalCave: 0.08,
        auroraRidge: 0.22,
        stormPeak: 0.34
      }
    },
    chase: { wall: 0xf7d47e, chunk: 0xb9793f, effect: 0xffd166 },
    biomes: {
      snowfield: makeBiome("Meadow Start", 0xbbe8ff, 0xc8f0d3, 0.009, 0xe9ffe0, 0x315c3a, 0xfff0c0, 3.2, 0x7ffff1, 0.72, 0xffe07a, 0xff7f4a, 0.08),
      iceCanyon: makeBiome("River Canyon", 0x9ddcf0, 0xa3e8df, 0.012, 0xd7fff0, 0x245b55, 0xffdfa4, 2.9, 0x63f2ff, 0.95, 0x66e0ff, 0xffd166, 0.11),
      crystalCave: makeBiome("Glow Grove", 0x214b45, 0x2d6d5f, 0.018, 0xa5fff0, 0x132a28, 0xb3ffe5, 1.35, 0xffd166, 1.8, 0x79ff98, 0xffd166, 0.2),
      auroraRidge: makeBiome("Sunset Ridge", 0xffb871, 0xffc894, 0.014, 0xfff0ce, 0x4e3a25, 0xffc16a, 2.2, 0xff5f8a, 1.45, 0xffd166, 0xff5f7f, 0.16),
      stormPeak: makeBiome("Heat Haze", 0xd8a167, 0xe2b879, 0.024, 0xffe6bd, 0x4b3c2d, 0xffd49a, 1.7, 0xff8b2d, 1.7, 0xffd166, 0xffffff, 0.1)
    },
    materials: {
      terrain: {
        snowfield: { color: 0x82c86a, roughness: 0.78 },
        iceCanyon: { color: 0x55b99b, roughness: 0.6 },
        crystalCave: { color: 0x356f62, roughness: 0.68 },
        auroraRidge: { color: 0xc9a65b, roughness: 0.74 },
        stormPeak: { color: 0x9b8d61, roughness: 0.86 }
      },
      valley: {
        snowfield: { color: 0x4f9a58, roughness: 0.88 },
        iceCanyon: { color: 0x2f8175, roughness: 0.82 },
        crystalCave: { color: 0x24463d, roughness: 0.88 },
        auroraRidge: { color: 0x8b7041, roughness: 0.84 },
        stormPeak: { color: 0x6e6044, roughness: 0.9 }
      },
      surface: {
        ice: { color: 0x6ee8d4, emissive: 0x21b99d, emissiveIntensity: 0.1, roughness: 0.2, opacity: 0.5 },
        powder: { color: 0xe7d991, emissive: 0x80611f, emissiveIntensity: 0.04, roughness: 0.94, opacity: 0.55 },
        stone: { color: 0x7c795e, roughness: 0.9, opacity: 0.5 },
        ...commonSurface
      },
      edgeLine: { color: 0xfff3a8, opacity: 0.72 },
      rock: { color: 0x6f7057 },
      iceBlock: { color: 0x69d9c6, emissive: 0x1ba68f, emissiveIntensity: 0.15 },
      spike: { color: 0xff4f76, emissive: 0x601024, emissiveIntensity: 0.25 },
      roller: { color: 0xd9c46f, emissive: 0xffd166, emissiveIntensity: 0.12 },
      rollerBand: { color: 0x6c5b35, opacity: 0.5 },
      gatePole: { color: 0x173229, emissive: 0xffd166, emissiveIntensity: 0.22 },
      gateRing: { color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 0.75 },
      tunnelWall: { color: 0x315244, emissive: 0x79ff98, emissiveIntensity: 0.045, opacity: 0.84 },
      tunnelRib: { color: 0xffd166, emissive: 0x79ff98, emissiveIntensity: 0.34 },
      tunnelLight: { color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 1 },
      tunnelRail: { color: 0xffd166, opacity: 0.9 },
      tunnelGlow: { color: 0xffd166, opacity: 0.36 },
      trunk: { color: 0x70512f },
      pine: { color: 0x2f8b49 },
      ramp: { color: 0xffe27d, emissive: 0xff8b2d, emissiveIntensity: 0.18 }
    }
  }),
  makeLevel({
    id: "desertCanyon",
    label: "Desert Canyon",
    shortLabel: "Canyon",
    tagline: "Dusty banks, sharp shadows, and risky sunlit splits.",
    seedPrefix: "canyon",
    ui: { color: 0xd28b3c, accent: 0xff5a3d },
    weather: {
      color: 0xffc37a,
      opacityBase: 0.1,
      opacityScale: 0.32,
      sizeBase: 0.11,
      sizeScale: 0.12,
      fallSpeed: [1.2, 3.8],
      drift: 9.6,
      forwardBase: 3,
      forwardScale: 7,
      intensities: {
        snowfield: 0.16,
        iceCanyon: 0.24,
        crystalCave: 0.08,
        auroraRidge: 0.3,
        stormPeak: 0.48
      }
    },
    chase: { wall: 0xffb15d, chunk: 0x9a4f2b, effect: 0xff8b2d },
    biomes: {
      snowfield: makeBiome("Sun Wash", 0xf0bd7b, 0xf0c28a, 0.012, 0xffead0, 0x6b3b25, 0xffdf9a, 3.0, 0xff7046, 0.75, 0xffcf4a, 0xff5a3d, 0.06),
      iceCanyon: makeBiome("Red Gorge", 0xd88359, 0xd99166, 0.016, 0xffd6aa, 0x4c2a22, 0xffc078, 2.6, 0xff5a3d, 1.0, 0xffd166, 0xff3f7f, 0.09),
      crystalCave: makeBiome("Copper Mine", 0x38243a, 0x59374a, 0.021, 0xffb37d, 0x211824, 0xff8b2d, 1.4, 0x55ecff, 1.8, 0xff8b2d, 0x55ecff, 0.2),
      auroraRidge: makeBiome("Mesa Ridge", 0xc8644d, 0xdd8a62, 0.017, 0xffd2a3, 0x4a2625, 0xff9a68, 2.1, 0xffcf4a, 1.55, 0xffd166, 0xff4c6d, 0.14),
      stormPeak: makeBiome("Dust Storm", 0x8d6751, 0xb9805f, 0.033, 0xffdcc0, 0x44302a, 0xffbd86, 1.35, 0xff6b35, 1.9, 0xffd166, 0xffffff, 0.08)
    },
    materials: {
      terrain: {
        snowfield: { color: 0xcd8e47, roughness: 0.86 },
        iceCanyon: { color: 0xb45b3e, roughness: 0.82 },
        crystalCave: { color: 0x5b3a40, roughness: 0.74 },
        auroraRidge: { color: 0x9a5638, roughness: 0.86 },
        stormPeak: { color: 0x80624a, roughness: 0.94 }
      },
      valley: {
        snowfield: { color: 0x8c5832, roughness: 0.9 },
        iceCanyon: { color: 0x6b3329, roughness: 0.88 },
        crystalCave: { color: 0x33242c, roughness: 0.86 },
        auroraRidge: { color: 0x633525, roughness: 0.9 },
        stormPeak: { color: 0x554235, roughness: 0.94 }
      },
      surface: {
        ice: { color: 0xeeb46d, emissive: 0xff8b2d, emissiveIntensity: 0.1, roughness: 0.32, opacity: 0.5 },
        powder: { color: 0xf4c982, emissive: 0x9c5e20, emissiveIntensity: 0.06, roughness: 0.96, opacity: 0.6 },
        stone: { color: 0x6d5140, roughness: 0.92, opacity: 0.56 },
        ...commonSurface
      },
      edgeLine: { color: 0xffd166, opacity: 0.74 },
      rock: { color: 0x714431 },
      iceBlock: { color: 0xf0a35c, emissive: 0xff6b35, emissiveIntensity: 0.12 },
      spike: { color: 0xff4058, emissive: 0x7a1422, emissiveIntensity: 0.3 },
      roller: { color: 0xb45b3e, emissive: 0xff6b35, emissiveIntensity: 0.14 },
      rollerBand: { color: 0x3f2a24, opacity: 0.54 },
      gatePole: { color: 0x2d1713, emissive: 0xffd166, emissiveIntensity: 0.24 },
      gateRing: { color: 0xffd166, emissive: 0xff8b2d, emissiveIntensity: 0.82 },
      tunnelWall: { color: 0x56372c, emissive: 0xff8b2d, emissiveIntensity: 0.045, opacity: 0.84 },
      tunnelRib: { color: 0xffd166, emissive: 0xff8b2d, emissiveIntensity: 0.36 },
      tunnelLight: { color: 0xffd166, emissive: 0xff8b2d, emissiveIntensity: 1 },
      tunnelRail: { color: 0xffd166, opacity: 0.9 },
      tunnelGlow: { color: 0xff8b2d, opacity: 0.36 },
      trunk: { color: 0x5b3927 },
      pine: { color: 0x6d7a32 },
      ramp: { color: 0xffca73, emissive: 0xff6b35, emissiveIntensity: 0.2 }
    }
  }),
  makeLevel({
    id: "neonCity",
    label: "Neon City",
    shortLabel: "Neon",
    tagline: "Night rails, glass lanes, and bright checkpoint arcs.",
    seedPrefix: "neon",
    ui: { color: 0x55ecff, accent: 0xff3f9e },
    weather: {
      color: 0x79f7ff,
      opacityBase: 0.08,
      opacityScale: 0.28,
      sizeBase: 0.08,
      sizeScale: 0.12,
      fallSpeed: [4.6, 11.5],
      drift: 3.8,
      forwardBase: 4,
      forwardScale: 9,
      intensities: {
        snowfield: 0.12,
        iceCanyon: 0.18,
        crystalCave: 0.26,
        auroraRidge: 0.34,
        stormPeak: 0.46
      }
    },
    chase: { wall: 0xff3f9e, chunk: 0x55ecff, effect: 0xff3f9e },
    biomes: {
      snowfield: makeBiome("Metro Park", 0x162a42, 0x16324a, 0.014, 0x8eeaff, 0x0d1b2a, 0x8eeaff, 1.8, 0xff3f9e, 1.6, 0x55ecff, 0xff3f9e, 0.24),
      iceCanyon: makeBiome("Glass Canal", 0x10283d, 0x123c52, 0.016, 0xb6f7ff, 0x071722, 0x69e6ff, 1.65, 0x55ecff, 2.0, 0x55ecff, 0xffd166, 0.3),
      crystalCave: makeBiome("Arcade Tunnel", 0x111122, 0x1c1530, 0.023, 0xff94db, 0x070711, 0xff4fd8, 1.15, 0x55ecff, 2.7, 0x55ecff, 0xff4fd8, 0.44),
      auroraRidge: makeBiome("Skyline Loop", 0x111f39, 0x153253, 0.018, 0x9dfff8, 0x090f1f, 0x73e8ff, 1.9, 0xff4fd8, 2.7, 0x51ff99, 0xff71c8, 0.38),
      stormPeak: makeBiome("Signal Surge", 0x272d45, 0x31395a, 0.03, 0xd9faff, 0x0e1424, 0xc6f8ff, 1.25, 0xff3f9e, 2.2, 0x55ecff, 0xffffff, 0.22)
    },
    materials: {
      terrain: {
        snowfield: { color: 0x26364a, roughness: 0.58 },
        iceCanyon: { color: 0x1e5061, roughness: 0.42 },
        crystalCave: { color: 0x211f39, roughness: 0.42 },
        auroraRidge: { color: 0x20304f, roughness: 0.52 },
        stormPeak: { color: 0x35384c, roughness: 0.74 }
      },
      valley: {
        snowfield: { color: 0x111c2a, roughness: 0.82 },
        iceCanyon: { color: 0x0e2e3b, roughness: 0.72 },
        crystalCave: { color: 0x11101f, roughness: 0.76 },
        auroraRidge: { color: 0x11192b, roughness: 0.78 },
        stormPeak: { color: 0x1e2132, roughness: 0.84 }
      },
      surface: {
        ice: { color: 0x55ecff, emissive: 0x1ac7ff, emissiveIntensity: 0.32, roughness: 0.12, opacity: 0.58 },
        powder: { color: 0xff5fd7, emissive: 0xff3f9e, emissiveIntensity: 0.22, roughness: 0.42, opacity: 0.5 },
        stone: { color: 0x525b71, roughness: 0.82, opacity: 0.5 },
        ...commonSurface
      },
      edgeLine: { color: 0x55ecff, opacity: 0.9 },
      rock: { color: 0x3b4258 },
      iceBlock: { color: 0x55ecff, emissive: 0x1ac7ff, emissiveIntensity: 0.42 },
      spike: { color: 0xff3f9e, emissive: 0xff1469, emissiveIntensity: 0.36 },
      roller: { color: 0x17243a, emissive: 0x55ecff, emissiveIntensity: 0.28 },
      rollerBand: { color: 0xff3f9e, opacity: 0.58 },
      gatePole: { color: 0x07151d, emissive: 0x55ecff, emissiveIntensity: 0.32 },
      gateRing: { color: 0x55ecff, emissive: 0x55ecff, emissiveIntensity: 0.98 },
      tunnelWall: { color: 0x15182d, emissive: 0x55ecff, emissiveIntensity: 0.07, opacity: 0.84 },
      tunnelRib: { color: 0x55ecff, emissive: 0xff3f9e, emissiveIntensity: 0.48 },
      tunnelLight: { color: 0x55ecff, emissive: 0x55ecff, emissiveIntensity: 1.15 },
      tunnelRail: { color: 0x55ecff, opacity: 0.95 },
      tunnelGlow: { color: 0x55ecff, opacity: 0.42 },
      trunk: { color: 0x232b38 },
      pine: { color: 0x25a985 },
      ramp: { color: 0xffd166, emissive: 0xff3f9e, emissiveIntensity: 0.28 }
    }
  }),
  makeLevel({
    id: "volcanoRidge",
    label: "Volcano Ridge",
    shortLabel: "Volcano",
    tagline: "Basalt banks and ember-lit boost routes.",
    seedPrefix: "volcano",
    ui: { color: 0xff6b35, accent: 0xffcf4a },
    weather: {
      color: 0xff8b2d,
      opacityBase: 0.1,
      opacityScale: 0.36,
      sizeBase: 0.1,
      sizeScale: 0.14,
      fallSpeed: [0.8, 3.2],
      drift: 6.6,
      forwardBase: 2.6,
      forwardScale: 8.5,
      intensities: {
        snowfield: 0.14,
        iceCanyon: 0.2,
        crystalCave: 0.28,
        auroraRidge: 0.34,
        stormPeak: 0.52
      }
    },
    chase: { wall: 0xff4c32, chunk: 0x2a2220, effect: 0xff6b35 },
    biomes: {
      snowfield: makeBiome("Black Plain", 0x6b473c, 0x5d443d, 0.015, 0xffb384, 0x211916, 0xffc28b, 2.2, 0xff6b35, 1.2, 0xff8b2d, 0xffd166, 0.1),
      iceCanyon: makeBiome("Basalt Cut", 0x553332, 0x4d3232, 0.018, 0xffa277, 0x1b1414, 0xff996a, 1.9, 0xff3b18, 1.7, 0xff6b35, 0xffd166, 0.18),
      crystalCave: makeBiome("Magma Tube", 0x170f12, 0x27151a, 0.026, 0xff7a4d, 0x090607, 0xff4c32, 1.1, 0xffd166, 2.4, 0xff6b35, 0xffcf4a, 0.3),
      auroraRidge: makeBiome("Cinder Ridge", 0x402932, 0x5c3530, 0.02, 0xffb07f, 0x1c1011, 0xff7d4e, 1.8, 0xffcf4a, 2.1, 0xff6b35, 0xffd166, 0.22),
      stormPeak: makeBiome("Ash Front", 0x4b4545, 0x665a54, 0.034, 0xffc09a, 0x221d1d, 0xd0bbb0, 1.25, 0xff6b35, 1.9, 0xff8b2d, 0xffffff, 0.1)
    },
    materials: {
      terrain: {
        snowfield: { color: 0x4a403c, roughness: 0.9 },
        iceCanyon: { color: 0x3a3030, roughness: 0.86 },
        crystalCave: { color: 0x251b1f, roughness: 0.78 },
        auroraRidge: { color: 0x57302a, roughness: 0.88 },
        stormPeak: { color: 0x5d5854, roughness: 0.96 }
      },
      valley: {
        snowfield: { color: 0x2d2927, roughness: 0.94 },
        iceCanyon: { color: 0x241e1e, roughness: 0.92 },
        crystalCave: { color: 0x151011, roughness: 0.88 },
        auroraRidge: { color: 0x321c19, roughness: 0.92 },
        stormPeak: { color: 0x3f3b39, roughness: 0.98 }
      },
      surface: {
        ice: { color: 0xff6b35, emissive: 0xff3b18, emissiveIntensity: 0.34, roughness: 0.26, opacity: 0.56 },
        powder: { color: 0x8a7a70, emissive: 0x2a1f1d, emissiveIntensity: 0.08, roughness: 0.98, opacity: 0.58 },
        stone: { color: 0x3d3b39, roughness: 0.96, opacity: 0.56 },
        ...commonSurface
      },
      edgeLine: { color: 0xff8b2d, opacity: 0.78 },
      rock: { color: 0x272727 },
      iceBlock: { color: 0xff6b35, emissive: 0xff3b18, emissiveIntensity: 0.36 },
      spike: { color: 0xffcf4a, emissive: 0xff3b18, emissiveIntensity: 0.42 },
      roller: { color: 0x2d2523, emissive: 0xff6b35, emissiveIntensity: 0.28 },
      rollerBand: { color: 0xffcf4a, opacity: 0.48 },
      gatePole: { color: 0x140f0e, emissive: 0xff6b35, emissiveIntensity: 0.32 },
      gateRing: { color: 0xffcf4a, emissive: 0xff6b35, emissiveIntensity: 0.95 },
      tunnelWall: { color: 0x241918, emissive: 0xff6b35, emissiveIntensity: 0.06, opacity: 0.84 },
      tunnelRib: { color: 0xffcf4a, emissive: 0xff6b35, emissiveIntensity: 0.48 },
      tunnelLight: { color: 0xffcf4a, emissive: 0xff6b35, emissiveIntensity: 1.12 },
      tunnelRail: { color: 0xffcf4a, opacity: 0.92 },
      tunnelGlow: { color: 0xff6b35, opacity: 0.4 },
      trunk: { color: 0x3a2520 },
      pine: { color: 0x5b4630 },
      ramp: { color: 0xffcf4a, emissive: 0xff3b18, emissiveIntensity: 0.32 }
    }
  }),
  makeLevel({
    id: "frostPeak",
    label: "Frost Peak",
    shortLabel: "Frost",
    tagline: "Classic cold air for when winter fits again.",
    seedPrefix: "frost",
    ui: { color: 0x9eeaff, accent: 0xffffff },
    weather: {
      color: 0xffffff,
      opacityBase: 0.16,
      opacityScale: 0.48,
      sizeBase: 0.12,
      sizeScale: 0.16,
      fallSpeed: [7, 20],
      drift: 3.4,
      forwardBase: 2,
      forwardScale: 7,
      intensities: {
        snowfield: 0.18,
        iceCanyon: 0.26,
        crystalCave: 0.06,
        auroraRidge: 0.32,
        stormPeak: 0.88
      }
    },
    chase: { wall: 0xf3fbff, chunk: 0xe8f7ff, effect: 0xf3fbff },
    biomes: {
      snowfield: makeBiome("Snowfield", 0xbfe8ef, 0xc7eef4, 0.011, 0xeafcff, 0x274760, 0xfff2d0, 3.1, 0x61f0ff, 1.1, 0x48ffbd, 0xff5fa8, 0.18),
      iceCanyon: makeBiome("Ice Canyon", 0x91d8ed, 0xa9efff, 0.014, 0xd8fbff, 0x1f5672, 0xdff8ff, 2.8, 0x34dbff, 1.35, 0x64fff3, 0x77a7ff, 0.2),
      crystalCave: makeBiome("Crystal Cave", 0x1b2141, 0x222849, 0.021, 0x65e9ff, 0x16162c, 0x83e9ff, 1.25, 0xff4fd8, 2.15, 0x34f5ff, 0xff4fd8, 0.32),
      auroraRidge: makeBiome("Aurora Ridge", 0x152c4a, 0x235875, 0.016, 0xb8fff0, 0x0e2238, 0x9fe7ff, 1.9, 0x6dffae, 2.6, 0x51ff99, 0xff71c8, 0.46),
      stormPeak: makeBiome("Storm Peak", 0x60717c, 0x9fb0b5, 0.032, 0xd8e0e2, 0x2e353b, 0xd5dee2, 1.35, 0xb9f1ff, 1.7, 0xb6f7ff, 0xffffff, 0.12)
    },
    materials: {
      terrain: {
        snowfield: { color: 0xeef9ff, roughness: 0.76 },
        iceCanyon: { color: 0xb9f1ff, roughness: 0.42 },
        crystalCave: { color: 0x95d6f0, roughness: 0.54 },
        auroraRidge: { color: 0xdaf7f4, roughness: 0.68 },
        stormPeak: { color: 0xc8d2d7, roughness: 0.82 }
      },
      valley: {
        snowfield: { color: 0x8ec4d7, roughness: 0.88 },
        iceCanyon: { color: 0x50a5bd, roughness: 0.72 },
        crystalCave: { color: 0x323a63, roughness: 0.82 },
        auroraRidge: { color: 0x4d8c8d, roughness: 0.78 },
        stormPeak: { color: 0x5e6870, roughness: 0.9 }
      },
      surface: {
        ice: { color: 0x8ef3ff, emissive: 0x1ac7ff, emissiveIntensity: 0.12, roughness: 0.18, opacity: 0.54 },
        powder: { color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.96, opacity: 0.62 },
        stone: { color: 0x6d777d, roughness: 0.9, opacity: 0.5 },
        ...commonSurface
      },
      edgeLine: { color: 0xffffff, opacity: 0.78 },
      rock: { color: 0x596168 },
      iceBlock: { color: 0x75e8ff, emissive: 0x1ba6c8, emissiveIntensity: 0.18 },
      spike: { color: 0xfd4f76, emissive: 0x601024, emissiveIntensity: 0.25 },
      roller: { color: 0xdff8ff, emissive: 0x72efff, emissiveIntensity: 0.12 },
      rollerBand: { color: 0x4b7280, opacity: 0.5 },
      gatePole: { color: 0x102a34, emissive: 0x55ecff, emissiveIntensity: 0.18 },
      gateRing: { color: 0x55ecff, emissive: 0x55ecff, emissiveIntensity: 0.75 },
      tunnelWall: { color: 0x253542, emissive: 0x55ecff, emissiveIntensity: 0.045, opacity: 0.84 },
      tunnelRib: { color: 0xb9f1ff, emissive: 0x55ecff, emissiveIntensity: 0.34 },
      tunnelLight: { color: 0xb9f1ff, emissive: 0x55ecff, emissiveIntensity: 1 },
      tunnelRail: { color: 0xb9f1ff, opacity: 0.9 },
      tunnelGlow: { color: 0xb9f1ff, opacity: 0.36 },
      trunk: { color: 0x6d4d35 },
      pine: { color: 0x17645f },
      ramp: { color: 0xfff0b0, emissive: 0xff8b2d, emissiveIntensity: 0.18 }
    }
  })
]);

export function getLevel(id) {
  return LEVELS.find((level) => level.id === id) || LEVELS[0];
}

function makeLevel(level) {
  return {
    ...level,
    biomes: withBiomeFallbacks(level.biomes),
    materials: level.materials
  };
}

function withBiomeFallbacks(biomes) {
  const fallback = biomes.snowfield;
  return Object.fromEntries(BIOME_KEYS.map((key) => [key, biomes[key] || fallback]));
}

function makeBiome(
  label,
  sky,
  fog,
  fogDensity,
  hemiSky,
  hemiGround,
  sun,
  sunIntensity,
  rim,
  rimIntensity,
  auroraA,
  auroraB,
  auroraOpacity
) {
  return {
    label,
    sky,
    fog,
    fogDensity,
    hemiSky,
    hemiGround,
    sun,
    sunIntensity,
    rim,
    rimIntensity,
    auroraA,
    auroraB,
    auroraOpacity
  };
}
