export const SKINS = Object.freeze([
  {
    id: "snow",
    label: "Snowball",
    color: 0xf8fbff,
    accent: 0xff3f7f,
    emissive: 0x78e7ff,
    emissiveIntensity: 0.05,
    roughness: 0.42,
    metalness: 0.05,
    opacity: 1
  },
  {
    id: "glass",
    label: "Glass",
    color: 0xb9f7ff,
    accent: 0xffffff,
    emissive: 0x5be8ff,
    emissiveIntensity: 0.18,
    roughness: 0.08,
    metalness: 0.18,
    opacity: 0.62
  },
  {
    id: "lava",
    label: "Lava",
    color: 0x211414,
    accent: 0xff6b35,
    emissive: 0xff3b18,
    emissiveIntensity: 0.62,
    roughness: 0.7,
    metalness: 0.04,
    opacity: 1
  },
  {
    id: "neon",
    label: "Neon",
    color: 0x0d1b2a,
    accent: 0x55ecff,
    emissive: 0x22d3ff,
    emissiveIntensity: 0.74,
    roughness: 0.24,
    metalness: 0.15,
    opacity: 1
  },
  {
    id: "disco",
    label: "Disco",
    color: 0xf4e8ff,
    accent: 0xffd166,
    emissive: 0xff4fd8,
    emissiveIntensity: 0.24,
    roughness: 0.16,
    metalness: 0.78,
    opacity: 1
  },
  {
    id: "gold",
    label: "Gold",
    color: 0xffcf4a,
    accent: 0xffffff,
    emissive: 0xff8b2d,
    emissiveIntensity: 0.22,
    roughness: 0.28,
    metalness: 0.56,
    opacity: 1
  }
]);

export function getSkin(id) {
  return SKINS.find((skin) => skin.id === id) || SKINS[0];
}
