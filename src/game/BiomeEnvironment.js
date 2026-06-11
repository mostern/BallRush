import * as THREE from "three";
import { getLevel } from "./levels.js";

export class BiomeEnvironment {
  constructor(scene, lights, skyRig) {
    this.scene = scene;
    this.lights = lights;
    this.skyRig = skyRig;
    this.level = getLevel();
    this.theme = cloneTheme(this.getTheme("snowfield"));
    this.target = this.getTheme("snowfield");
    this.applyTheme(this.theme);
  }

  setLevel(level) {
    this.level = getLevel(level?.id || level);
    this.target = this.getTheme("snowfield");
    this.theme = cloneTheme(this.target);
    this.applyTheme(this.theme);
  }

  update(biomeId, dt) {
    this.target = this.getTheme(biomeId);
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

  getTheme(biomeId) {
    return this.level.biomes[biomeId] || this.level.biomes.snowfield;
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
