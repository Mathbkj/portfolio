// Shared between HeatSection (background) and CokeCan (can post-process), so
// both switch to heat vision at the same moment.
export const HEAT_SECTION_ID = "heat-section";

// Heat vision is on while the can (fixed at the viewport center) is inside the
// heat section: its top has passed the middle of the viewport.
export function isHeatActive() {
  const section = document.getElementById(HEAT_SECTION_ID);
  if (!section) return false;
  const { top, bottom } = section.getBoundingClientRect();
  const center = window.innerHeight / 2;
  return top <= center && bottom > center;
}

// "Ironbow" thermal palette, cold to hot: black, deep blue, purple, red,
// orange, pale yellow. Takes t in [0, 1] and returns an sRGB color.
export const IRONBOW_GLSL = /* glsl */ `
  vec3 ironbow(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.00, 0.00, 0.02);
    vec3 c1 = vec3(0.10, 0.02, 0.38);
    vec3 c2 = vec3(0.52, 0.02, 0.58);
    vec3 c3 = vec3(0.90, 0.16, 0.12);
    vec3 c4 = vec3(1.00, 0.60, 0.02);
    vec3 c5 = vec3(1.00, 0.98, 0.78);
    if (t < 0.2) return mix(c0, c1, t / 0.2);
    if (t < 0.4) return mix(c1, c2, (t - 0.2) / 0.2);
    if (t < 0.6) return mix(c2, c3, (t - 0.4) / 0.2);
    if (t < 0.8) return mix(c3, c4, (t - 0.6) / 0.2);
    return mix(c4, c5, (t - 0.8) / 0.2);
  }
`;
