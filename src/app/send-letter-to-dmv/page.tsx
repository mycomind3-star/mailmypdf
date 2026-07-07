import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Letter to DMV | ProofPost",
};

export default function SendDmvPage() {
  const page = seoPages[7];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
