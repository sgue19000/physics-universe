import { step, type SimState } from "./engine";

export function advance(slug: string, s: SimState, dtRaw: number) {
  const prev = s.playing;
  s.playing = true;
  step(slug, s, dtRaw);
  s.playing = prev;
  return s;
}
