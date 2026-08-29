import type { Concept } from "./concepts-types";
export type { Category, Difficulty, ParamDef, Concept, SimDimension } from "./concepts-types";
export { CATEGORIES } from "./concepts-types";
import { PART as A } from "./concepts-part1";
import { PART as B } from "./concepts-part2";
import { PART as C } from "./concepts-part3";
import { PART as D } from "./concepts-part4";
import { PART as E } from "./concepts-part5";
export const CONCEPTS: Concept[] = [...A, ...B, ...C, ...D, ...E];
export function getConcept(slug: string) { return CONCEPTS.find((c) => c.slug === slug); }
export function byCategory(cat: string) { return CONCEPTS.filter((c) => c.category === cat); }
export function searchConcepts(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return CONCEPTS;
  return CONCEPTS.filter((c) => {
    const bag = [
      c.title, c.slug, c.category, c.tagline, c.description, c.intuition,
      ...(c.aliases ?? []),
      ...(c.equations?.map((e) => `${e.latex} ${e.meaning}`) ?? []),
      c.dimension ?? "",
      c.simulationType ?? "",
    ].join(" ").toLowerCase();
    return s.split(/\s+/).every((w) => bag.includes(w));
  });
}
