import type { Concept } from "./concepts";
import {
  clamp, fringeSpacing, gravitationalTimeDilation, idealGasP, lengthContracted,
  lorentzGamma, pendulumAcc, pendulumPeriodSmall, projectileRange, rk4, schwarzschildRadius, squareWellEnergy,
  tunnelTransmission, twoSlitIntensity,
} from "./physics";

export type { SimState } from "./sim-state";
import type { SimState } from "./sim-state";

export function defaultState(concept: Concept): SimState {
  const params: Record<string, number> = {};
  for (const p of concept.parameters) params[p.key] = p.default;
  return { t: 0, playing: true, speed: 1, params, data: {}, trail: [], particles: [], hist: [] };
}

export function reset(concept: Concept, prev?: SimState): SimState {
  const s = defaultState(concept);
  if (prev) s.params = { ...s.params, ...prev.params };
  s.data = {};
  if (concept.slug === "ideal-gas" || concept.slug === "entropy") {
    const N = concept.slug === "entropy" ? s.params.N : s.params.Nshow;
    for (let i = 0; i < N; i++) {
      const ang = Math.random() * Math.PI * 2;
      s.particles.push({ x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.6, vx: Math.cos(ang) * 50, vy: Math.sin(ang) * 50, extra: i < N / 2 ? 0 : 1 });
    }
  }
  if (concept.slug === "newtons-second-law") { s.data.x = 0; s.data.v = 0; }
  if (concept.slug === "pendulum") { s.data.theta = ((s.params.theta0 ?? 40) * Math.PI) / 180; s.data.omega = 0; }
  if (concept.slug === "conservation-of-energy") { s.data.s = 0; s.data.v = 0; }
  if (concept.slug === "simple-circuit") { s.data.Vc = 0; s.data.charging = 1; }
  if (concept.slug === "projectile-motion") { s.data.alive = 0; }
  return s;
}

function hist(s: SimState, y: number, y2?: number) {
  s.hist.push({ t: s.t, y, y2 });
  if (s.hist.length > 240) s.hist.splice(0, s.hist.length - 240);
}

