import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Documents by Mail Online | ProofPost",
};

export default function SendDocumentsPage() {
  const page = seoPages[4];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
