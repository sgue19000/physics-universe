import Link from "next/link";
import { CONCEPTS } from "@/lib/concepts";

export const metadata = { title: "Experiments", description: "Run virtual physics experiments." };

export default function ExperimentsPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold">Experiments</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Open any lab, switch to Experiment mode, change one variable at a time, reset, and record the measurements.
      </p>
      <ul className="mt-8 grid gap-3 md:grid-cols-2">
        {CONCEPTS.map((c) => (
          <li key={c.slug}>
            <Link href={`/physics/${c.category}/${c.slug}`} className="block rounded-lg border border-line p-4">
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-zinc-400">Suggested measurements: {c.measurements.join(", ")}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
