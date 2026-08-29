/** Query expansions so "gravity" reaches orbits, lensing, and black holes. */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  gravity: ["orbital-motion", "three-body", "black-hole", "gravitational-lensing", "solar-system", "star-system-3d", "projectile-motion", "newtons-second-law"],
  orbit: ["orbital-motion", "solar-system", "star-system-3d", "three-body"],
  light: ["double-slit", "lens", "ray-tracing-3d", "electromagnetic-wave", "doppler-effect", "relativistic-doppler"],
  wave: ["wave-interference", "standing-waves", "wave-surface", "doppler-effect", "electromagnetic-wave"],
  quantum: ["quantum-double-slit", "quantum-tunneling", "particle-in-a-box", "quantum-harmonic-oscillator", "hydrogen-orbitals", "stern-gerlach"],
  relativity: ["time-dilation", "length-contraction", "spacetime-diagram", "spacetime-explorer", "relativistic-doppler"],
  heat: ["ideal-gas", "entropy", "molecular-dynamics", "maxwell-boltzmann"],
  electric: ["electric-field", "electric-field-3d", "simple-circuit", "electromagnetic-wave"],
  magnetic: ["magnetic-field", "magnetic-wire", "electromagnetic-wave"],
  blackhole: ["black-hole", "gravitational-lensing"],
  "black hole": ["black-hole", "gravitational-lensing"],
};
