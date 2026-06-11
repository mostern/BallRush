import * as THREE from "three";

const THEMES = {
  snowfield: {
    label: "Snowfield",
    sky: 0xbfe8ef,
    fog: 0xc7eef4,
    fogDensity: 0.011,
    hemiSky: 0xeafcff,
    hemiGround: 0x274760,
    sun: 0xfff2d0,
    sunIntensity: 3.1,
    rim: 0x61f0ff,
    rimIntensity: 1.1,
    auroraA: 0x48ffbd,
    auroraB: 0xff5fa8,
    auroraOpacity: 0.18
  },
  iceCanyon: {
    label: "Ice Canyon",
    sky: 0x91d8ed,
    fog: 0xa9efff,
    fogDensity: 0.014,
    hemiSky: 0xd8fbff,
    hemiGround: 0x1f5672,
    sun: 0xdff8ff,
    sunIntensity: 2.8,
    rim: 0x34dbff,
    rimIntensity: 1.35,
    auroraA: 0x64fff3,
    auroraB: 0x77a7ff,
    auroraOpacity: 0.2
  },
  crystalCave: {
    label: "Crystal Cave",
    sky: 0x1b2141,
    fog: 0x222849,
    fogDensity: 0.021,
    hemiSky: 0x65e9ff,
    hemiGround: 0x16162c,
    sun: 0x83e9ff,
    sunIntensity: 1.25,
    rim: 0xff4fd8,
    rimIntensity: 2.15,
    auroraA: 0x34f5ff,
    auroraB: 0xff4fd8,
    auroraOpacity: 0.32
  },
  auroraRidge: {
    label: "Aurora Ridge",
    sky: 0x152c4a,
    fog: 0x235875,
    fogDensity: 0.016,
    hemiSky: 0xb8fff0,
    hemiGround: 0x0e2238,
    sun: 0x9fe7ff,
    sunIntensity: 1.9,
    rim: 0x6dffae,
    rimIntensity: 2.6,
    auroraA: 0x51ff99,
    auroraB: 0xff71c8,
    auroraOpacity: 0.46
  },
  stormPeak: {
    label: "Storm Peak",
    sky: 0x60717c,
    fog: 0x9fb0b5,
    fogDensity: 0.032,
    hemiSky: 0xd8e0e2,
    hemiGround: 0x2e353b,
    sun: 0xd5dee2,
    sunIntensity: 1.35,
    rim: 0xb9f1ff,
    rimIntensity: 1.7,
    auroraA: 0xb6f7ff,
    auroraB: 0xffffff,
    auroraOpacity: 0.12
  }
};

export class BiomeEnvironment {
  constructor(scene, lights, skyRig) {
    this.scene = scene;
    this.lights = lights;
    this.skyRig = skyRig;
    this.theme = cloneTheme(THEMES.snowfield);
    this.target = THEMES.snowfield;
    this.applyTheme(this.theme);
  }

  update(biomeId, dt) {
    this.target = THEMES[biomeId] || THEMES.snowfield;
    const blend = 1 - Math.exp(-1.45 * dt);
    this.theme = {
      ...this.theme,
      sky: lerpColor(this.theme.sky, this.target.sky, blend),
      fog: lerpColor(this.theme.fog, this.target.fog, blend),
      fogDensity: lerpNumber(this.theme.fogDensity, this.target.fogDensity, blend),
      hemiSky: lerpColor(this.theme.hemiSky, this.target.hemiSky, blend),
      hemiGround: lerpColor(this.theme.hemiGround, this.target.hemiGround, blend),
      sun: lerpColor(this.theme.sun, this.target.sun, blend),
      sunIntensity: lerpNumber(this.theme.sunIntensity, this.target.sunIntensity, blend),
      rim: lerpColor(this.theme.rim, this.target.rim, blend),
      rimIntensity: lerpNumber(this.theme.rimIntensity, this.target.rimIntensity, blend),
      auroraA: lerpColor(this.theme.auroraA, this.target.auroraA, blend),
      auroraB: lerpColor(this.theme.auroraB, this.target.auroraB, blend),
      auroraOpacity: lerpNumber(this.theme.auroraOpacity, this.target.auroraOpacity, blend)
    };
    this.applyTheme(this.theme);
  }

  getLabel() {
    return this.target.label;
  }

  applyTheme(theme) {
    this.scene.background.setHex(theme.sky);
    this.scene.fog.color.setHex(theme.fog);
    this.scene.fog.density = theme.fogDensity;
    this.lights.hemi.color.setHex(theme.hemiSky);
    this.lights.hemi.groundColor.setHex(theme.hemiGround);
    this.lights.sun.color.setHex(theme.sun);
    this.lights.sun.intensity = theme.sunIntensity;
    this.lights.rim.color.setHex(theme.rim);
    this.lights.rim.intensity = theme.rimIntensity;

    this.skyRig.children.forEach((child, index) => {
      child.material.color.setHex(index % 2 ? theme.auroraB : theme.auroraA);
      child.userData.baseOpacity = (index % 2 ? 0.7 : 1) * theme.auroraOpacity;
    });
  }
}

function cloneTheme(theme) {
  return { ...theme };
}

function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  const colorA = new THREE.Color(a);
  colorA.lerp(new THREE.Color(b), t);
  return colorA.getHex();
}
