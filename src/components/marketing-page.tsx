import { Button, Card, SectionHeading } from "./ui";
import { howItWorks, pricingBands } from "@/lib/site-content";
import { FaqList } from "./faq-list";
import { PriceCard } from "./price-card";

function StepIcon({ index }: { index: number }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--border)] bg-white text-sm font-semibold text-[color:var(--accent)]">
      {index}
    </div>
  );
}

function PreviewPanel() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[color:var(--border)] px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Upload your PDF</p>
            <p className="mt-1 text-sm text-[color:var(--muted)]">Drag and drop a PDF up to 10MB.</p>
          </div>
          <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-slate-600">
            Step 1 of 4
          </span>
        </div>
      </div>
      <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-[color:var(--border)] p-6 md:border-b-0 md:border-r">
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[color:var(--border-strong)] bg-[color:var(--surface-muted)] px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[color:var(--accent)] shadow-sm">
              <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4" />
                <path d="m8 8 4-4 4 4" />
                <path d="M4 16.5A4.5 4.5 0 0 1 8.5 12H9" />
                <path d="M20 16.5A4.5 4.5 0 0 0 15.5 12H15" />
                <path d="M6 20h12" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-[color:var(--foreground)]">Drag & drop your PDF here</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">PDF only. Page count and price are checked before checkout.</p>
          </div>
        </div>
        <div className="space-y-0 border-[color:var(--border)] md:border-l">
          <div className="border-b border-[color:var(--border)] p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Recipient address</p>
            <div className="mt-4 space-y-3">
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">Recipient full name</div>
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">Street address</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">City</div>
                <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">State</div>
              </div>
              <div className="h-11 rounded-md border border-[color:var(--border)] bg-white px-3 py-3 text-sm text-slate-400">ZIP code</div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Review your mail</p>
            <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Document</p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">Document.pdf</p>
              <p className="text-sm text-[color:var(--muted)]">2 pages</p>
            </div>
            <Button className="mt-4 w-full" variant="dark">
              Pay & Mail — $6.99
            </Button>
            <p className="mt-2 text-center text-xs text-slate-500">Secure payment</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function MarketingPage() {
  return (
    <>
      <section id="how-it-works" className="soft-grid border-b border-[color:var(--border)]">
        <div className="container-shell py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="serif-heading text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
              Mail a PDF without a printer.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
              Upload your document, enter the recipient’s address, pay online, and we’ll print, stamp, and mail it for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/send">Upload PDF</Button>
              <Button href="#how-it-works" variant="secondary">
                See how it works
              </Button>
            </div>
            <p className="mt-5 text-sm text-[color:var(--muted)]">
              Printed and mailed through professional mail partners.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.84fr_1.16fr] lg:items-start">
            <div>
              <SectionHeading
                title="How it works"
                description="The flow stays simple: upload a PDF, add the mailing address, review the details, and pay online."
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
            <PreviewPanel />
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-[color:var(--border)] bg-white">
        <div className="container-shell section-space">
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

      <section className="section-space">
        <div className="container-shell">
          <SectionHeading
            title="Common reasons people use it"
            description="MailMyPDF stays generic on purpose: simple document mailing, not a business suite or legal product."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              "Send notices without printing at home",
              "Mail business letters from a browser",
              "Ship forms or supporting documents",
            ].map((item) => (
              <Card key={item} className="p-6">
                <p className="text-base font-semibold text-[color:var(--foreground)]">{item}</p>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  Upload a PDF, confirm the address, and let the mail partner handle the physical send.
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
            description="Straight answers to the questions people ask before sending a physical letter."
          />
          <div className="mt-8">
            <FaqList />
          </div>
          <div className="mt-10 flex justify-center">
            <Button href="/send">Upload PDF</Button>
          </div>
        </div>
      </section>
    </>
  );
}
