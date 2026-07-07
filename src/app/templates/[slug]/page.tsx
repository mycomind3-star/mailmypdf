import { notFound } from "next/navigation";
import { Button, Card, SectionHeading } from "@/components/ui";
import { templates, type Template } from "@/lib/templates";

const templateFieldMap: Record<string, string[]> = {
  "client-payment-reminder": ["Client name", "Invoice number", "Invoice date", "Amount due", "Due date", "Payment instructions"],
  "scope-change-notice": ["Client or company", "Project name", "Requested change", "Revised deadline", "Contact information"],
  "written-confirmation": ["Recipient name", "Subject", "Requested confirmation", "Deadline", "Contact information"],
  "overdue-invoice-notice": ["Client name", "Invoice number", "Amount due", "Original due date", "Final payment date"],
  "contract-termination": ["Client name", "Agreement name", "Termination date", "Remaining deliverables", "Contact information"],
  "service-suspension": ["Client name", "Service name", "Outstanding balance", "Suspension date", "Payment arrangement"],
  "records-request": ["Recipient organization", "Records requested", "Date range", "Reason optional", "Delivery instructions"],
  "vendor-address-update": ["Old address", "New address", "Effective date", "Reference number", "Contact information"],
  "project-closeout": ["Project name", "Completion date", "Outstanding items", "Final invoice reference", "Document list"],
  "formal-business-letter": ["Recipient name", "Subject", "Opening paragraph", "Main message", "Requested action", "Closing"],
};

function getPreviewCopy(template: Template) {
  return [
    template.title,
    "",
    template.body,
    "",
    "Use the fields on the left to finish the draft, then review the PDF and add addresses before checkout.",
  ].join("\n");
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = templates.find((item) => item.id === slug);

  if (!template) {
    notFound();
  }

  const fields = templateFieldMap[template.id] ?? ["Recipient", "Subject", "Message", "Requested action"];

  return (
    <div className="container-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{template.category}</p>
        <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
          {template.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">{template.summary}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href={`/send?template=${template.id}`}>Use This Template</Button>
          <Button href="/templates" variant="secondary">
            Back to Templates
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <SectionHeading
            title="Required fields"
            description="These are the details ProofPost expects so the letter reads like a serious business record."
          />
          <div className="mt-6 grid gap-3">
            {fields.map((field) => (
              <div key={field} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--foreground)]">
                {field}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            {template.disclaimer}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeading
            title="Example output"
            description="A preview of the letter copy before addresses and checkout."
          />
          <div className="mt-6 rounded-3xl border border-[color:var(--border)] bg-white p-6 shadow-[0_18px_46px_rgba(15,39,66,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Generated preview</p>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{getPreviewCopy(template)}</pre>
          </div>
          <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--muted)]">
            <p className="font-semibold text-[color:var(--foreground)]">Suggested use</p>
            <p className="mt-2">{template.aiPrompt}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
