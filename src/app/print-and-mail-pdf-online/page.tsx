import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Print and Mail PDF Online | ProofPost",
};

export default function PrintAndMailPdfPage() {
  const page = seoPages[3];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
