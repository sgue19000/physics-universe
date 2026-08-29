export type SimState = {
  t: number;
  playing: boolean;
  speed: number;
  params: Record<string, number>;
  // Mixed per-lab bag: scalars, arrays, camera, particle clouds.
  data: Record<string, any>;
  trail: { x: number; y: number }[];
  particles: { x: number; y: number; vx: number; vy: number; extra?: number }[];
  hist: { t: number; y: number; y2?: number }[];
};
