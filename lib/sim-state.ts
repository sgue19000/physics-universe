export type SimState = {
  t: number;
  playing: boolean;
  speed: number;
  params: Record<string, number>;
  data: Record<string, number>;
  trail: { x: number; y: number }[];
  particles: { x: number; y: number; vx: number; vy: number; extra?: number }[];
  hist: { t: number; y: number; y2?: number }[];
};
