import { Button, Card, SectionHeading } from "@/components/ui";

const tiers = [
  {
    name: "Standard Letter",
    price: "$6.99",
    detail: "For simple business letters and short notices.",
    bullets: ["PDF upload or template start", "Order record included", "U.S. domestic only"],
  },
  {
    name: "Proof Letter",
    price: "$12.99",
    detail: "For more serious correspondence that needs a richer archive.",
    bullets: ["Expanded proof file", "Timeline and receipt", "Recommended for client work"],
  },
  {
    name: "Tracked / Certified Option",
    price: "$24.99",
    detail: "Only show when the provider account supports the option.",
    bullets: ["Tracking when available", "Certified mail when available", "Feature-flagged by environment"],
  },
];

export default function PricingPage() {
  return (
    <div className="container-shell py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Pricing</p>
        <h1 className="serif-heading mt-4 text-5xl font-normal leading-[0.95] text-[color:var(--foreground)] md:text-7xl">
          Simple pricing for serious letters.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--muted)]">
          ProofPost is designed to keep pricing clear before checkout, with optional proof levels for higher-stakes correspondence.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/send">Send a Letter</Button>
          <Button href="/templates" variant="secondary">
            View Templates
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className="p-6">
            <p className="text-sm font-semibold text-[color:var(--foreground)]">{tier.name}</p>
            <p className="serif-heading mt-3 text-4xl text-[color:var(--accent)]">{tier.price}</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{tier.detail}</p>
            <ul className="mt-5 space-y-2 text-sm leading-6 text-[color:var(--muted)]">
              {tier.bullets.map((bullet) => (
                <li key={bullet}>• {bullet}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-[color:var(--border)] bg-white p-6">
        <SectionHeading
          title="Important limitations"
          description="Only show tracked or certified options when the selected provider and account can support them."
        />
        <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
          ProofPost is not legal advice, does not guarantee delivery, and should not be presented as a legal proof-of-service product.
        </p>
      </div>
    </div>
  );
}
