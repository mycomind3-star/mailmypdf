import { Button, Card } from "./ui";

export function CancelPage() {
  return (
    <div className="container-shell py-16">
      <div className="mx-auto max-w-xl">
        <Card className="p-8 text-center">
          <h1 className="serif-heading text-4xl font-normal text-[color:var(--foreground)]">Checkout cancelled.</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">
            Your proof file was not completed. You can return to review the PDF and addresses when you’re ready.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button href="/send">Return to review</Button>
            <Button href="/" variant="secondary">
              Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
