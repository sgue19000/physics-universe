"use client";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let osc: OscillatorNode | null = null;
let oscGain: GainNode | null = null;
let enabled = false;
let volume = 0.55;
let started = false;
let lastError = "";

function publish() {
  if (typeof window === "undefined") return;
  (window as unknown as { __PU_AUDIO?: unknown }).__PU_AUDIO = {
    enabled,
    volume,
    started,
    status: audioStatus(),
    ctxState: ctx?.state ?? null,
    oscFreq: osc?.frequency.value ?? null,
    oscGain: oscGain?.gain.value ?? null,
    masterGain: master?.gain.value ?? null,
    dest: !!(ctx && master),
    error: lastError || null,
  };
}

export function audioEnabled() { return enabled; }
export function audioVolume() { return volume; }
export function audioStatus() {
  if (lastError) return "ERROR";
  if (!enabled) return "OFF";
  if (!ctx) return "READY";
  if (ctx.state === "suspended") return "SUSPENDED";
  if (ctx.state === "running" && osc) return "RUNNING";
  if (ctx.state === "running") return "READY";
  return String(ctx.state).toUpperCase();
}

export function setAudioEnabled(on: boolean) {
  enabled = on;
  if (!on) stopTone();
  publish();
}

export function setAudioVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master && ctx) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.02);
  if (oscGain && ctx && enabled) oscGain.gain.setTargetAtTime(0.14 * volume, ctx.currentTime, 0.03);
  publish();
}

function ensureGraph() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) ctx = new AC();
  if (!master) {
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (!osc) {
    osc = ctx.createOscillator();
    oscGain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 440;
    oscGain.gain.value = 0;
    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start();
  }
}

/** Must run inside a click/tap handler — never from rAF. */
export function unlockFromGesture() {
  lastError = "";
  try {
    enabled = true;
    ensureGraph();
    const resume = ctx!.state === "suspended" ? ctx!.resume() : Promise.resolve();
    started = true;
    if (osc && oscGain && ctx) {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      oscGain.gain.cancelScheduledValues(ctx.currentTime);
      oscGain.gain.setValueAtTime(0.16 * volume, ctx.currentTime);
    }
    publish();
    return resume.then(() => { publish(); return ctx!; }).catch((err) => {
      lastError = err instanceof Error ? err.message : String(err);
      publish();
      return ctx!;
    });
  } catch (err) {
    lastError = err instanceof Error ? err.message : String(err);
    publish();
    return Promise.reject(err);
  }
}

export async function unlockAudio() {
  return unlockFromGesture();
}

export function stopTone() {
  if (oscGain && ctx) {
    oscGain.gain.cancelScheduledValues(ctx.currentTime);
    oscGain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
  }
  publish();
}

export function muteAndDisable() {
  enabled = false;
  stopTone();
}

/** rAF-safe: never creates or resumes AudioContext. */
export function setTone(freq: number, amp = 0.12) {
  if (!enabled || !ctx || ctx.state !== "running" || !osc || !oscGain) return;
  const f = Number.isFinite(freq) ? freq : 440;
  osc.frequency.setTargetAtTime(Math.max(180, Math.min(1600, f)), ctx.currentTime, 0.05);
  oscGain.gain.setTargetAtTime(Math.max(0, Math.min(0.22, amp * volume)), ctx.currentTime, 0.05);
}

export function impact(energy: number) {
  if (!enabled || !ctx || ctx.state !== "running" || !master) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 180 + Math.min(700, energy * 40);
  g.gain.value = Math.min(0.28, 0.08 + energy * 0.02) * volume;
  o.connect(g); g.connect(master);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
  o.stop(ctx.currentTime + 0.15);
}

export function resumeIfNeeded() {
  if (ctx && ctx.state === "suspended") void ctx.resume().then(publish);
}
