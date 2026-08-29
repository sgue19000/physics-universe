import { C, K_E, clamp } from "./physics";

export function elasticCollision1D(m1: number, m2: number, u1: number, u2: number) {
  const p0 = m1 * u1 + m2 * u2;
  const k0 = 0.5 * m1 * u1 * u1 + 0.5 * m2 * u2 * u2;
  const v1 = ((m1 - m2) / (m1 + m2)) * u1 + ((2 * m2) / (m1 + m2)) * u2;
  const v2 = ((2 * m1) / (m1 + m2)) * u1 + ((m2 - m1) / (m1 + m2)) * u2;
  const p1 = m1 * v1 + m2 * v2;
  const k1 = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  return { v1, v2, p0, p1, k0, k1, pErr: Math.abs(p1 - p0) / (Math.abs(p0) + 1e-12), kErr: Math.abs(k1 - k0) / (Math.abs(k0) + 1e-12) };
}
export function dragAccel(vx: number, vy: number, mass: number, cd: number, rho: number, area: number, g: number) {
  const spd = Math.hypot(vx, vy);
  const F = 0.5 * rho * cd * area * spd * spd;
  const ax = spd > 1e-9 ? (-F * vx) / spd / mass : 0;
  const ay = -g + (spd > 1e-9 ? (-F * vy) / spd / mass : 0);
  return { ax, ay, spd };
}
export function doublePendulumDeriv(y: number[], p: { m1: number; m2: number; L1: number; L2: number; g: number }) {
  const [th1, w1, th2, w2] = y; const { m1, m2, L1, L2, g } = p; const d = th1 - th2;
  const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
  const a1 = (-g * (2 * m1 + m2) * Math.sin(th1) - m2 * g * Math.sin(th1 - 2 * th2) - 2 * Math.sin(d) * m2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) / (L1 * den);
  const a2 = (2 * Math.sin(d) * (w1 * w1 * L1 * (m1 + m2) + g * (m1 + m2) * Math.cos(th1) + w2 * w2 * L2 * m2 * Math.cos(d))) / (L2 * den);
  return [w1, a1, w2, a2];
}
export function doublePendulumEnergy(y: number[], p: { m1: number; m2: number; L1: number; L2: number; g: number }) {
  const [th1, w1, th2, w2] = y; const { m1, m2, L1, L2, g } = p;
  const x1 = L1 * Math.sin(th1), y1 = -L1 * Math.cos(th1);
  const x2 = x1 + L2 * Math.sin(th2), y2 = y1 - L2 * Math.cos(th2);
  const vx1 = L1 * w1 * Math.cos(th1), vy1 = L1 * w1 * Math.sin(th1);
  const vx2 = vx1 + L2 * w2 * Math.cos(th2), vy2 = vy1 + L2 * w2 * Math.sin(th2);
  const K = 0.5 * m1 * (vx1 * vx1 + vy1 * vy1) + 0.5 * m2 * (vx2 * vx2 + vy2 * vy2);
  const U = m1 * g * y1 + m2 * g * y2;
  return { K, U, E: K + U, x1, y1, x2, y2 };
}
export function nBodyAccel(bodies: { m: number; x: number; y: number; z?: number }[], G = 1) {
  return bodies.map((a, i) => {
    let ax = 0, ay = 0, az = 0;
    bodies.forEach((b, j) => {
      if (i === j) return;
      const dx = b.x - a.x, dy = b.y - a.y, dz = (b.z ?? 0) - (a.z ?? 0);
      const r2 = dx * dx + dy * dy + dz * dz + 1e-4; const r = Math.sqrt(r2); const f = (G * b.m) / (r2 * r);
      ax += f * dx; ay += f * dy; az += f * dz;
    });
    return { ax, ay, az };
  });
}
export function rollingEnergies(kind: "slide" | "sphere" | "cylinder", m: number, v: number, R: number) {
  const I = kind === "slide" ? 0 : kind === "sphere" ? 0.4 * m * R * R : 0.5 * m * R * R;
  const omega = kind === "slide" ? 0 : v / R;
  const Kt = 0.5 * m * v * v; const Kr = 0.5 * I * omega * omega;
  return { I, omega, Kt, Kr, E: Kt + Kr };
}
export function inclineAccel(kind: "slide" | "sphere" | "cylinder", g: number, angleDeg: number) {
  const th = (angleDeg * Math.PI) / 180;
  const k = kind === "slide" ? 1 : kind === "sphere" ? 5 / 7 : 2 / 3;
  return k * g * Math.sin(th);
}
export function classicalDoppler(f0: number, vs: number, vo: number, cSound: number) { return f0 * ((cSound + vo) / (cSound - vs)); }
export function relativisticDoppler(f0: number, beta: number) {
  const b = clamp(beta, -0.999, 0.999);
  return f0 * Math.sqrt((1 - b) / (1 + b));
}
export function pointField3(qx: number, qy: number, qz: number, q: number, x: number, y: number, z: number) {
  const dx = x - qx, dy = y - qy, dz = z - qz;
  const r2 = dx * dx + dy * dy + dz * dz + 1e-9; const r = Math.sqrt(r2); const s = (K_E * q) / (r2 * r);
  return { ex: s * dx, ey: s * dy, ez: s * dz, r, V: (K_E * q) / r };
}
export function wireB(I: number, x: number, y: number) {
  const r2 = x * x + y * y + 1e-9; const B = (2e-7 * I) / Math.sqrt(r2);
  return { Bx: (-B * y) / Math.sqrt(r2), By: (B * x) / Math.sqrt(r2), Bz: 0, mag: B };
}
export function maxwellBoltzmannPdf(v: number, T: number, mass = 0.028) {
  const a = mass / (2 * 8.314 * T);
  return Math.sqrt(2 / Math.PI) * Math.pow(2 * a, 1.5) * v * v * Math.exp(-a * v * v);
}
export function qhoEnergy(n: number, omega: number, hbar = 1) { return hbar * omega * (n + 0.5); }
export function qhoPsi(n: number, x: number, omega = 1, mass = 1, hbar = 1) {
  const xi = Math.sqrt((mass * omega) / hbar) * x;
  const hermite = [1, 2 * xi, 4 * xi * xi - 2, 8 * xi ** 3 - 12 * xi, 16 * xi ** 4 - 48 * xi * xi + 12];
  const H = hermite[Math.max(0, Math.min(4, Math.floor(n)))];
  const norm = Math.pow(mass * omega / (Math.PI * hbar), 0.25);
  return norm * H * Math.exp((-xi * xi) / 2) * (n === 0 ? 1 : 1 / Math.sqrt(2 ** n));
}
export function hydrogenMeta(orbital: string) {
  const table: Record<string, { n: number; l: number; m: number; label: string }> = {
    "1s": { n: 1, l: 0, m: 0, label: "1s" }, "2s": { n: 2, l: 0, m: 0, label: "2s" },
    "2p": { n: 2, l: 1, m: 0, label: "2p_z" }, "3s": { n: 3, l: 0, m: 0, label: "3s" },
    "3p": { n: 3, l: 1, m: 0, label: "3p_z" }, "3d": { n: 3, l: 2, m: 0, label: "3d_z2" },
  };
  return table[orbital] ?? table["1s"];
}
export function hydrogenDensity(orbital: string, x: number, y: number, z: number) {
  const r = Math.hypot(x, y, z) + 1e-6;
  if (orbital === "1s") return Math.exp(-2 * r);
  if (orbital === "2s") { const R = (2 - r) * Math.exp(-r / 2); return R * R; }
  if (orbital === "2p") { const R = r * Math.exp(-r / 2); const Y = z / r; return R * R * Y * Y; }
  if (orbital === "3s") { const R = (27 - 18 * r + 2 * r * r) * Math.exp(-r / 3); return R * R; }
  if (orbital === "3p") { const R = r * (6 - r) * Math.exp(-r / 3); const Y = z / r; return R * R * Y * Y; }
  const R = r * r * Math.exp(-r / 3); const Y = 3 * (z / r) * (z / r) - 1; return R * R * Y * Y;
}
export function scaleFactor(H0: number, t: number) { return Math.exp(H0 * t); }
export function gyroPrecession(spin: number, torque: number, I: number) { const L = I * spin; return L > 1e-9 ? torque / L : 0; }
export function sternGerlachProb(thetaDeg: number) { const th = (thetaDeg * Math.PI) / 180; const up = Math.cos(th / 2) ** 2; return { up, down: 1 - up }; }
export function waveDispersion(lambda: number, v: number) { const f = v / lambda; return { f, k: (2 * Math.PI) / lambda, omega: 2 * Math.PI * f }; }
export function snell(n1: number, n2: number, theta1: number) {
  const s = (n1 / n2) * Math.sin(theta1);
  if (Math.abs(s) > 1) return { tir: true, theta2: Math.PI / 2 };
  return { tir: false, theta2: Math.asin(s) };
}
export { C };
