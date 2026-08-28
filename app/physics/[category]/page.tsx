import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, byCategory } from "@/lib/concepts";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORIES.find((c) => c.id === category);
  return { title: meta?.label ?? "Physics", description: meta?.blurb };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORIES.find((c) => c.id === category);
  if (!meta) notFound();
  const list = byCategory(category);
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-accent">Field</p>
      <h1 className="mt-1 text-3xl font-semibold">{meta.label}</h1>
      <p className="mt-2 text-zinc-400">{meta.blurb}</p>
      <ul className="mt-8 space-y-3">
        {list.length === 0 && (
          <li className="text-zinc-500">No MVP simulations in this field yet — architecture is ready to extend.</li>
        )}
        {list.map((c) => (
          <li key={c.slug}>
            <Link href={`/physics/${c.category}/${c.slug}`} className="block rounded-lg border border-line p-4 hover:border-accent/50">
              <p className="text-lg font-medium">{c.title}</p>
              <p className="text-sm text-zinc-400">{c.tagline}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
