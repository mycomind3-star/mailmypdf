import { ArrowRight, BadgeCheck, FileCheck2 } from "lucide-react";
import { Button, Card, SectionHeading } from "./ui";
import { FaqList } from "./faq-list";
import { PriceCard } from "./price-card";
import { proofHighlights, templates } from "@/lib/templates";
import { howItWorks, pricingBands } from "@/lib/site-content";

function StepIcon({ index }: { index: number }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-sm font-semibold text-[color:var(--accent)]">
      {index}
    </div>
  );
}

function ProofPanel() {
  return (
    <Card className="reveal-up overflow-hidden">
      <div className="border-b border-[color:var(--border)] px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Proof packet preview</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Every paid order keeps the letter, receipt, and timeline together.</p>
          </div>
          <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-slate-600">
            Secure archive
          </span>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-[color:var(--border)] p-6 md:border-b-0 md:border-r">
          <div className="rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <BadgeCheck size={14} />
                Formal mail
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">Step 1 of 4</span>
            </div>
            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-white p-4 shadow-[0_12px_28px_rgba(15,39,66,0.04)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Selected template</p>
              <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">Formal demand letter</p>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Serious, concise, and reviewable before mailing.
              </p>
            </div>
            <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Document</p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">Letter.pdf</p>
              <p className="text-sm text-[color:var(--muted)]">2 pages</p>
            </div>
          </div>
        </div>
        <div className="space-y-0 border-[color:var(--border)] md:border-l">
          <div className="border-b border-[color:var(--border)] p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Recipient address</p>
            <div className="mt-4 space-y-3">
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">
                Recipient full name
              </div>
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">
                Street address
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">
                  City
                </div>
                <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">
                  State
                </div>
              </div>
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">
                ZIP code
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Review your mail</p>
            <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What you get</p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">Proof packet included</p>
              <p className="text-sm text-[color:var(--muted)]">PDF, receipt, and timeline</p>
            </div>
            <Button className="mt-4 w-full" variant="dark">
              Create a Proof File
            </Button>
            <p className="mt-2 text-center text-xs text-slate-500">Secure payment, secure order link, formal templates</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MarketingPage() {
  const featuredTemplates = templates.slice(0, 6);

  return (
    <>
      <section className="soft-grid border-b border-[color:var(--border)]">
        <div className="container-shell relative overflow-hidden py-16 md:py-20">
          <div className="hero-orb animate-float-slow left-[-4rem] top-[-3rem] h-40 w-40 bg-[rgba(13,120,148,0.08)]" />
          <div className="hero-orb animate-float-delayed right-[-2rem] top-16 h-32 w-32 bg-[rgba(13,120,148,0.06)]" />
          <div className="mx-auto max-w-4xl text-center">
            <div className="reveal-up inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-[0_10px_24px_rgba(15,39,66,0.05)]">
              Templates for serious mail
            </div>
            <h1 className="serif-heading text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
              Send formal letters without a printer, post office, or guesswork.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              ProofPost helps you start from a template, mail a real letter, and keep a clean proof packet for records, disputes, notices, and other important correspondence.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/send">Create a Proof File</Button>
              <Button href="/templates" variant="secondary">
                View Templates
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-[color:var(--muted)]">
              <span className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2">No account required</span>
              <span className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2">Legal-friendly templates</span>
              <span className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2">Proof packet included</span>
            </div>
          </div>

          <div id="how-it-works" className="mt-14 grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <div>
              <SectionHeading
                title="How it works"
                description="Pick a template, upload the document, confirm the addresses, and pay online."
              />
              <div className="mt-8 space-y-5">
                {howItWorks.map((step, index) => (
                  <div key={step.title} className="flex gap-4">
                    <StepIcon index={index + 1} />
                    <div>
                      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <PriceCard pageCount={2} priceCents={499} label="1-2 pages, black-and-white" />
              </div>
            </div>
            <ProofPanel />
          </div>
        </div>
      </section>

      <section id="templates" className="section-space border-b border-[color:var(--border)] bg-white">
        <div className="container-shell">
          <SectionHeading
            title="Template library"
            description="Built for formal letters, records requests, and serious correspondence that deserves a proof packet."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredTemplates.map((template) => (
              <Card key={template.id} className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">{template.category}</p>
                  <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-slate-600">
                    {template.id}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[color:var(--foreground)]">{template.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{template.summary}</p>
                <p className="mt-4 text-sm leading-6 text-[color:var(--foreground)]">{template.body}</p>
                <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs leading-5 text-[color:var(--muted)]">
                  {template.disclaimer}
                </div>
                <div className="mt-5">
                  <Button href={`/send?template=${template.id}`} variant="secondary">
                    Start with this template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/templates" variant="secondary">
              Open full template library <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      <section id="pricing" className="section-space">
        <div className="container-shell">
          <SectionHeading
            title="Simple, transparent pricing"
            description="Black-and-white letters start at $4.99. Pricing is locked before checkout so there are no surprises."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {pricingBands.map((band) => (
              <Card key={band.pages} className="p-6">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{band.pages}</p>
                <p className="serif-heading mt-3 text-4xl text-[color:var(--accent)]">{band.price}</p>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{band.detail}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space border-y border-[color:var(--border)] bg-white">
        <div className="container-shell">
          <SectionHeading
            title="What’s included in the proof packet"
            description="Everything you need for a clean record of what was mailed, when, and to whom."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proofHighlights.map((item) => (
              <Card key={item} className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]">
                    <FileCheck2 size={18} />
                  </div>
                  <p className="text-base font-semibold text-[color:var(--foreground)]">{item}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <SectionHeading
            title="Common reasons people use it"
            description="Formal notices, records requests, housing correspondence, and business letters that need a clean trail."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Send notices without printing at home",
              "Mail records requests from a browser",
              "Ship formal business letters with proof",
            ].map((item) => (
              <Card key={item} className="p-6">
                <p className="text-base font-semibold text-[color:var(--foreground)]">{item}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Start from a template, review the details, and keep the proof packet for records.
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-space">
        <div className="container-shell">
          <SectionHeading
            title="FAQ"
            description="Straight answers to the questions people ask before sending serious mail."
          />
          <div className="mt-8">
            <FaqList />
          </div>
          <div className="mt-10 flex justify-center gap-4">
            <Button href="/send">Create a Proof File</Button>
            <Button href="/templates" variant="secondary">
              View Templates
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
