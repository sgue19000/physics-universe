"use client";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let osc: OscillatorNode | null = null;
let oscGain: GainNode | null = null;
let enabled = false;
let volume = 0.25;
let started = false;

export function audioEnabled() { return enabled; }
export function audioVolume() { return volume; }

export function setAudioEnabled(on: boolean) {
  enabled = on;
  if (!on) stopTone();
}

export function setAudioVolume(v: number) {
  volume = Math.max(0, Math.min(1, v));
  if (master) master.gain.value = volume;
}

export async function unlockAudio() {
  if (started && ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = ctx ?? new AC();
  master = master ?? ctx.createGain();
  master.gain.value = volume;
  master.connect(ctx.destination);
  if (ctx.state === "suspended") await ctx.resume();
  started = true;
  return ctx;
}

export function stopTone() {
  if (oscGain && ctx) oscGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
}

export async function setTone(freq: number, amp = 0.08) {
  if (!enabled) { stopTone(); return; }
  const ac = await unlockAudio();
  if (!osc) {
    osc = ac.createOscillator();
    oscGain = ac.createGain();
    osc.type = "sine";
    oscGain.gain.value = 0;
    osc.connect(oscGain);
    oscGain.connect(master!);
    osc.start();
  }
  osc.frequency.setTargetAtTime(Math.max(40, Math.min(1800, freq)), ac.currentTime, 0.04);
  oscGain!.gain.setTargetAtTime(Math.max(0, Math.min(0.2, amp * volume)), ac.currentTime, 0.05);
}

export async function impact(energy: number) {
  if (!enabled) return;
  const ac = await unlockAudio();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "triangle";
  o.frequency.value = 120 + Math.min(800, energy * 40);
  g.gain.value = Math.min(0.25, 0.04 + energy * 0.02) * volume;
  o.connect(g); g.connect(master!);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.12);
  o.stop(ac.currentTime + 0.13);
}
