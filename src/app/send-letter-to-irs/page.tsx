import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Letter to IRS | ProofPost",
};

export default function SendIrsPage() {
  const page = seoPages[5];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
