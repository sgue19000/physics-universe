"use client";

import { useEffect, useRef, useState } from "react";
import type { Concept } from "@/lib/concepts";
import { CONCEPTS } from "@/lib/concepts";
import { draw, measureText, reset, step, type SimState } from "@/lib/engine";
import Link from "next/link";
import { audioEnabled, audioVolume, setAudioEnabled, setAudioVolume, unlockAudio, setTone, impact, stopTone } from "@/lib/audio";
import { bindOrbit, defaultCam } from "@/lib/camera3d";
import { advance } from "@/lib/advance";
import { Graph } from "@/components/Graph";

export function Lab({ concept }: { concept: Concept }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<SimState>(reset(concept));
  const [, setTick] = useState(0);
  const [mode, setMode] = useState<"explore" | "learn" | "experiment" | "challenge">("explore");
  const [level, setLevel] = useState(concept.difficulty);
  const [hyp, setHyp] = useState(false);
  const [pred, setPred] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);

  useEffect(() => {
    stopTone();
    stateRef.current = reset(concept);
    const mobile = typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);
    if (stateRef.current.params.quality == null) stateRef.current.params.quality = mobile ? 0 : 1;
    setTick((n) => n + 1);
    return () => stopTone();
  }, [concept.slug]);

  useEffect(() => {
    const onVis = () => { if (document.hidden) { stateRef.current.playing = false; stopTone(); } };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || concept.dimension !== "3D") return;
    if (!stateRef.current.data.cam) stateRef.current.data.cam = defaultCam(7);
    return bindOrbit(cvs, stateRef.current.data.cam, () => setTick((n) => n + 1));
  }, [concept.slug, concept.dimension]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const s = stateRef.current;
      if (s.playing && !document.hidden) step(concept.slug, s, dt);
      if (concept.slug === "projectile-motion" && s.playing) {
        const vy = s.data.vy ?? 0;
        s.data.speed = Math.hypot(s.data.vx ?? 0, vy);
        s.data.K = 0.5 * (s.params.mass ?? 1) * s.data.speed * s.data.speed;
        s.data.U = (s.params.mass ?? 1) * (s.params.g ?? 9.81) * Math.max(0, s.data.y ?? 0);
        s.hist.push({ t: s.t, y: s.data.y ?? 0, y2: vy });
        if (s.hist.length > 240) s.hist.splice(0, s.hist.length - 240);
      }
      if (audioEnabled() && !document.hidden) {
        if (concept.slug === "doppler-effect" || concept.slug === "relativistic-doppler") void setTone(s.data.fobs ?? 440, 0.12);
        else if (concept.slug === "wave-surface") void setTone(220 + (s.data.f ?? 1) * 40, 0.08);
        else if (concept.slug === "double-pendulum") void setTone(180 + Math.abs(s.data.y?.[1] ?? 0) * 20, 0.05);
        if (concept.slug === "elastic-collision" && s.data.hit === 1 && !s.data.pinged) { s.data.pinged = 1; void impact(8); }
      }
      const cvs = canvasRef.current;
      if (cvs) {
        const ctx = cvs.getContext("2d");
        if (ctx) {
          const dpr = Math.min(2, window.devicePixelRatio || 1);
          const w = cvs.clientWidth;
          const h = cvs.clientHeight;
          if (cvs.width !== Math.floor(w * dpr) || cvs.height !== Math.floor(h * dpr)) {
            cvs.width = Math.floor(w * dpr);
            cvs.height = Math.floor(h * dpr);
          }
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          draw(ctx, w, h, concept.slug, s);
        }
      }
      if (now - (s.data._ui ?? 0) > 160) { s.data._ui = now; setTick((n) => n + 1); }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); stopTone(); };
  }, [concept.slug]);

  const s = stateRef.current;
  const measures = measureText(concept.slug, s);
  if (concept.slug === "projectile-motion") {
    const fmt = (n: number) => !Number.isFinite(n) ? "—" : n.toFixed(2);
    measures.unshift(
      { k: "x", v: `${fmt(s.data.x ?? 0)} m` },
      { k: "y", v: `${fmt(s.data.y ?? 0)} m` },
      { k: "v", v: `${fmt(s.data.speed ?? 0)} m/s` },
      { k: "K", v: `${fmt(s.data.K ?? 0)} J` },
      { k: "U", v: `${fmt(s.data.U ?? 0)} J` },
    );
  }
  const setP = (key: string, value: number) => {
    s.params[key] = value;
    if (key === "open" || key === "N" || key === "Nshow" || key === "orb" || key === "th1" || key === "th2") {
      const keep = { ...s.params };
      stateRef.current = reset(concept);
      stateRef.current.params = keep;
    }
    setTick((n) => n + 1);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_minmax(0,1fr)_300px]">
      <aside className="hidden lg:block">
        <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">Concepts</p>
        <ul className="space-y-1 text-sm">
          {CONCEPTS.filter((c) => c.category === concept.category).map((c) => (
            <li key={c.slug}>
              <Link href={`/physics/${c.category}/${c.slug}`} className={c.slug === concept.slug ? "text-accent" : "text-zinc-400 hover:text-zinc-200"}>{c.title}</Link>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">{concept.category} · {level} · {concept.dimension ?? "2D"}</p>
            <h1 className="text-2xl font-semibold">{concept.title}</h1>
            <p className="text-sm text-zinc-400">{concept.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(["explore", "learn", "experiment", "challenge"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setRevealed(false); setPred(null); }} className={`min-h-11 rounded border px-2 ${mode === m ? "border-accent text-accent" : "border-line text-zinc-400"}`}>{m}</button>
            ))}
          </div>
        </div>
        <div ref={wrapRef} className="overflow-hidden rounded-lg border border-line bg-ink">
          <canvas ref={canvasRef} className="h-[42vh] min-h-[240px] w-full touch-none overscroll-none md:h-[420px]" role="img" aria-label={`${concept.title} simulation canvas`} />
        </div>
        {concept.dimension === "3D" && <p className="mt-1 text-xs text-zinc-500">3D lab — drag to orbit · wheel/pinch zoom · Reset camera</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="min-h-11 rounded border border-line px-3" onClick={() => { s.playing = !s.playing; if (!s.playing) stopTone(); setTick((n) => n + 1); }}>{s.playing ? "Pause" : "Play"}</button>
          <button className="min-h-11 rounded border border-line px-3" onClick={() => { advance(concept.slug, s, 0.02); setTick((n) => n + 1); }}>Step</button>
          <button className="min-h-11 rounded border border-line px-3" onClick={() => { const cam = s.data.cam; stateRef.current = reset(concept, s); if (cam) stateRef.current.data.cam = cam; setTick((n) => n + 1); }}>Reset</button>
          <label className="flex min-h-11 items-center gap-2 text-zinc-400">speed <input aria-label="Simulation speed" type="range" min={0.25} max={4} step={0.25} value={s.speed} onChange={(e) => { s.speed = Number(e.target.value); setTick((n) => n + 1); }} /> {s.speed}×</label>
          <button className="min-h-11 rounded border border-line px-3" onClick={() => { const el = wrapRef.current; if (!el) return; if (document.fullscreenElement) void document.exitFullscreen(); else void el.requestFullscreen(); }}>Fullscreen</button>
          <label className="flex min-h-11 items-center gap-2 text-zinc-400"><input type="checkbox" checked={hyp} onChange={(e) => setHyp(e.target.checked)} /> What if?</label>
          <label className="flex min-h-11 items-center gap-2 text-zinc-400"><input aria-label="Enable educational sonification" type="checkbox" checked={audioEnabled()} onChange={async (e) => { setAudioEnabled(e.target.checked); if (e.target.checked) await unlockAudio(); else stopTone(); setTick((n) => n + 1); }} /> Sound</label>
          <label className="flex min-h-11 items-center gap-2 text-zinc-400">Volume <input aria-label="Sonification volume" type="range" min={0} max={1} step={0.05} value={audioVolume()} onChange={(e) => { setAudioVolume(Number(e.target.value)); setTick((n) => n + 1); }} /></label>
          {concept.dimension === "3D" && <button className="min-h-11 rounded border border-line px-3" onClick={() => { const cam = s.data.cam ?? defaultCam(7); Object.assign(cam, defaultCam(7)); s.data.cam = cam; setTick((n) => n + 1); }}>Reset camera</button>}
        </div>
        {hyp && <p className="mt-2 rounded border border-warm/40 bg-warm/10 px-3 py-2 text-sm text-warm">{concept.hypotheticalNote ?? "Hypothetical scenario — not our physical universe."}</p>}
        <div className="mt-3 grid grid-cols-3 gap-2 lg:hidden">
          {(["controls", "data", "learn"] as const).map((k) => (
            <button key={k} className="min-h-11 rounded border border-line text-sm capitalize" onClick={() => setSheet(sheet === k ? null : k)}>{k}</button>
          ))}
        </div>
        {sheet === "data" && <div className="lg:hidden"><ul className="font-mono text-sm">{measures.map((m) => <li key={m.k} className="flex justify-between"><span className="text-zinc-400">{m.k}</span><span>{m.v}</span></li>)}</ul>{s.hist.length > 1 && <Graph points={s.hist} label="recorded series" />}</div>}
        {sheet === "learn" && <p className="text-sm text-zinc-300 lg:hidden">{concept.description}</p>}
        {s.hist.length > 1 && <div className="mt-4 hidden lg:block"><Graph points={s.hist} label={concept.slug === "projectile-motion" ? "height (cyan) and vy (amber)" : "recorded series"} /></div>}
        {mode === "challenge" && concept.slug === "projectile-motion" && (
          <div className="mt-4 rounded border border-line p-3 text-sm">
            <p className="font-medium">Challenge — maximize range with drag = 0</p>
            <p className="text-zinc-400">On flat ground the analytic peak is 45°. Current angle {s.params.angle}°.</p>
          </div>
        )}
        {mode === "experiment" && (
          <div className="mt-4 rounded border border-line p-3 text-sm">
            <p className="font-medium">Experiment log</p>
            <ul className="mt-2 font-mono text-xs text-accent">{measures.map((m) => <li key={m.k}>{m.k}: {m.v}</li>)}</ul>
          </div>
        )}
      </section>
      <aside className="hidden space-y-4 lg:block">
        <div className="rounded-lg border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Controls</p>
          {concept.parameters.map((par) => (
            <label key={par.key} className="mt-3 block text-sm">
              <span className="flex justify-between text-zinc-300"><span>{par.label}</span><span className="font-mono text-accent">{s.params[par.key]} {par.unit}</span></span>
              <input className="w-full" type="range" min={par.min} max={par.max} step={par.step} value={s.params[par.key]} aria-label={`${par.label} ${par.unit}`} onChange={(e) => setP(par.key, Number(e.target.value))} />
              <input className="mt-1 w-24 rounded border border-line bg-ink px-1 font-mono text-xs" type="number" min={par.min} max={par.max} step={par.step} value={s.params[par.key]} aria-label={`${par.label} numeric`} onChange={(e) => setP(par.key, Number(e.target.value))} />
            </label>
          ))}
        </div>
        <div className="rounded-lg border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Measurements</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">{measures.map((m) => <li key={m.k} className="flex justify-between gap-2"><span className="text-zinc-400">{m.k}</span><span>{m.v}</span></li>)}</ul>
        </div>
        <div className="flex gap-2 text-xs">
          {(["beginner", "intermediate", "advanced"] as const).map((lv) => (
            <button key={lv} onClick={() => setLevel(lv)} className={`rounded border px-2 py-1 ${level === lv ? "border-accent text-accent" : "border-line text-zinc-500"}`}>{lv}</button>
          ))}
        </div>
        {(mode === "learn" || level !== "beginner") && (
          <article className="space-y-3 text-sm leading-relaxed text-zinc-300">
            <h2 className="text-base font-medium text-white">What are you seeing?</h2>
            <p>{concept.description}</p>
            <h2 className="text-base font-medium text-white">Why does it happen?</h2>
            <p>{concept.intuition}</p>
            {level !== "beginner" && (<><h2 className="text-base font-medium text-white">The equation</h2><ul className="space-y-2">{concept.equations.map((eq) => (<li key={eq.latex} className="rounded bg-ink px-2 py-2"><p className="font-mono text-accent">{eq.latex}</p><p className="text-zinc-400">{eq.meaning}</p></li>))}</ul></>)}
            <h2 className="text-base font-medium text-white">Assumptions</h2>
            <ul className="list-disc pl-4 text-zinc-400">{concept.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
          </article>
        )}
      </aside>
    </div>
  );
}