export function step(slug: string, s: SimState, dtRaw: number) {
  const dt = clamp(dtRaw * s.speed, 0, 0.05);
  if (!s.playing) return s;
  s.t += dt;
  const p = s.params;
  switch (slug) {
    case "newtons-second-law": {
      const fr = p.mu * p.mass * 9.81 * Math.sign(s.data.v || p.force);
      let Fnet = p.force - (p.mu > 0 ? fr : 0);
      if (p.mu > 0 && Math.abs(s.data.v) < 1e-3 && Math.abs(p.force) < p.mu * p.mass * 9.81) { Fnet = 0; s.data.v = 0; }
      s.data.a = Fnet / p.mass; s.data.v += s.data.a * dt; s.data.x += s.data.v * dt; hist(s, s.data.v, s.data.a); break;
    }
    case "projectile-motion": {
      if (!s.data.alive) {
        const th = (p.angle * Math.PI) / 180;
        s.data.x = 0; s.data.y = 0; s.data.vx = p.v0 * Math.cos(th); s.data.vy = p.v0 * Math.sin(th); s.data.alive = 1; s.trail = [];
      }
      if (s.data.alive) {
        const spd = Math.hypot(s.data.vx, s.data.vy);
        s.data.vx += ((-p.drag * spd * s.data.vx) / p.mass) * dt;
        s.data.vy += (-p.g + (-p.drag * spd * s.data.vy) / p.mass) * dt;
        s.data.x += s.data.vx * dt; s.data.y += s.data.vy * dt;
        s.trail.push({ x: s.data.x, y: s.data.y }); if (s.trail.length > 400) s.trail.shift();
        s.data.hmax = Math.max(s.data.hmax ?? 0, s.data.y);
        const pred = projectileRange(p.v0, (p.angle * Math.PI) / 180, p.g);
        s.data.predRange = pred.range; s.data.predH = pred.hmax; s.data.predT = pred.t;
        if (s.data.y < 0 && s.t > 0.05) { s.data.y = 0; s.data.alive = 0; s.data.range = s.data.x; }
      }
      break;
    }
    case "conservation-of-energy": {
      const trackH = (u: number) => p.h0 * Math.exp(-((u - 0.2) ** 2) / 0.35) + 0.6 * Math.exp(-((u - 2.2) ** 2) / 0.2);
      const slope = (trackH((s.data.s ?? 0) + 1e-3) - trackH((s.data.s ?? 0) - 1e-3)) / 2e-3;
      const th = Math.atan(slope);
      s.data.v = (s.data.v ?? 0) + (-p.g * Math.sin(th) - p.mu * p.g * Math.cos(th) * Math.sign(s.data.v || 1)) * dt;
      s.data.s = Math.max(0, (s.data.s ?? 0) + s.data.v * dt);
      s.data.h = trackH(s.data.s); s.data.K = 0.5 * p.mass * s.data.v * s.data.v; s.data.U = p.mass * p.g * s.data.h; s.data.E = s.data.K + s.data.U;
      break;
    }
    case "pendulum": {
      const y = [s.data.theta, s.data.omega];
      const nxt = rk4(y, dt, (yy) => [yy[1], pendulumAcc(yy[0], p.g, p.L, p.damp, yy[1])]);
      s.data.theta = nxt[0]; s.data.omega = nxt[1]; s.data.Tsmall = pendulumPeriodSmall(p.L, p.g);
      s.data.E = 0.5 * p.L * p.L * s.data.omega * s.data.omega + p.g * p.L * (1 - Math.cos(s.data.theta));
      break;
    }
    case "orbital-motion": {
      const GM = 6.6743e-11 * p.M * 1.989e30; const AU = 1.496e11;
      if (s.data.vx === undefined) { s.data.x = AU; s.data.y = 0; s.data.vx = 0; s.data.vy = p.speed * Math.sqrt(GM / AU); }
      const r = Math.hypot(s.data.x, s.data.y); const a = GM / (r * r);
      s.data.vx += ((-a * s.data.x) / r) * dt * 2e5; s.data.vy += ((-a * s.data.y) / r) * dt * 2e5;
      s.data.x += s.data.vx * dt * 2e5; s.data.y += s.data.vy * dt * 2e5;
      s.data.rAU = Math.hypot(s.data.x, s.data.y) / AU; s.data.v = Math.hypot(s.data.vx, s.data.vy);
      s.trail.push({ x: s.data.x / AU, y: s.data.y / AU }); if (s.trail.length > 500) s.trail.shift();
      break;
    }
    case "wave-interference": s.data.beat = Math.abs(p.f1 - p.f2); break;
    case "standing-waves": s.data.lambda = (2 * p.L) / p.n; s.data.freq = (p.n * p.v) / (2 * p.L); break;
    case "double-slit": s.data.fringe = fringeSpacing(p.lambda * 1e-9, p.d * 1e-6, p.L); break;
    case "lens": s.data.sprime = 1 / (1 / p.f - 1 / p.s); s.data.M = -s.data.sprime / p.s; break;
    case "electric-field": {
      const k = 8.9875517923e9, q1 = p.q1 * 1e-9, q2 = p.q2 * 1e-9, r = (p.sep * 0.01) / 2;
      s.data.Emid = k * q1 / (r * r) - k * q2 / (r * r); break;
    }
    case "magnetic-field": {
      const q = p.q * 1.602e-19, B = p.B * 1e-3, m = p.mass * 1.661e-27, v = p.v * 1000;
      s.data.r_cyc = (m * v) / (Math.abs(q) * B); s.data.omega = (Math.abs(q) * B) / m;
      const w = s.data.omega * Math.sign(q); s.data.px = Math.cos(w * s.t); s.data.py = Math.sin(w * s.t); break;
    }
    case "simple-circuit": {
      const tau = p.R * 1000 * p.C * 1e-6; s.data.tau = tau;
      s.data.Vc = (s.data.charging ?? 1) === 1 ? p.V * (1 - Math.exp(-s.t / tau)) : (s.data.Vstart ?? p.V) * Math.exp(-s.t / tau);
      break;
    }
    case "ideal-gas": {
      s.data.P = idealGasP(p.n, p.T, p.V * 0.001); s.data.vrms = Math.sqrt((3 * 8.314 * p.T) / 0.028);
      const sc = Math.sqrt(p.T / 300);
      for (const part of s.particles) {
        part.x += part.vx * dt * 0.01 * sc; part.y += part.vy * dt * 0.01 * sc;
        if (part.x < 0.04 || part.x > 0.96) part.vx *= -1; if (part.y < 0.08 || part.y > 0.92) part.vy *= -1;
        part.x = clamp(part.x, 0.04, 0.96); part.y = clamp(part.y, 0.08, 0.92);
      }
      break;
    }
    case "entropy": {
      const open = p.open >= 0.5;
      for (const part of s.particles) {
        part.x += part.vx * dt * 0.012; part.y += part.vy * dt * 0.012;
        if (!open && ((part.extra === 0 && part.x > 0.48) || (part.extra === 1 && part.x < 0.52))) part.vx *= -1;
        if (part.x < 0.04 || part.x > 0.96) part.vx *= -1; if (part.y < 0.08 || part.y > 0.92) part.vy *= -1;
        part.x = clamp(part.x, 0.04, 0.96); part.y = clamp(part.y, 0.08, 0.92);
      }
      s.data.left = s.particles.filter((q) => q.x < 0.5).length; break;
    }
    case "time-dilation": s.data.gamma = lorentzGamma(p.beta); s.data.tProper = s.t; s.data.tLab = s.t * s.data.gamma; break;
    case "length-contraction": s.data.gamma = lorentzGamma(p.beta); s.data.L = lengthContracted(p.L0, p.beta); break;
    case "spacetime-diagram": s.data.gamma = lorentzGamma(Math.abs(p.beta)); break;
    case "quantum-double-slit": {
      if (s.particles.length < 500 && Math.random() < 0.35) {
        const x = (Math.random() - 0.5) * 0.02;
        let w = twoSlitIntensity(x, p.lambda * 1e-9, p.d * 1e-6, 1.2, 2e-5);
        if (p.which > 0) w = (1 - p.which) * w + p.which * twoSlitIntensity(x, p.lambda * 1e-9, 1e-9, 1.2, 4e-5);
        if (Math.random() < w) s.particles.push({ x, y: Math.random(), vx: 0, vy: 0 });
      }
      s.data.counts = s.particles.length; break;
    }
    case "quantum-tunneling": s.data.T = clamp(tunnelTransmission(p.E, p.V, p.L, 1, 1), 0, 1); s.data.R = 1 - s.data.T; break;
    case "particle-in-a-box": s.data.E = squareWellEnergy(p.n, p.L, 1, 1); break;
    case "solar-system": s.data.day = s.t * 40 * p.speed; break;
    case "black-hole": {
      const Mkg = p.M * 1.989e30; s.data.rs = schwarzschildRadius(Mkg); s.data.rph = 1.5 * s.data.rs;
      s.data.dtfactor = gravitationalTimeDilation(3 * s.data.rs, Mkg); break;
    }
  }
  return s;
}

