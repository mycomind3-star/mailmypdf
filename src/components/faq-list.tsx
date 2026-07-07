import { faqItems } from "@/lib/site-content";
import { Card } from "./ui";

export function FaqList() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqItems.map((item) => (
        <Card key={item.question} className="p-5">
          <h3 className="text-base font-semibold text-[color:var(--foreground)]">{item.question}</h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.answer}</p>
        </Card>
      ))}
    </div>
  );
}

