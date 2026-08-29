import Link from "next/link";
import { LEARN_PATHS } from "@/lib/paths";
import { getConcept } from "@/lib/concepts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learning paths",
  description: "Guided routes through the Physics Universe laboratories, from F = ma to expanding space.",
};

export default function LearnPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Curriculum</p>
        <h1 className="mt-2 text-3xl font-semibold">Learning paths</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">Start where you are. Each step opens a live laboratory, not a lecture slide.</p>
      </header>
      {LEARN_PATHS.map((path) => (
        <section key={path.id} className="rounded-xl border border-line bg-panel p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">{path.level}</p>
          <h2 className="mt-1 text-xl font-medium">{path.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{path.blurb}</p>
          <ol className="mt-4 space-y-2">
            {path.items.map((item, i) => {
              const c = getConcept(item.slug);
              if (!c) return null;
              return (
                <li key={item.slug}>
                  <Link href={`/physics/${c.category}/${c.slug}`} className="flex gap-3 rounded-lg border border-line px-3 py-2 hover:border-accent/50">
                    <span className="font-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-medium">{c.title}</span>
                      <span className="text-sm text-zinc-400">{item.note}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
