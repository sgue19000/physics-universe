import Link from "next/link";
import { CATEGORIES, CONCEPTS } from "@/lib/concepts";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-8 pt-8 md:grid-cols-[1.2fr_0.8fr] md:pt-16">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent">Interactive laboratory</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">Physics, but alive.</h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-400">
            Explore the laws of nature through interactive simulations, experiments, and visualizations.
          </p>
          <p className="mt-2 text-sm text-zinc-500">See Physics. Change Physics. Understand Physics.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/physics" className="rounded-md bg-accent px-4 py-2 text-ink">Explore Physics</Link>
            <Link href="/experiments" className="rounded-md border border-line px-4 py-2">Start Experimenting</Link>
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Live library</p>
          <p className="mt-2 text-3xl font-semibold">{CONCEPTS.length}</p>
          <p className="text-sm text-zinc-400">working simulations in the MVP — not placeholders.</p>
          <ul className="mt-4 space-y-1 text-sm text-zinc-300">
            <li>Interactive simulations</li>
            <li>Real equations with symbols defined</li>
            <li>Virtual experiments and measurements</li>
            <li>From Newton to quantum mechanics</li>
          </ul>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">Fields</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href={`/physics/${c.id}`} className="rounded-lg border border-line bg-panel p-4 hover:border-accent/50">
              <p className="font-medium">{c.label}</p>
              <p className="mt-1 text-sm text-zinc-400">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-medium">Featured experiments</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {CONCEPTS.slice(0, 6).map((c) => (
            <Link key={c.slug} href={`/physics/${c.category}/${c.slug}`} className="rounded-lg border border-line p-4 hover:border-accent/50">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{c.category}</p>
              <p className="mt-1 font-medium">{c.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
