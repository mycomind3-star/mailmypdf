import { Button, Card, SectionHeading } from "./ui";

export function SeoPage({
  title,
  heading,
  description,
}: {
  title: string;
  heading: string;
  description: string;
}) {
  return (
    <div className="container-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
        <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
          {heading}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">{description}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/send">Create a Proof File</Button>
          <Button href="/templates" variant="secondary">
            View Templates
          </Button>
          <Button href="/#how-it-works" variant="secondary">
            How it works
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <Card className="p-6">
          <SectionHeading
            title="How it works"
            description="The same simple sequence: pick a template, draft the letter, enter the address, review, and pay."
          />
          <div className="mt-8 space-y-5 text-sm leading-6 text-[color:var(--muted)]">
            <p>1. Start from a template and shape the letter you want archived.</p>
            <p>2. Add sender and recipient details.</p>
            <p>3. Review the file name, page count, and price.</p>
            <p>4. Pay online and receive a secure order link and proof packet.</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Common documents people mail</h2>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
              <li>• Client letters</li>
              <li>• Invoice reminders</li>
              <li>• Vendor follow-ups</li>
              <li>• Compliance letters</li>
            </ul>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Pricing</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
              Starting at $4.99 for 1-2 pages, black-and-white, U.S. mail only, with proof records included.
            </p>
            <div className="mt-5">
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
