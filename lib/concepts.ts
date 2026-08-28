import type { Concept } from "./concepts-types";
export type { Category, Difficulty, ParamDef, Concept } from "./concepts-types";
export { CATEGORIES } from "./concepts-types";
import { PART as A } from "./concepts-part1";
import { PART as B } from "./concepts-part2";
import { PART as C } from "./concepts-part3";
export const CONCEPTS: Concept[] = [...A, ...B, ...C];
export function getConcept(slug: string) { return CONCEPTS.find((c) => c.slug === slug); }
export function byCategory(cat: string) { return CONCEPTS.filter((c) => c.category === cat); }
export function searchConcepts(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return CONCEPTS;
  return CONCEPTS.filter((c) => {
    const bag = [c.title, c.slug, c.category, c.tagline, c.description].join(" ").toLowerCase();
    return s.split(/\s+/).every((w) => bag.includes(w));
  });
}
