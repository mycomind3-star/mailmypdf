"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Link2,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { seoPages, type SeoLandingPage } from "@/lib/seo-landing-pages";
import { Badge, Button, Card, Input } from "./ui";

type SeoRow = SeoLandingPage & {
  route: string;
  cluster: string;
  intent: string;
  state: "Live";
};

function getCluster(page: SeoLandingPage) {
  const slug = page.slug;

  if (slug.includes("invoice") || slug.includes("payment") || slug.includes("scope") || slug.includes("project")) {
    return "Client billing";
  }
  if (
    slug.includes("compliance") ||
    slug.includes("contract") ||
    slug.includes("service") ||
    slug.includes("records") ||
    slug.includes("confirmation") ||
    slug.includes("termination")
  ) {
    return "Operations";
  }
  if (slug.includes("landlord") || slug.includes("tenant") || slug.includes("medical") || slug.includes("insurance")) {
    return "Sensitive requests";
  }
  if (slug.includes("archive") || slug.includes("proof") || slug.includes("mail") || slug.includes("formal")) {
    return "Archive and proof";
  }

  return "Core mail flow";
}

function getIntent(page: SeoLandingPage) {
  const slug = page.slug;

  if (slug.includes("invoice") || slug.includes("payment") || slug.includes("late") || slug.includes("overdue")) {
    return "Payment follow-up";
  }
  if (slug.includes("records") || slug.includes("medical")) {
    return "Records request";
  }
  if (slug.includes("landlord") || slug.includes("tenant")) {
    return "Landlord / tenant";
  }
  if (slug.includes("insurance") || slug.includes("consumer-dispute")) {
    return "Dispute / appeal";
  }
  if (slug.includes("compliance") || slug.includes("contract") || slug.includes("service")) {
    return "Compliance notice";
  }

  return "Formal business letter";
}

function getState(): SeoRow["state"] {
  return "Live";
}

function makeRows(): SeoRow[] {
  return seoPages.map((page) => ({
    ...page,
    route: `/${page.slug}`,
    cluster: getCluster(page),
    intent: getIntent(page),
    state: getState(),
  }));
}

