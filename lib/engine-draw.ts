import type { SimState } from "./sim-state";
import { lengthContracted, lorentzGamma, projectileAnalytical, squareWellPsi, twoSlitIntensity, clamp } from "./physics";
export function draw(ctx: CanvasRenderingContext2D, w: number, h: number, slug: string, s: SimState) {
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#07090f"; ctx.fillRect(0, 0, w, h);
  const p = s.params;
  ctx.fillStyle = "#9aa4b8"; ctx.font = "12px ui-monospace, monospace";
  if (slug === "newtons-second-law") {
    const x = 80 + (((s.data.x ?? 0) * 18 + 400) % (w - 140));
    ctx.fillStyle = "#6ee7ff"; ctx.fillRect(x, h / 2 - 22, 56, 44);
  } else if (slug === "projectile-motion") {
    const sx = 48, sy = h - 40;
    const scale = Math.min((w - 80) / Math.max(20, (s.data.predRange ?? 40) * 1.2), (h - 80) / Math.max(8, (s.data.predH ?? 10) * 1.4));
    ctx.strokeStyle = "#3d4f6f"; ctx.beginPath(); ctx.moveTo(sx, sy);
    for (let t = 0; t < (s.data.predT ?? 2); t += 0.03) { const a = projectileAnalytical(t, p.v0, (p.angle * Math.PI) / 180, p.g); ctx.lineTo(sx + a.x * scale, sy - a.y * scale); }
    ctx.stroke(); ctx.strokeStyle = "#6ee7ff"; ctx.beginPath();
    s.trail.forEach((pt, i) => { const X = sx + pt.x * scale, Y = sy - pt.y * scale; if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y); });
    ctx.stroke(); ctx.fillStyle = "#ffb86b"; ctx.beginPath(); ctx.arc(sx + (s.data.x ?? 0) * scale, sy - (s.data.y ?? 0) * scale, 6, 0, 6.28); ctx.fill();
  } else if (slug === "pendulum") {
    const Lpx = Math.min(h * 0.42, 220), th = s.data.theta ?? 0;
    ctx.strokeStyle = "#9aa4b8"; ctx.beginPath(); ctx.moveTo(w / 2, 48); ctx.lineTo(w / 2 + Lpx * Math.sin(th), 48 + Lpx * Math.cos(th)); ctx.stroke();
    ctx.fillStyle = "#6ee7ff"; ctx.beginPath(); ctx.arc(w / 2 + Lpx * Math.sin(th), 48 + Lpx * Math.cos(th), 14, 0, 6.28); ctx.fill();
  } else if (slug === "orbital-motion") {
    const cx = w / 2, cy = h / 2, sc = Math.min(w, h) * 0.28;
    ctx.fillStyle = "#ffb86b"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#6ee7ff88"; ctx.beginPath(); s.trail.forEach((pt, i) => { if (i === 0) ctx.moveTo(cx + pt.x * sc, cy + pt.y * sc); else ctx.lineTo(cx + pt.x * sc, cy + pt.y * sc); }); ctx.stroke();
  } else if (slug === "wave-interference") {
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath();
    for (let i = 0; i < w; i++) { const x = (i / w) * 8; const y = p.A1 * Math.sin(2 * Math.PI * p.f1 * (x - s.t)) + p.A2 * Math.sin(2 * Math.PI * p.f2 * (x - s.t) + (p.phase * Math.PI) / 180); if (i === 0) ctx.moveTo(i, h / 2 - y * 36); else ctx.lineTo(i, h / 2 - y * 36); }
    ctx.stroke();
  } else if (slug === "standing-waves") {
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath();
    const k = (p.n * Math.PI) / (w - 80); const om = 2 * Math.PI * ((p.n * p.v) / (2 * p.L));
    for (let i = 0; i <= w - 80; i++) { const y = 2 * p.A * 80 * Math.sin(k * i) * Math.cos(om * s.t); if (i === 0) ctx.moveTo(40 + i, h / 2 - y * 0.4); else ctx.lineTo(40 + i, h / 2 - y * 0.4); }
    ctx.stroke();
  } else if (slug === "double-slit") {
    ctx.fillStyle = "#6ee7ff";
    for (let i = 0; i < w; i++) { const x = ((i - w / 2) / w) * 0.012; const I = twoSlitIntensity(x, p.lambda * 1e-9, p.d * 1e-6, p.L, p.a * 1e-6); ctx.fillRect(i, h - 24 - I * (h - 50), 1, I * (h - 50)); }
  } else if (slug === "lens") {
    const cx = w * 0.55, scale = 4, objX = cx - p.s * scale, imgX = cx + (s.data.sprime ?? 0) * scale, M = s.data.M ?? -1;
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath(); ctx.ellipse(cx, h / 2, 10, h * 0.32, 0, 0, 6.28); ctx.stroke();
    ctx.fillStyle = "#ffb86b"; ctx.fillRect(objX, h / 2 - 40, 6, 40);
    ctx.fillStyle = "#6ee7ff"; ctx.fillRect(imgX, h / 2, 6, -40 * M);
  } else if (slug === "electric-field") {
    const x1 = w / 2 - p.sep * 4, x2 = w / 2 + p.sep * 4;
    ctx.fillStyle = p.q1 >= 0 ? "#ffb86b" : "#6ee7ff"; ctx.beginPath(); ctx.arc(x1, h / 2, 12, 0, 6.28); ctx.fill();
    ctx.fillStyle = p.q2 >= 0 ? "#ffb86b" : "#6ee7ff"; ctx.beginPath(); ctx.arc(x2, h / 2, 12, 0, 6.28); ctx.fill();
  } else if (slug === "magnetic-field") {
    const cx = w / 2, cy = h / 2, rx = Math.min(w, h) * 0.22;
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath(); ctx.ellipse(cx, cy, rx, rx * 0.6, 0, 0, 6.28); ctx.stroke();
    ctx.fillStyle = "#ffb86b"; ctx.beginPath(); ctx.arc(cx + rx * (s.data.px ?? 1), cy + rx * 0.6 * (s.data.py ?? 0), 7, 0, 6.28); ctx.fill();
  } else if (slug === "simple-circuit") {
    const frac = clamp((s.data.Vc ?? 0) / (p.V || 1), 0, 1);
    ctx.fillStyle = "#6ee7ff"; ctx.fillRect(w * 0.55, h * 0.65 - frac * h * 0.28, 28, frac * h * 0.28);
  } else if (slug === "ideal-gas" || slug === "entropy") {
    ctx.strokeStyle = "#3d4f6f"; ctx.strokeRect(20, 16, w - 40, h - 32);
    if (slug === "entropy" && p.open < 0.5) { ctx.beginPath(); ctx.moveTo(w / 2, 16); ctx.lineTo(w / 2, h - 16); ctx.stroke(); }
    for (const part of s.particles) { ctx.fillStyle = part.extra ? "#ffb86b" : "#6ee7ff"; ctx.beginPath(); ctx.arc(20 + part.x * (w - 40), 16 + part.y * (h - 32), 4, 0, 6.28); ctx.fill(); }
  } else if (slug === "time-dilation") {
    ctx.fillText(`γ = ${lorentzGamma(p.beta).toFixed(3)}  (moving clock ticks slower in the lab)`, 24, 28);
  } else if (slug === "length-contraction") {
    const L = lengthContracted(p.L0, p.beta); const scale = (w - 80) / Math.max(p.L0, 1);
    ctx.fillStyle = "#3d4f6f"; ctx.fillRect(40, h / 2 - 50, p.L0 * scale, 22);
    ctx.fillStyle = "#6ee7ff"; ctx.fillRect(40, h / 2 + 10, L * scale, 22);
  } else if (slug === "spacetime-diagram") {
    const cx = 70, cy = h - 40, sc = Math.min(w, h) * 0.55, b = p.beta;
    ctx.strokeStyle = "#ffb86b"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sc, cy - sc); ctx.stroke();
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + sc * b, cy - sc); ctx.stroke();
    ctx.fillText("amber = light cone", 90, 28);
  } else if (slug === "quantum-double-slit") {
    ctx.fillStyle = "#6ee7ff"; for (const pt of s.particles) ctx.fillRect(w / 2 + pt.x * w * 80, 20 + pt.y * (h - 40), 2, 2);
    ctx.fillStyle = "#9aa4b8"; ctx.fillText("Detections from |ψ|² — no classical path is drawn.", 16, h - 10);
  } else if (slug === "quantum-tunneling") {
    ctx.fillStyle = "#1c2436"; ctx.fillRect(w * 0.38, 40, w * 0.24, h - 80);
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath();
    for (let i = 0; i < w; i++) { const xn = i / w; const amp = xn < 0.38 ? Math.sin(xn * 40) : xn < 0.62 ? Math.exp(-(xn - 0.38) * 8) : Math.sin(xn * 40) * Math.sqrt(s.data.T ?? 0.01); if (i === 0) ctx.moveTo(i, h / 2 - amp * 40); else ctx.lineTo(i, h / 2 - amp * 40); }
    ctx.stroke();
  } else if (slug === "particle-in-a-box") {
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath();
    for (let i = 0; i <= w - 80; i++) { const x = (i / (w - 80)) * p.L; const psi = squareWellPsi(p.n, x, p.L); if (i === 0) ctx.moveTo(40 + i, h / 2 - psi * 50); else ctx.lineTo(40 + i, h / 2 - psi * 50); }
    ctx.stroke();
  } else if (slug === "solar-system") {
    const cx = w / 2, cy = h / 2; ctx.fillStyle = "#ffb86b"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, 6.28); ctx.fill();
    ([[0.39, 88, "#b0b0b0"], [0.72, 225, "#e6c07b"], [1, 365, "#6ee7ff"], [1.52, 687, "#ff8866"]] as [number, number, string][]).forEach((pl) => {
      const R = 28 + pl[0] * 70; const ang = (s.t * 40 * p.speed) / pl[1];
      ctx.strokeStyle = "#1c2436"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.28); ctx.stroke();
      ctx.fillStyle = pl[2]; ctx.beginPath(); ctx.arc(cx + R * Math.cos(ang), cy + R * Math.sin(ang), 4, 0, 6.28); ctx.fill();
    });
    ctx.fillStyle = "#9aa4b8"; ctx.fillText("Educational visualization: distances compressed. Period ratios follow Kepler III.", 16, h - 12);
  } else if (slug === "black-hole") {
    const cx = w / 2, cy = h / 2, rs = 36;
    ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(cx, cy, rs, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#6ee7ff"; ctx.beginPath(); ctx.arc(cx, cy, rs, 0, 6.28); ctx.stroke();
    ctx.strokeStyle = "#ffb86b88"; ctx.beginPath(); ctx.arc(cx, cy, rs * 1.5, 0, 6.28); ctx.stroke();
    ctx.fillStyle = "#9aa4b8"; ctx.fillText("Educational visualization — not a rubber sheet, not a full GR tracer.", 12, h - 12);
  } else if (slug === "conservation-of-energy") {
    ctx.fillStyle = "#6ee7ff"; ctx.beginPath(); ctx.arc(40 + ((s.data.s ?? 0) / 3.2) * (w - 80), h - 40 - (s.data.h ?? 0) * 20, 8, 0, 6.28); ctx.fill();
  }
}
