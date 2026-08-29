import { describe, expect, it } from "vitest";
import { almostEqual, idealGasP, timeDilated, rcVoltage } from "../lib/physics";
import {
  elasticCollision1D, dragAccel, classicalDoppler, relativisticDoppler,
  pointField3, wireB, maxwellBoltzmannPdf, qhoEnergy, hydrogenMeta,
  scaleFactor, inclineAccel, waveDispersion, nBodyAccel, gyroPrecession,
  sternGerlachProb,
} from "../lib/physics-advanced";
import { searchConcepts, CONCEPTS } from "../lib/concepts";

describe("catalog", () => {
  it("has original plus advanced labs", () => {
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(43);
    expect(CONCEPTS.some((c) => c.slug === "newtons-second-law")).toBe(true);
    expect(CONCEPTS.some((c) => c.slug === "hydrogen-orbitals")).toBe(true);
  });
  it("search finds aliases", () => {
    expect(searchConcepts("hydrogen").length).toBeGreaterThan(0);
    expect(searchConcepts("double pendulum").some((c) => c.slug === "double-pendulum")).toBe(true);
    expect(searchConcepts("Doppler").length).toBeGreaterThan(0);
    expect(searchConcepts("Maxwell").length).toBeGreaterThan(0);
  });
});

describe("elastic collision", () => {
  it("conserves momentum and energy", () => {
    const c = elasticCollision1D(2, 1, 4, -1);
    expect(c.pErr).toBeLessThan(1e-10);
    expect(c.kErr).toBeLessThan(1e-10);
  });
  it("equal masses exchange velocities", () => {
    const c = elasticCollision1D(1, 1, 3, -2);
    expect(c.v1).toBeCloseTo(-2, 10);
    expect(c.v2).toBeCloseTo(3, 10);
  });
});

describe("projectile drag", () => {
  it("drag acceleration opposes velocity", () => {
    const a = dragAccel(10, 0, 1, 0.5, 1.2, 0.01, 9.81);
    expect(a.ax).toBeLessThan(0);
  });
});

describe("waves and Doppler", () => {
  it("f = v / lambda", () => {
    const w = waveDispersion(2, 4);
    expect(w.f).toBeCloseTo(2, 10);
  });
  it("classical Doppler rises when source approaches", () => {
    const toward = classicalDoppler(440, 30, 0, 343);
    const rest = classicalDoppler(440, 0, 0, 343);
    expect(toward).toBeGreaterThan(rest);
  });
});

describe("fields", () => {
  it("electric field falls as 1/r^2", () => {
    const a = pointField3(0, 0, 0, 1e-9, 1, 0, 0);
    const b = pointField3(0, 0, 0, 1e-9, 2, 0, 0);
    expect(almostEqual(a.ex / b.ex, 4, 1e-6)).toBe(true);
  });
  it("wire B circles with right-hand sense", () => {
    const B = wireB(10, 1, 0);
    expect(B.By).toBeGreaterThan(0);
    expect(Math.abs(B.Bx)).toBeLessThan(1e-12);
  });
});

describe("thermo / quantum / relativity / cosmos", () => {
  it("Maxwell-Boltzmann peak shifts with T", () => {
    expect(maxwellBoltzmannPdf(300, 600, 0.028)).toBeGreaterThan(maxwellBoltzmannPdf(300, 150, 0.028));
  });
  it("QHO levels spaced by hbar omega", () => {
    expect(qhoEnergy(1, 2) - qhoEnergy(0, 2)).toBeCloseTo(2, 10);
  });
  it("hydrogen metadata", () => {
    expect(hydrogenMeta("2p")).toEqual({ n: 2, l: 1, m: 0, label: "2p_z" });
  });
  it("relativistic Doppler receding is redshift", () => {
    expect(relativisticDoppler(440, 0.3)).toBeLessThan(440);
    expect(relativisticDoppler(440, -0.3)).toBeGreaterThan(440);
  });
  it("scale factor grows with time", () => {
    expect(scaleFactor(0.2, 2)).toBeGreaterThan(scaleFactor(0.2, 1));
  });
});

describe("mechanics extras", () => {
  it("sphere rolls slower than a slider", () => {
    expect(inclineAccel("sphere", 9.81, 30)).toBeLessThan(inclineAccel("slide", 9.81, 30));
  });
  it("three-body accelerations are finite", () => {
    const a = nBodyAccel([{ m: 1, x: 0, y: 0 }, { m: 1, x: 1, y: 0 }, { m: 1, x: 0, y: 1 }]);
    expect(a.every((v) => Number.isFinite(v.ax))).toBe(true);
  });
  it("faster spin, slower precession", () => {
    expect(gyroPrecession(40, 1, 2)).toBeLessThan(gyroPrecession(20, 1, 2));
  });
});

describe("thermo gas law", () => {
  it("P scales with T at fixed n,V", () => {
    const a = idealGasP(1, 300, 0.024);
    const b = idealGasP(1, 600, 0.024);
    expect(b / a).toBeCloseTo(2, 8);
  });
});

describe("magnetostatics", () => {
  it("wire B falls as 1/r", () => {
    const near = wireB(10, 1, 0).mag;
    const far = wireB(10, 2, 0).mag;
    expect(near / far).toBeCloseTo(2, 6);
  });
});

describe("stern gerlach", () => {
  it("0 deg is up, 180 is down, 90 is half", () => {
    expect(sternGerlachProb(0).up).toBeCloseTo(1, 8);
    expect(sternGerlachProb(180).up).toBeCloseTo(0, 8);
    expect(sternGerlachProb(90).up).toBeCloseTo(0.5, 8);
  });
});

describe("time dilation helper", () => {
  it("proper time stretches by gamma", () => {
    expect(timeDilated(1, 0.6)).toBeCloseTo(1.25, 3);
  });
});

describe("RC discharge", () => {
  it("starts at V0 and decays", () => {
    expect(rcVoltage(5, 0, 1000, 1e-6)).toBeCloseTo(5, 8);
    expect(rcVoltage(5, 1, 1000, 1e-6)).toBeLessThan(0.1);
  });
});
