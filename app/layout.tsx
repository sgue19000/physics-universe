import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "Physics Universe — See Physics. Change Physics.",
    template: "%s · Physics Universe",
  },
  description:
    "Interactive physics laboratory: simulations, experiments, equations, and visualizations from Newton to quantum mechanics.",
  openGraph: {
    title: "Physics Universe",
    description: "Explore the laws of nature through interactive simulations.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-4">{children}</main>
      </body>
    </html>
  );
}
