import Link from "next/link";
import { Button } from "./ui";
import { navLinks } from "@/lib/site-content";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[rgba(251,250,247,0.92)] backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="serif-heading text-2xl font-normal text-[color:var(--foreground)]">
          ProofPost
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-[color:var(--foreground)]"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 transition hover:text-[color:var(--foreground)]"
          >
            Log in
          </Link>
          <Button href="/send" className="px-4 py-2.5">
            Send a Letter
          </Button>
        </nav>
        <div className="md:hidden">
          <Button href="/send" className="px-4 py-2.5">
            Send a Letter
          </Button>
        </div>
      </div>
    </header>
  );
}
