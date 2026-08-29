import { describe, expect, it } from "vitest";
import { CONCEPTS } from "../lib/concepts";
import { reset, step, measureText } from "../lib/engine";

const ORIGINAL = [
  "newtons-second-law","projectile-motion","conservation-of-energy","pendulum","orbital-motion",
  "wave-interference","standing-waves","double-slit","lens","electric-field","magnetic-field",
  "simple-circuit","ideal-gas","entropy","time-dilation","length-contraction","spacetime-diagram",
  "quantum-double-slit","quantum-tunneling","particle-in-a-box","solar-system","black-hole",
];

describe("registry integrity", () => {
  it("has 44 unique slugs", () => {
    const slugs = CONCEPTS.map((c) => c.slug);
    expect(slugs.length).toBe(44);
    expect(new Set(slugs).size).toBe(44);
  });
  it("every concept has title, category, parameters, equations", () => {
    for (const c of CONCEPTS) {
      expect(c.title.length).toBeGreaterThan(1);
      expect(c.category.length).toBeGreaterThan(1);
      expect(c.parameters.length).toBeGreaterThan(0);
      expect(c.equations.length).toBeGreaterThan(0);
    }
  });
  it("reset + step does not produce NaN for any slug", () => {
    for (const c of CONCEPTS) {
      const s = reset(c);
      step(c.slug, s, 0.016);
      step(c.slug, s, 0.016);
      expect(Number.isFinite(s.t)).toBe(true);
      for (const [k, v] of Object.entries(s.data)) {
        if (typeof v === "number") {
          expect(Number.isFinite(v), `${c.slug}.${k}=${v}`).toBe(true);
        }
      }
      expect(Array.isArray(measureText(c.slug, s))).toBe(true);
    }
  });
  it("keeps the original 22 slugs", () => {
    for (const slug of ORIGINAL) {
      expect(CONCEPTS.some((c) => c.slug === slug)).toBe(true);
    }
  });
});
