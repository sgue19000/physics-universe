import Link from "next/link";
import { CATEGORIES, CONCEPTS, searchConcepts } from "@/lib/concepts";

export const metadata = {
  title: "Explore physics",
  description: "Catalog of interactive physics simulations.",
};

export default async function PhysicsIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const list = q ? searchConcepts(q) : CONCEPTS;
  return (
    <div>
      <h1 className="text-3xl font-semibold">Explore</h1>
      <p className="mt-2 text-zinc-400">{q ? `Results for \u201c${q}\u201d` : "Pick a field, then open a simulation."}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/physics/${c.id}`} className="rounded-full border border-line px-3 py-1 text-sm">
            {c.label}
          </Link>
        ))}
      </div>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {list.map((c) => (
          <li key={c.slug}>
            <Link href={`/physics/${c.category}/${c.slug}`} className="block rounded-lg border border-line p-4 hover:border-accent/50">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{c.category} · {c.difficulty}</p>
              <p className="mt-1 text-lg font-medium">{c.title}</p>
              <p className="text-sm text-zinc-400">{c.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-8 text-zinc-500">No matching concepts.</p>}
    </div>
  );
}
