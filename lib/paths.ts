export type PathItem = { slug: string; note: string };
export type LearnPath = { id: string; title: string; level: "beginner" | "intermediate" | "advanced"; blurb: string; items: PathItem[] };

export const LEARN_PATHS: LearnPath[] = [
  {
    id: "beginner",
    title: "First laws",
    level: "beginner",
    blurb: "Motion, force, energy, and waves — change a slider and watch the world answer.",
    items: [
      { slug: "newtons-second-law", note: "Feel F = ma before you memorize it." },
      { slug: "projectile-motion", note: "Why 45° is special when drag is absent." },
      { slug: "conservation-of-energy", note: "Height becomes speed." },
      { slug: "pendulum", note: "Period barely cares about amplitude at small angles." },
      { slug: "standing-waves", note: "Nodes you can count." },
      { slug: "simple-circuit", note: "Charge piles up, then the current fades." },
    ],
  },
  {
    id: "intermediate",
    title: "Fields and flows",
    level: "intermediate",
    blurb: "Momentum, fields, heat, and the first taste of relativity and quanta.",
    items: [
      { slug: "elastic-collision", note: "Two numbers survive: p and K." },
      { slug: "electric-field", note: "A map of how a charge would accelerate." },
      { slug: "ideal-gas", note: "P V = N k T is a crowd of collisions." },
      { slug: "time-dilation", note: "Moving clocks run slow." },
      { slug: "quantum-tunneling", note: "A barrier is not always a wall." },
      { slug: "orbital-motion", note: "Falling that never hits." },
    ],
  },
  {
    id: "advanced",
    title: "Strange and large",
    level: "advanced",
    blurb: "Chaos, fields in 3D, wavefunctions, and expanding space — with the model named honestly.",
    items: [
      { slug: "double-pendulum", note: "Deterministic and still unpredictable." },
      { slug: "three-body", note: "No closed-form peace treaty." },
      { slug: "electromagnetic-wave", note: "E and B taking turns." },
      { slug: "hydrogen-orbitals", note: "A cloud, not a miniature planet." },
      { slug: "gravitational-lensing", note: "A schematic of bent light." },
      { slug: "expanding-universe", note: "Galaxies recede; space grows." },
    ],
  },
];
