"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES } from "@/lib/concepts";

export function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#07090f]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          PHYSICS <span className="text-accent">UNIVERSE</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-3 text-sm text-zinc-400 md:flex">
          <Link href="/physics" className={path.startsWith("/physics") ? "text-accent" : ""}>Explore</Link>
          <Link href="/experiments" className={path === "/experiments" ? "text-accent" : ""}>Experiments</Link>
          <Link href="/challenges" className={path === "/challenges" ? "text-accent" : ""}>Challenges</Link>
          <Link href="/map" className={path === "/map" ? "text-accent" : ""}>Physics Map</Link>
        </nav>
        <form className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/physics?q=${encodeURIComponent(q)}`); }}>
          <label className="sr-only" htmlFor="q">Search physics</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="gravity, tunneling, entropy…" className="w-full max-w-xs rounded-md border border-line bg-panel px-3 py-1.5 text-sm" />
        </form>
        <button className="md:hidden" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</button>
      </div>
      {open && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/physics">Explore</Link>
            <Link href="/experiments">Experiments</Link>
            <Link href="/challenges">Challenges</Link>
            <Link href="/map">Map</Link>
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={`/physics/${c.id}`}>{c.label}</Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
