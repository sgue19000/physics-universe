import Link from "next/link";
export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-3xl font-semibold">This worldline does not exist</h1>
      <p className="mt-2 text-zinc-400">404 — no simulation at this URL.</p>
      <Link href="/physics" className="mt-6 inline-block text-accent">
        Back to the catalog
      </Link>
    </div>
  );
}
