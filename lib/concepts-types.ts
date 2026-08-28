export type Category =
  | "mechanics" | "waves" | "optics" | "electromagnetism" | "thermodynamics"
  | "relativity" | "quantum" | "nuclear" | "particle" | "astrophysics" | "cosmology";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type ParamDef = { key: string; label: string; unit: string; min: number; max: number; step: number; default: number };
export type Concept = {
  id: string; slug: string; title: string; category: Category; difficulty: Difficulty;
  tagline: string; description: string; intuition: string; explanation: string; theory: string;
  assumptions: string[]; equations: { latex: string; meaning: string; symbols: string }[];
  parameters: ParamDef[]; related: string[]; measurements: string[]; hypotheticalNote?: string;
};
export const CATEGORIES: { id: Category; label: string; blurb: string }[] = [
  { id: "mechanics", label: "Mechanics", blurb: "Motion, force, energy, orbits." },
  { id: "waves", label: "Waves", blurb: "Oscillation, interference, standing waves." },
  { id: "optics", label: "Optics", blurb: "Rays, lenses, diffraction." },
  { id: "electromagnetism", label: "Electromagnetism", blurb: "Charges, fields, circuits." },
  { id: "thermodynamics", label: "Thermodynamics", blurb: "Heat, gases, entropy." },
  { id: "relativity", label: "Relativity", blurb: "Time, length, spacetime." },
  { id: "quantum", label: "Quantum", blurb: "Amplitude, tunneling, wells." },
  { id: "nuclear", label: "Nuclear", blurb: "Decay, binding, fission." },
  { id: "particle", label: "Particle Physics", blurb: "Standard Model map." },
  { id: "astrophysics", label: "Astrophysics", blurb: "Stars, orbits, black holes." },
  { id: "cosmology", label: "Cosmology", blurb: "Expansion and the cosmic timeline." },
];
