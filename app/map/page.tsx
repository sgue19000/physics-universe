import { CONCEPTS } from "@/lib/concepts";

export const metadata = { title: "Physics Map", description: "Concept relationship graph." };

const EDGES: [string, string][] = [
  ["newtons-second-law", "projectile-motion"],
  ["newtons-second-law", "conservation-of-energy"],
  ["conservation-of-energy", "pendulum"],
  ["projectile-motion", "orbital-motion"],
  ["orbital-motion", "solar-system"],
  ["orbital-motion", "black-hole"],
  ["wave-interference", "standing-waves"],
  ["wave-interference", "double-slit"],
  ["double-slit", "quantum-double-slit"],
  ["standing-waves", "particle-in-a-box"],
  ["particle-in-a-box", "quantum-tunneling"],
  ["electric-field", "magnetic-field"],
  ["electric-field", "simple-circuit"],
  ["ideal-gas", "entropy"],
  ["time-dilation", "length-contraction"],
  ["time-dilation", "spacetime-diagram"],
  ["length-contraction", "spacetime-diagram"],
];

export default function MapPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Physics Map</h1>
      <p className="mt-2 text-zinc-400">Relationships among the MVP concepts. Click a node to open the lab.</p>
      <svg viewBox="0 0 800 520" className="mt-8 w-full rounded-lg border border-line bg-ink" role="img" aria-label="Concept graph">
        {EDGES.map(([a, b], i) => {
          const A = CONCEPTS.find((c) => c.slug === a)!;
          const B = CONCEPTS.find((c) => c.slug === b)!;
          const ia = CONCEPTS.indexOf(A);
          const ib = CONCEPTS.indexOf(B);
          const ax = 80 + (ia % 6) * 120;
          const ay = 50 + Math.floor(ia / 6) * 130;
          const bx = 80 + (ib % 6) * 120;
          const by = 50 + Math.floor(ib / 6) * 130;
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} stroke="#1c2436" />;
        })}
        {CONCEPTS.map((c, i) => {
          const x = 80 + (i % 6) * 120;
          const y = 50 + Math.floor(i / 6) * 130;
          return (
            <a key={c.slug} href={`/physics/${c.category}/${c.slug}`}>
              <circle cx={x} cy={y} r="10" fill="#6ee7ff" />
              <text x={x} y={y + 28} textAnchor="middle" fill="#9aa4b8" fontSize="10">
                {c.title.length > 16 ? c.title.slice(0, 16) + "\u2026" : c.title}
              </text>
            </a>
          );
        })}
      </svg>
    </div>
  );
}
