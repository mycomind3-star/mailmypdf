import type { Metadata } from "next";
import { Button, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Order lookup | ProofPost",
  description: "Open a secure ProofPost order link from your receipt or archive.",
};

export default function OrdersIndexPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <div className="max-w-2xl">
        <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)] md:text-5xl">
          Order lookup
        </h1>
        <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
          Use the secure order link from your receipt or archive to open a specific letter record. This page stays intentionally simple so it never exposes order data without the correct token.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Open a secure order</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            If you received a receipt or proof packet, use the full order link from that message to view the live status, timeline, and downloads.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button href="/archive">Open archive</Button>
            <Button href="/send" variant="secondary">
              Create a proof file
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[color:var(--foreground)]">Need help?</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
            If a secure link is missing or expired, start from the archive or create a new proof file and keep the token-safe link from your confirmation email.
          </p>
          <div className="mt-5">
            <Button href="/" variant="secondary">
              Return home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
