import Link from "next/link";
import { CATEGORIES, CONCEPTS } from "@/lib/concepts";

export const metadata = { title: "Physics Map", description: "Concept relationship graph." };

export default function MapPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Physics Map</h1>
      <p className="mt-2 text-zinc-400">All 44 laboratories, grouped by field. Open any node to enter the lab.</p>
      <div className="mt-8 space-y-8">
        {CATEGORIES.map((cat) => {
          const items = CONCEPTS.filter((c) => c.category === cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id}>
              <h2 className="text-sm uppercase tracking-widest text-zinc-500">{cat.label}</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/physics/${c.category}/${c.slug}`} className="block rounded-lg border border-line bg-ink p-3 hover:border-accent/50">
                      <p className="font-medium leading-tight">{c.title}</p>
                      <p className="mt-1 text-xs text-zinc-500">{c.dimension ?? "2D"}{c.audioAvailable ? " · audio" : ""}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
