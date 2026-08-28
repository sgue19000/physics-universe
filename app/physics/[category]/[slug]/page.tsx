import { notFound } from "next/navigation";
import { CONCEPTS, getConcept } from "@/lib/concepts";
import { Lab } from "@/components/Lab";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ category: c.category, slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug } = await params;
  const c = getConcept(slug);
  return {
    title: c?.title ?? "Simulation",
    description: c?.description,
  };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug, category } = await params;
  const c = getConcept(slug);
  if (!c || c.category !== category) notFound();
  return <Lab concept={c} />;
}
