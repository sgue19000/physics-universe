"use client";

import { useEffect, useRef, useState } from "react";
import type { Concept } from "@/lib/concepts";
import { CONCEPTS } from "@/lib/concepts";
import { draw, measureText, reset, step, type SimState } from "@/lib/engine";
import Link from "next/link";
import { audioEnabled, audioVolume, setAudioEnabled, setAudioVolume, unlockAudio, setTone, impact, stopTone } from "@/lib/audio";
import { bindOrbit, defaultCam } from "@/lib/camera3d";

export function Lab({ concept }: { concept: Concept }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<SimState>(reset(concept));
  const [, setTick] = useState(0);
  const [mode, setMode] = useState<"explore" | "learn" | "experiment" | "challenge">("explore");
  const [level, setLevel] = useState(concept.difficulty);
  const [hyp, setHyp] = useState(false);
  const [pred, setPred] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

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
      if (audioEnabled() && !document.hidden) {
        if (concept.slug === "doppler-effect" || concept.slug === "relativistic-doppler") void setTone(s.data.fobs ?? 440, 0.07);
        else if (concept.slug === "wave-surface") void setTone(80 + (s.data.f ?? 1) * 80, 0.05);
        else if (concept.slug === "electric-field-3d") void setTone(120 + Math.min(800, (s.data.E ?? 0) / 50), 0.04);
        else if (concept.slug === "star-system-3d") void setTone(90 + ((s.data.ang ?? 0) % 8), 0.03);
        else if (concept.slug === "gravitational-lensing") void setTone(55, 0.035);
        else if (concept.slug === "double-pendulum") void setTone(80 + Math.abs(s.data.y?.[1] ?? 0) * 20, 0.03);
        if (concept.slug === "elastic-collision" && s.data.hit === 1 && !s.data.pinged) { s.data.pinged = 1; void impact(8); }
        if (concept.slug === "molecular-dynamics" && (s.data.hits ?? 0) > 0) void impact(Math.min(4, s.data.hits));
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
      if (now % 4 < 20) setTick((n) => n + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); stopTone(); };
  }, [concept.slug]);

  const s = stateRef.current;
  const measures = measureText(concept.slug, s);
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
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
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
            <p className="text-xs uppercase tracking-widest text-zinc-500">{concept.category} · {level} · {concept.dimension ?? "2D"}{concept.audioAvailable ? " · audio" : ""}</p>
            <h1 className="text-2xl font-semibold">{concept.title}</h1>
            <p className="text-sm text-zinc-400">{concept.tagline}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {(["explore", "learn", "experiment", "challenge"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setRevealed(false); setPred(null); }} className={`rounded border px-2 py-1 ${mode === m ? "border-accent text-accent" : "border-line text-zinc-400"}`}>{m}</button>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-line bg-ink">
          <canvas ref={canvasRef} className="h-[280px] w-full touch-none overscroll-none md:h-[420px]" role="img" aria-label={`${concept.title} simulation canvas${concept.dimension === "3D" ? ". Drag to orbit. Pinch or wheel to zoom." : ""}`} />
        </div>
        {concept.dimension === "3D" && <p className="mt-1 text-xs text-zinc-500">3D lab — drag to orbit · wheel/pinch zoom · Reset camera</p>}
        {concept.slug === "gravitational-lensing" && <p className="mt-1 text-xs text-zinc-500">If Sound is on, that tone is educational sonification — not sound in vacuum.</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <button className="rounded border border-line px-3 py-1" onClick={() => { s.playing = !s.playing; if (!s.playing) stopTone(); setTick((n) => n + 1); }}>{s.playing ? "Pause" : "Play"}</button>
          <button className="rounded border border-line px-3 py-1" onClick={() => { stateRef.current = reset(concept, s); setTick((n) => n + 1); }}>Reset</button>
          <label className="flex items-center gap-2 text-zinc-400">speed <input aria-label="Simulation speed" type="range" min={0.25} max={4} step={0.25} value={s.speed} onChange={(e) => { s.speed = Number(e.target.value); setTick((n) => n + 1); }} /> {s.speed}×</label>
          <label className="flex items-center gap-2 text-zinc-400"><input type="checkbox" checked={hyp} onChange={(e) => setHyp(e.target.checked)} /> What if?</label>
          <label className="flex items-center gap-2 text-zinc-400"><input aria-label="Enable educational sonification" type="checkbox" checked={audioEnabled()} onChange={async (e) => { setAudioEnabled(e.target.checked); if (e.target.checked) await unlockAudio(); else stopTone(); setTick((n) => n + 1); }} /> Sound</label>
          <label className="flex items-center gap-2 text-zinc-400">Volume <input aria-label="Sonification volume" type="range" min={0} max={1} step={0.05} value={audioVolume()} onChange={(e) => { setAudioVolume(Number(e.target.value)); setTick((n) => n + 1); }} /></label>
          {concept.dimension === "3D" && <button className="rounded border border-line px-3 py-1" onClick={() => { stateRef.current.data.cam = defaultCam(7); setTick((n) => n + 1); }}>Reset camera</button>}
          {(concept.slug === "hydrogen-orbitals" || concept.slug === "molecular-dynamics" || concept.slug === "three-body") && (
            <label className="flex items-center gap-2 text-zinc-400">Quality
              <select aria-label="Render quality" className="rounded border border-line bg-ink px-1 py-0.5" value={s.params.quality ?? 1} onChange={(e) => { s.params.quality = Number(e.target.value); if (concept.slug === "hydrogen-orbitals") s.data.cloud = []; setTick((n) => n + 1); }}>
                <option value={0}>Low</option><option value={1}>Medium</option><option value={2}>High</option>
              </select>
            </label>
          )}
        </div>
        {hyp && <p className="mt-2 rounded border border-warm/40 bg-warm/10 px-3 py-2 text-sm text-warm">Hypothetical scenario — not our physical universe.</p>}
        {mode === "challenge" && (
          <div className="mt-4 rounded border border-line p-3 text-sm">
            <p className="font-medium">Predict before you run</p>
            <div className="mt-2 flex gap-2">
              {["increases", "decreases", "stays similar"].map((opt) => (
                <button key={opt} className={`rounded border px-2 py-1 ${pred === opt ? "border-accent text-accent" : "border-line"}`} onClick={() => setPred(opt)}>{opt}</button>
              ))}
              <button className="rounded border border-line px-2 py-1" onClick={() => setRevealed(true)}>Reveal</button>
            </div>
            {revealed && <p className="mt-2 text-zinc-300">Change a slider and compare with the equations.</p>}
          </div>
        )}
        {mode === "experiment" && (
          <div className="mt-4 rounded border border-line p-3 text-sm">
            <p className="font-medium">Experiment log</p>
            <ul className="mt-2 font-mono text-xs text-accent">{measures.map((m) => <li key={m.k}>{m.k}: {m.v}</li>)}</ul>
          </div>
        )}
      </section>
      <aside className="space-y-4">
        <div className="rounded-lg border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Controls</p>
          {concept.parameters.map((par) => (
            <label key={par.key} className="mt-3 block text-sm">
              <span className="flex justify-between text-zinc-300"><span>{par.label}</span><span className="font-mono text-accent">{s.params[par.key]} {par.unit}</span></span>
              <input className="w-full" type="range" min={par.min} max={par.max} step={par.step} value={s.params[par.key]} aria-label={`${par.label} ${par.unit}`} onChange={(e) => setP(par.key, Number(e.target.value))} />
            </label>
          ))}
        </div>
        <div className="rounded-lg border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Measurements</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {measures.map((m) => <li key={m.k} className="flex justify-between gap-2"><span className="text-zinc-400">{m.k}</span><span>{m.v}</span></li>)}
          </ul>
        </div>
        <div className="flex gap-2 text-xs">
          {(["beginner", "intermediate", "advanced"] as const).map((lv) => (
            <button key={lv} onClick={() => setLevel(lv)} className={`rounded border px-2 py-1 ${level === lv ? "border-accent text-accent" : "border-line text-zinc-500"}`}>{lv}</button>
          ))}
        </div>
        {(mode === "learn" || level !== "beginner") && (
          <article className="space-y-3 text-sm leading-relaxed text-zinc-300">
            <h2 className="text-base font-medium text-white">What are we seeing?</h2>
            <p>{concept.description}</p>
            {concept.tryThis && (<><h2 className="text-base font-medium text-white">Try this</h2><p>{concept.tryThis}</p></>)}
            <h2 className="text-base font-medium text-white">Intuition</h2>
            <p>{concept.intuition}</p>
            {level !== "beginner" && (<><h2 className="text-base font-medium text-white">Explanation</h2><p>{concept.explanation}</p></>)}
            {level === "advanced" && (<><h2 className="text-base font-medium text-white">Deeper theory</h2><p>{concept.theory}</p></>)}
            <h2 className="text-base font-medium text-white">Equations</h2>
            <ul className="space-y-2">{concept.equations.map((eq) => (<li key={eq.latex} className="rounded bg-ink px-2 py-2"><p className="font-mono text-accent">{eq.latex}</p><p className="text-zinc-400">{eq.meaning}</p><p className="text-xs text-zinc-500">{eq.symbols}</p></li>))}</ul>
            <h2 className="text-base font-medium text-white">Assumptions</h2>
            <ul className="list-disc pl-4 text-zinc-400">{concept.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>
          </article>
        )}
        {mode === "explore" && level === "beginner" && <p className="text-sm text-zinc-400">{concept.intuition}</p>}
        <div className="text-sm">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Related</p>
          <ul className="mt-1">{concept.related.map((id) => { const r = CONCEPTS.find((c) => c.slug === id); if (!r) return null; return <li key={id}><Link className="text-accent" href={`/physics/${r.category}/${r.slug}`}>{r.title}</Link></li>; })}</ul>
        </div>
      </aside>
    </div>
  );
}
