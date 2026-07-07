import { FileCheck2, FileText, ShieldCheck } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { proofHighlights, templatePreviewBlocks } from "@/lib/templates";

const reviewRequiredTemplateIds = new Set([
  "client-payment-reminder",
  "overdue-invoice-notice",
  "contract-termination",
  "service-suspension",
  "records-request",
]);

export default function TemplatesPage() {
  return (
    <div className="container-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Templates</p>
        <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
          Templates for serious business letters.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
          Start from a client, vendor, or compliance template for freelancers and small businesses. Every template is informational and should be reviewed before sending.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/send">Create a Proof File</Button>
          <Button href="/#pricing" variant="secondary">
            See pricing
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {templatePreviewBlocks.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{template.category}</p>
                <span className="rounded-full bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold text-slate-600">
                  {template.id}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[color:var(--foreground)]">{template.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{template.summary}</p>
              <p className="mt-4 text-sm leading-6 text-[color:var(--foreground)]">{template.body}</p>
              {reviewRequiredTemplateIds.has(template.id) ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                  Review with counsel or a qualified professional before using this for time-sensitive or rights-affecting matters.
                </div>
              ) : null}
              <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3 text-xs leading-5 text-[color:var(--muted)]">
                {template.disclaimer}
              </div>
              <div className="mt-5">
                <Button href={`/templates/${template.id}`} variant="secondary">
                  View details
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="tag tag--accent" style={{ marginBottom: 14 }}>
              <FileText size={14} />
              AI assistance
            </div>
            <h2 className="text-2xl font-semibold text-[color:var(--foreground)]">Turn rough notes into clean formal letters.</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              ProofPost is built for client work, vendor follow-ups, and internal compliance letters that need to look official and stay archived with a proof packet.
            </p>
          </Card>

          <Card className="p-6">
            <div className="tag tag--success" style={{ marginBottom: 14 }}>
              <ShieldCheck size={14} />
              Proof packet
            </div>
            <div className="space-y-3">
              {proofHighlights.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm">
                  <span className="text-[color:var(--foreground)]">{item}</span>
                  <FileCheck2 size={16} className="text-[color:var(--accent)]" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">Need a different starting point?</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Start from a template, upload your own PDF, or send a letter with the same proof-tracking workflow.
            </p>
            <div className="mt-4">
              <Button href="/send" variant="dark">
                Create a Proof File
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
