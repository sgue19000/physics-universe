/** Shared SI physics helpers and integrators. */

export const G = 6.6743e-11;
export const C = 299792458;
export const K_E = 8.9875517923e9;
export const HBAR = 1.054571817e-34;
export const KB = 1.380649e-23;
export const ME = 9.1093837e-31;
export const QE = 1.602176634e-19;

export function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

export function rk4(y: number[], dt: number, f: (y: number[]) => number[]): number[] {
  const k1 = f(y);
  const y2 = y.map((v, i) => v + 0.5 * dt * k1[i]);
  const k2 = f(y2);
  const y3 = y.map((v, i) => v + 0.5 * dt * k2[i]);
  const k3 = f(y3);
  const y4 = y.map((v, i) => v + dt * k3[i]);
  const k4 = f(y4);
  return y.map((v, i) => v + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
}

export function projectileAnalytical(t: number, v0: number, theta: number, g: number, y0 = 0) {
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  return { x: vx * t, y: y0 + vy * t - 0.5 * g * t * t, vx, vy: vy - g * t };
}

export function projectileRange(v0: number, theta: number, g: number, y0 = 0) {
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  const disc = vy * vy + 2 * g * y0;
  const t = (vy + Math.sqrt(Math.max(0, disc))) / g;
  return { t, range: vx * t, hmax: y0 + (vy * vy) / (2 * g) };
}

export function pendulumPeriodSmall(L: number, g: number) {
  return 2 * Math.PI * Math.sqrt(L / g);
}

export function pendulumAcc(theta: number, g: number, L: number, damping = 0, omega = 0) {
  return -(g / L) * Math.sin(theta) - damping * omega;
}

export function lorentzGamma(vOverC: number) {
  const b = clamp(vOverC, 0, 0.999999);
  return 1 / Math.sqrt(1 - b * b);
}

export function timeDilated(properTime: number, vOverC: number) {
  return properTime * lorentzGamma(vOverC);
}

export function lengthContracted(properL: number, vOverC: number) {
  return properL / lorentzGamma(vOverC);
}

export function fringeSpacing(lambda: number, d: number, L: number) {
  if (d === 0) return Infinity;
  return (lambda * L) / d;
}

export function squareWellEnergy(n: number, L: number, mass = 1, hbar = 1) {
  return (n * n * Math.PI * Math.PI * hbar * hbar) / (2 * mass * L * L);
}

export function squareWellPsi(n: number, x: number, L: number) {
  return Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L);
}

export function tunnelTransmission(E: number, V: number, width: number, mass = 1, hbar = 1) {
  if (E <= 0) return 0;
  if (E >= V) {
    const l = Math.sqrt(2 * mass * (E - V)) / hbar;
    const denom = 1 + ((V * V) / (4 * E * (E - V))) * Math.sin(l * width) * Math.sin(l * width);
    return 1 / denom;
  }
  const kappa = Math.sqrt(2 * mass * (V - E)) / hbar;
  const sink = Math.sinh(kappa * width);
  const denom = 1 + ((V * V) / (4 * E * (V - E))) * sink * sink;
  return 1 / denom;
}

export function idealGasP(n: number, T: number, V: number, R = 8.314) {
  return (n * R * T) / V;
}

export function twoSlitIntensity(x: number, lambda: number, d: number, L: number, slitWidth: number) {
  const theta = Math.atan(x / L);
  const beta = (Math.PI * slitWidth * Math.sin(theta)) / lambda;
  const delta = (Math.PI * d * Math.sin(theta)) / lambda;
  const env = beta === 0 ? 1 : (Math.sin(beta) / beta) ** 2;
  return env * Math.cos(delta) ** 2;
}

export function schwarzschildRadius(M: number) {
  return (2 * G * M) / (C * C);
}

export function gravitationalTimeDilation(r: number, M: number) {
  const rs = schwarzschildRadius(M);
  if (r <= rs) return 0;
  return Math.sqrt(1 - rs / r);
}

export function almostEqual(a: number, b: number, tol = 1e-6) {
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) <= tol * scale;
}
