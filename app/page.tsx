import Link from "next/link";
import { CATEGORIES, CONCEPTS } from "@/lib/concepts";
import { LEARN_PATHS } from "@/lib/paths";

const FEATURED = ["projectile-motion", "double-pendulum", "hydrogen-orbitals", "time-dilation", "wave-interference", "gravitational-lensing"];

export default function HomePage() {
  const featured = FEATURED.map((s) => CONCEPTS.find((c) => c.slug === s)).filter(Boolean);
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-panel px-5 py-10 md:px-10 md:py-16">
        <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute left-1/2 top-8 h-40 w-40 -translate-x-1/2 rounded-full border border-accent/20" />
          <div className="absolute left-1/2 top-2 h-56 w-56 -translate-x-1/2 rounded-full border border-accent/10" />
          <div className="absolute right-10 top-16 h-2 w-2 rounded-full bg-accent" />
          <div className="absolute bottom-10 left-16 h-1.5 w-1.5 rounded-full bg-warm" />
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Interactive physics laboratory</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Physics becomes understandable when you can see it.</h1>
        <p className="mt-4 max-w-xl text-lg text-zinc-400">Change a mass, a field, a wavelength. Watch the consequence. That is the whole method.</p>
        <p className="mt-2 text-sm text-zinc-500">See Physics. Change Physics. Understand Physics.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/physics" className="rounded-md bg-accent px-4 py-2.5 text-ink">Explore Physics</Link>
          <Link href="/learn" className="rounded-md border border-line px-4 py-2.5">Start a path</Link>
          <Link href="/experiments" className="rounded-md border border-line px-4 py-2.5">Open an experiment</Link>
        </div>
        <p className="mt-6 text-sm text-zinc-500">{CONCEPTS.length} live laboratories · no placeholder cards</p>
      </section>

      <section>
        <h2 className="text-xl font-medium">Physics Universe Explorer</h2>
        <p className="mt-1 text-sm text-zinc-400">Pick a domain. Every card opens real simulations, not articles about simulations.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.filter((c) => !["nuclear", "particle"].includes(c.id)).map((c) => {
            const n = CONCEPTS.filter((x) => x.category === c.id).length;
            return (
              <Link key={c.id} href={`/physics/${c.id}`} className="rounded-lg border border-line bg-panel p-4 hover:border-accent/50">
                <p className="font-medium">{c.label}</p>
                <p className="mt-1 text-sm text-zinc-400">{c.blurb}</p>
                <p className="mt-3 text-xs text-zinc-500">{n} lab{n === 1 ? "" : "s"}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-medium">Learning paths</h2>
          <Link href="/learn" className="text-sm text-accent">All paths</Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {LEARN_PATHS.map((p) => (
            <Link key={p.id} href="/learn" className="rounded-lg border border-line p-4 hover:border-accent/50">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{p.level}</p>
              <p className="mt-1 font-medium">{p.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{p.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-medium">Featured laboratories</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {featured.map((c) => c && (
            <Link key={c.slug} href={`/physics/${c.category}/${c.slug}`} className="rounded-lg border border-line p-4 hover:border-accent/50">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{c.category} · {c.dimension ?? "2D"}</p>
              <p className="mt-1 font-medium">{c.title}</p>
              <p className="mt-1 text-sm text-zinc-400">{c.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line p-5">
        <h2 className="text-xl font-medium">How a lab works</h2>
        <ol className="mt-3 grid gap-3 text-sm text-zinc-300 md:grid-cols-5">
          {["Explore", "Observe", "Manipulate", "Experiment", "Challenge"].map((step, i) => (
            <li key={step}><span className="font-mono text-accent">{i + 1}</span> {step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