export function SeoHubDashboard() {
  const rows = useMemo(() => makeRows(), []);
  const [query, setQuery] = useState("");
  const [cluster, setCluster] = useState("all");
  const [state, setState] = useState("all");

  const clusters = useMemo(() => {
    return ["all", ...new Set(rows.map((row) => row.cluster))];
  }, [rows]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery =
        !normalized ||
        [row.title, row.heading, row.slug, row.description, row.intent, row.cluster]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesCluster = cluster === "all" || row.cluster === cluster;
      const matchesState = state === "all" || row.state === state;
      return matchesQuery && matchesCluster && matchesState;
    });
  }, [cluster, query, rows, state]);

  const routeCount = rows.length;
  const uniqueSlugCount = new Set(rows.map((row) => row.slug)).size;
  const clusterCount = new Set(rows.map((row) => row.cluster)).size;

  return (
    <div className="container-shell py-10 md:py-14">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[color:var(--muted)]">
            <Link href="/admin" className="transition hover:text-[color:var(--foreground)]">
              Admin
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[color:var(--foreground)]">SEO hub</span>
            <Badge tone="accent">{routeCount} live pages</Badge>
          </div>
          <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
            SEO hub
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
            Manage long-tail landing pages, verify sitemap coverage, and keep the internal SEO set aligned with the public templates library.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button href="/sitemap.xml" variant="secondary">
            Open sitemap
            <ExternalLink size={14} />
          </Button>
          <Button href="/robots.txt" variant="secondary">
            View robots
            <ExternalLink size={14} />
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--muted)]">Live routes</p>
            <Globe2 size={16} className="text-[color:var(--accent)]" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{routeCount}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">All SEO pages are wired to public routes and included in the sitemap.</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--muted)]">Sitemap URLs</p>
            <Link2 size={16} className="text-[color:var(--accent)]" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{routeCount}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">The generated sitemap mirrors the SEO page list with no manual duplication.</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--muted)]">Unique slugs</p>
            <CheckCircle2 size={16} className="text-[color:var(--success)]" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{uniqueSlugCount}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Every landing page slug resolves to one canonical route.</p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[color:var(--muted)]">Content clusters</p>
            <Sparkles size={16} className="text-[color:var(--accent)]" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-[color:var(--foreground)]">{clusterCount}</p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Pages are grouped by workflow, billing, archive, and sensitive-request intent.</p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="serif-heading text-3xl font-normal text-[color:var(--foreground)]">Landing pages</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                Search and review the long-tail route set that powers the public SEO footprint.
              </p>
            </div>
            <Badge tone="neutral">{filtered.length} showing</Badge>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.2fr_0.9fr_0.7fr]">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, slug, intent, or description"
                className="pl-9"
              />
            </label>
            <select
              value={cluster}
              onChange={(event) => setCluster(event.target.value)}
              className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            >
              {clusters.map((value) => (
                <option key={value} value={value}>
                  {value === "all" ? "All clusters" : value}
                </option>
              ))}
            </select>
            <select
              value={state}
              onChange={(event) => setState(event.target.value)}
              className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 text-sm text-[color:var(--foreground)] shadow-sm transition focus:border-[color:var(--accent)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-soft)]"
            >
              <option value="all">All states</option>
              <option value="Live">Live only</option>
            </select>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--border)]">
            <div className="hidden grid-cols-[1.45fr_0.95fr_0.9fr_0.55fr_0.7fr] gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid">
              <span>Title</span>
              <span>Slug</span>
              <span>Intent</span>
              <span>State</span>
              <span>Open</span>
            </div>

            <div className="divide-y divide-[color:var(--border)] bg-white">
              {filtered.map((row) => (
                <div key={row.slug} className="grid gap-3 px-4 py-4 md:grid-cols-[1.45fr_0.95fr_0.9fr_0.55fr_0.7fr] md:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[color:var(--foreground)]">{row.title}</p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{row.description}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{row.slug}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">{row.cluster}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[color:var(--foreground)]">{row.intent}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">Public route mirrors the SEO data source.</p>
                  </div>
                  <div className="md:flex md:justify-start">
                    <Badge tone="success">Live</Badge>
                  </div>
                  <div className="flex md:justify-end">
                    <Button href={row.route} variant="secondary" className="px-3 py-2 text-xs">
                      Open
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </div>
              ))}

              {!filtered.length ? (
                <div className="px-4 py-8 text-sm text-[color:var(--muted)]">No pages match the current filters.</div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              <ShieldAlert size={14} />
              Coverage
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-[color:var(--foreground)]">Keep the route set aligned.</h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
              <p>SEO data lives in <span className="font-medium text-[color:var(--foreground)]">src/lib/seo-landing-pages.ts</span>.</p>
              <p>Sitemap entries are generated directly from the same array.</p>
              <p>Use the admin hub to review titles, slugs, and route coverage before adding new variants.</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Sparkles size={14} />
              Indexing notes
            </div>
            <div className="mt-5 space-y-3">
              {[
                "Keep each title and slug unique.",
                "Avoid adding duplicate long-tail variants.",
                "Update sitemap and public route pages together.",
                "Review any sensitive-topic pages before expanding the set.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm leading-6 text-[color:var(--foreground)]">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[color:var(--success)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Globe2 size={14} />
              Quick links
            </div>
            <div className="mt-4 space-y-3">
              {[
                { href: "/templates", label: "Templates source" },
                { href: "/sitemap.xml", label: "Sitemap" },
                { href: "/robots.txt", label: "Robots" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-muted)]"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={14} className="text-[color:var(--accent)]" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-5 py-4 text-sm text-[color:var(--muted)]">
        <span>Source of truth: seo landing pages, sitemap, and robots are generated from the same route set.</span>
        <div className="flex flex-wrap gap-3">
          <Link href="/templates" className="font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent)]">
            Templates source
          </Link>
          <Link href="/sitemap.xml" className="font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent)]">
            Sitemap
          </Link>
          <Link href="/robots.txt" className="font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent)]">
            Robots
          </Link>
        </div>
      </div>
    </div>
  );
}
