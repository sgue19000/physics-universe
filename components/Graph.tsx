"use client";
import { useEffect, useRef } from "react";

export function Graph({ points, label, unit }: { points: { t: number; y: number; y2?: number }[]; label: string; unit?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const w = cvs.clientWidth || 280;
    const h = 96;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cvs.width = Math.floor(w * dpr);
    cvs.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#07090f";
    ctx.fillRect(0, 0, w, h);
    if (points.length < 2) {
      ctx.fillStyle = "#9aa4b8";
      ctx.font = "11px ui-sans-serif";
      ctx.fillText("Run the lab to record this series.", 8, 20);
      return;
    }
    const ys = points.flatMap((p) => [p.y, p.y2]).filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    const ymin = Math.min(...ys, 0);
    const ymax = Math.max(...ys, 1e-6);
    const t0 = points[0].t;
    const t1 = points[points.length - 1].t || t0 + 1;
    const X = (t: number) => 8 + ((t - t0) / (t1 - t0 || 1)) * (w - 16);
    const Y = (y: number) => h - 14 - ((y - ymin) / (ymax - ymin || 1)) * (h - 28);
    ctx.strokeStyle = "#223044";
    ctx.beginPath(); ctx.moveTo(8, Y(0)); ctx.lineTo(w - 8, Y(0)); ctx.stroke();
    ctx.strokeStyle = "#6ee7ff";
    ctx.beginPath();
    points.forEach((p, i) => { const x = X(p.t), y = Y(p.y); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
    if (points.some((p) => p.y2 != null)) {
      ctx.strokeStyle = "#ffb86b";
      ctx.beginPath();
      points.forEach((p, i) => { if (p.y2 == null) return; const x = X(p.t), y = Y(p.y2); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
    }
    ctx.fillStyle = "#9aa4b8";
    ctx.font = "11px ui-sans-serif";
    ctx.fillText(`${label}${unit ? " (" + unit + ")" : ""}`, 8, 12);
  }, [points, label, unit]);
  return <canvas ref={ref} className="h-24 w-full" role="img" aria-label={label} />;
}
