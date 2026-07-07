import { Button } from "./ui";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-[1.5fr_1fr] md:items-start">
        <div className="max-w-2xl">
          <p className="serif-heading text-2xl font-normal">MailMyPDF</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[color:var(--muted)]">
            MailMyPDF provides document printing, mailing, and order-record tools. We do not provide legal, tax, financial, or professional advice. Users are responsible for reviewing their documents, addresses, deadlines, and mailing requirements before submitting an order.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <p className="text-sm font-medium text-[color:var(--foreground)]">
            Support: support@mailmypdf.com
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/send" variant="secondary">
              Upload PDF
            </Button>
            <Button href="/#faq" variant="ghost">
              Read FAQ
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}

