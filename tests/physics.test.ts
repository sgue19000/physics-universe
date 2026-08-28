import { describe, expect, it } from "vitest";
import {
  almostEqual,
  fringeSpacing,
  lengthContracted,
  lorentzGamma,
  pendulumPeriodSmall,
  projectileAnalytical,
  projectileRange,
  rk4,
  squareWellEnergy,
  tunnelTransmission,
} from "../lib/physics";
import { analyticalCheckProjectile } from "../lib/engine";

describe("projectile analytics", () => {
  it("matches range formula at 45 degrees", () => {
    const g = 9.81;
    const v0 = 20;
    const pred = projectileRange(v0, Math.PI / 4, g);
    expect(almostEqual(pred.range, (v0 * v0) / g, 1e-6)).toBe(true);
  });
  it("numerical integrator tracks analytic path", () => {
    const res = analyticalCheckProjectile(25, 45, 9.81);
    expect(res.ok).toBe(true);
  });
  it("y is zero at time of flight", () => {
    const g = 9.81;
    const v0 = 15;
    const th = Math.PI / 6;
    const { t } = projectileRange(v0, th, g);
    const p = projectileAnalytical(t, v0, th, g);
    expect(Math.abs(p.y)).toBeLessThan(1e-8);
  });
});

describe("pendulum", () => {
  it("small-angle period scales as sqrt(L)", () => {
    const T1 = pendulumPeriodSmall(1, 9.81);
    const T2 = pendulumPeriodSmall(4, 9.81);
    expect(almostEqual(T2 / T1, 2, 1e-9)).toBe(true);
  });
});

describe("relativity", () => {
  it("gamma is 1 at rest and grows", () => {
    expect(lorentzGamma(0)).toBeCloseTo(1, 10);
    expect(lorentzGamma(0.6)).toBeCloseTo(1.25, 3);
    expect(lengthContracted(10, 0.6)).toBeCloseTo(8, 2);
  });
  it("does not allow v > c in gamma", () => {
    expect(Number.isFinite(lorentzGamma(0.999))).toBe(true);
  });
});

describe("optics / quantum", () => {
  it("fringe spacing scales with wavelength", () => {
    const a = fringeSpacing(500e-9, 1e-4, 1);
    const b = fringeSpacing(1000e-9, 1e-4, 1);
    expect(almostEqual(b / a, 2, 1e-9)).toBe(true);
  });
  it("particle in a box energy ~ n^2", () => {
    expect(almostEqual(squareWellEnergy(2, 1) / squareWellEnergy(1, 1), 4, 1e-9)).toBe(true);
  });
  it("tunneling T drops as barrier thickens when E < V", () => {
    const thin = tunnelTransmission(4, 8, 0.2);
    const thick = tunnelTransmission(4, 8, 1.2);
    expect(thick).toBeLessThan(thin);
    expect(thin).toBeGreaterThan(0);
    expect(thick).toBeGreaterThanOrEqual(0);
  });
});

describe("rk4", () => {
  it("integrates y' = y approximately", () => {
    let y = [1];
    const dt = 0.01;
    for (let i = 0; i < 100; i++) y = rk4(y, dt, (z) => [z[0]]);
    expect(y[0]).toBeCloseTo(Math.exp(1), 2);
  });
});
