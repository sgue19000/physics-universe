import Link from "next/link";
import { CONCEPTS, searchConcepts } from "@/lib/concepts";
import { SEARCH_SYNONYMS } from "@/lib/synonyms";
import { LEARN_PATHS } from "@/lib/paths";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description: "Find laboratories, equations, and learning paths in Physics Universe.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const direct = searchConcepts(q);
  const extraSlugs = new Set<string>();
  const key = q.toLowerCase();
  for (const [k, slugs] of Object.entries(SEARCH_SYNONYMS)) {
    if (key.includes(k) || k.includes(key)) slugs.forEach((s) => extraSlugs.add(s));
  }
  const extras = CONCEPTS.filter((c) => extraSlugs.has(c.slug) && !direct.some((d) => d.slug === c.slug));
  const paths = LEARN_PATHS.filter((p) => `${p.title} ${p.blurb} ${p.level}`.toLowerCase().includes(key));
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Search</h1>
        <p className="mt-2 text-zinc-400">{q ? `Results for “${q}”` : "Try gravity, tunneling, F = ma, or orbit."}</p>
      </header>
      {!q && (
        <div className="flex flex-wrap gap-2 text-sm">
          {["gravity", "wave", "quantum", "relativity", "heat", "light"].map((s) => (
            <Link key={s} href={`/search?q=${s}`} className="rounded-full border border-line px-3 py-1 text-zinc-300">{s}</Link>
          ))}
        </div>
      )}
      <section>
        <h2 className="text-sm uppercase tracking-widest text-zinc-500">Laboratories</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">
          {direct.map((c) => (
            <li key={c.slug}>
              <Link href={`/physics/${c.category}/${c.slug}`} className="block rounded-lg border border-line p-3 hover:border-accent/50">
                <p className="text-xs uppercase text-zinc-500">{c.category} · {c.dimension ?? "2D"}</p>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-zinc-400">{c.tagline}</p>
              </Link>
            </li>
          ))}
        </ul>
        {direct.length === 0 && q && <p className="mt-3 text-zinc-500">No title match — check related concepts below.</p>}
      </section>
      {extras.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500">Related to this idea</h2>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {extras.map((c) => (
              <li key={c.slug}>
                <Link href={`/physics/${c.category}/{c.slug}`.replace("{c.slug}", c.slug)} className="block rounded-lg border border-line p-3 hover:border-accent/50">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-sm text-zinc-400">{c.tagline}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      {paths.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-widest text-zinc-500">Learning paths</h2>
          <ul className="mt-3 space-y-2">
            {paths.map((p) => (
              <li key={p.id}><Link href="/learn" className="text-accent">{p.title}</Link> — {p.blurb}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
