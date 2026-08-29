import type { MetadataRoute } from "next";
import { CONCEPTS, CATEGORIES } from "@/lib/concepts";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://physics-universe.vercel.app";
  const staticPages = ["", "/physics", "/learn", "/search", "/map", "/experiments", "/challenges"].map((p) => ({
    url: `${base}${p || "/"}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  const cats = CATEGORIES.map((c) => ({ url: `${base}/physics/${c.id}`, changeFrequency: "weekly" as const, priority: 0.6 }));
  const labs = CONCEPTS.map((c) => ({ url: `${base}/physics/${c.category}/${c.slug}`, changeFrequency: "monthly" as const, priority: 0.8 }));
  return [...staticPages, ...cats, ...labs];
}
