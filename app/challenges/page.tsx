import Link from "next/link";

const ITEMS = [
  { href: "/physics/mechanics/newtons-second-law", q: "If mass doubles and force stays constant, what happens to acceleration?" },
  { href: "/physics/mechanics/projectile-motion", q: "Without drag, which launch angle near 45° gives the longest range on flat ground?" },
  { href: "/physics/relativity/time-dilation", q: "As v → c, does a moving clock tick faster or slower in the lab?" },
  { href: "/physics/quantum/quantum-tunneling", q: "Does a thicker barrier increase or decrease transmission when E < V?" },
];

export const metadata = { title: "Challenges", description: "Predict, then simulate." };

export default function ChallengesPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Challenges</h1>
      <p className="mt-2 text-zinc-400">Predict → simulate → explain.</p>
      <ul className="mt-8 space-y-3">
        {ITEMS.map((it) => (
          <li key={it.href} className="rounded-lg border border-line p-4">
            <p>{it.q}</p>
            <Link href={it.href} className="mt-2 inline-block text-sm text-accent">Open simulation</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