export function measureText(slug: string, s: SimState) {
  const d = s.data;
  const fmt = (n: number, digits = 3) => !Number.isFinite(n) ? "—" : Math.abs(n) >= 1e4 || (Math.abs(n) > 0 && Math.abs(n) < 1e-3) ? n.toExponential(3) : n.toFixed(digits);
  const rows: Record<string, { k: string; v: string }[]> = {
    "newtons-second-law": [{ k: "a", v: `${fmt(d.a)} m/s²` }, { k: "v", v: `${fmt(d.v)} m/s` }, { k: "x", v: `${fmt(d.x)} m` }],
    "projectile-motion": [{ k: "range", v: `${fmt(d.range ?? d.x)} m` }, { k: "h max", v: `${fmt(d.hmax ?? 0)} m` }, { k: "analytic range", v: `${fmt(d.predRange ?? 0)} m` }],
    "conservation-of-energy": [{ k: "K", v: `${fmt(d.K)} J` }, { k: "U", v: `${fmt(d.U)} J` }, { k: "E", v: `${fmt(d.E)} J` }],
    "pendulum": [{ k: "theta", v: `${fmt(((d.theta ?? 0) * 180) / Math.PI)} deg` }, { k: "T small-angle", v: `${fmt(d.Tsmall)} s` }],
    "orbital-motion": [{ k: "r", v: `${fmt(d.rAU)} AU` }, { k: "v", v: `${fmt(d.v)} m/s` }],
    "wave-interference": [{ k: "beat frequency", v: `${fmt(d.beat)} Hz` }],
    "standing-waves": [{ k: "lambda", v: `${fmt(d.lambda)} m` }, { k: "f", v: `${fmt(d.freq)} Hz` }],
    "double-slit": [{ k: "fringe spacing", v: `${fmt(d.fringe)} m` }],
    "lens": [{ k: "s prime", v: `${fmt(d.sprime)} cm` }, { k: "M", v: fmt(d.M) }],
    "electric-field": [{ k: "E mid", v: `${fmt(d.Emid)} N/C` }],
    "magnetic-field": [{ k: "r cyclotron", v: `${fmt(d.r_cyc)} m` }, { k: "omega", v: `${fmt(d.omega)} rad/s` }],
    "simple-circuit": [{ k: "tau", v: `${fmt(d.tau)} s` }, { k: "Vc", v: `${fmt(d.Vc)} V` }],
    "ideal-gas": [{ k: "P", v: `${fmt(d.P)} Pa` }, { k: "v_rms", v: `${fmt(d.vrms)} m/s` }],
    "entropy": [{ k: "N left", v: `${d.left ?? 0}` }],
    "time-dilation": [{ k: "gamma", v: fmt(d.gamma, 4) }, { k: "t lab", v: `${fmt(d.tLab)} s` }],
    "length-contraction": [{ k: "gamma", v: fmt(d.gamma, 4) }, { k: "L", v: `${fmt(d.L)} m` }],
    "spacetime-diagram": [{ k: "gamma", v: fmt(d.gamma, 4) }],
    "quantum-double-slit": [{ k: "detections", v: `${d.counts ?? 0}` }],
    "quantum-tunneling": [{ k: "T", v: fmt(d.T, 5) }, { k: "R", v: fmt(d.R, 5) }],
    "particle-in-a-box": [{ k: "E (hbar=m=1)", v: fmt(d.E) }],
    "solar-system": [{ k: "time", v: `${fmt((d.day ?? 0) / 365, 2)} yr` }],
    "black-hole": [{ k: "r_s", v: `${fmt((d.rs ?? 0) / 1000)} km` }, { k: "photon sphere", v: `${fmt((d.rph ?? 0) / 1000)} km` }],
  };
  return rows[slug] ?? [];
}

export { draw } from "./engine-draw";

export function analyticalCheckProjectile(v0: number, angleDeg: number, g: number) {
  const th = (angleDeg * Math.PI) / 180;
  const pred = projectileRange(v0, th, g);
  let x = 0, y = 0, vx = v0 * Math.cos(th), vy = v0 * Math.sin(th);
  const dt = 0.0005;
  let t = 0;
  while (y >= 0 && t < 50) {
    vy -= g * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    if (y < 0) break;
  }
  return { pred, num: { range: x, t }, ok: Math.abs(x - pred.range) / pred.range < 0.02 };
}
