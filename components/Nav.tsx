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
  const go = (href: string) => { setOpen(false); router.push(href); };
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#07090f]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="shrink-0 font-semibold tracking-tight">
          PHYSICS <span className="text-accent">UNIVERSE</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-3 text-sm text-zinc-400 md:flex">
          <Link href="/physics" className={path.startsWith("/physics") ? "text-accent" : ""}>Explore</Link>
          <Link href="/learn" className={path.startsWith("/learn") ? "text-accent" : ""}>Paths</Link>
          <Link href="/experiments" className={path === "/experiments" ? "text-accent" : ""}>Experiments</Link>
          <Link href="/challenges" className={path === "/challenges" ? "text-accent" : ""}>Challenges</Link>
          <Link href="/map" className={path === "/map" ? "text-accent" : ""}>Map</Link>
        </nav>
        <form className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }}>
          <label className="sr-only" htmlFor="q">Search physics</label>
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="gravity, tunneling, entropy…" className="w-full max-w-xs rounded-md border border-line bg-panel px-3 py-2 text-sm" />
        </form>
        <button className="min-h-11 px-2 md:hidden" aria-expanded={open} onClick={() => setOpen((o) => !o)}>Menu</button>
      </div>
      {open && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-base">
            <button className="text-left" onClick={() => go("/physics")}>Explore</button>
            <button className="text-left" onClick={() => go("/learn")}>Paths</button>
            <button className="text-left" onClick={() => go("/search")}>Search</button>
            <button className="text-left" onClick={() => go("/experiments")}>Experiments</button>
            <button className="text-left" onClick={() => go("/challenges")}>Challenges</button>
            <button className="text-left" onClick={() => go("/map")}>Map</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} className="text-left text-zinc-400" onClick={() => go(`/physics/${c.id}`)}>{c.label}</button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
