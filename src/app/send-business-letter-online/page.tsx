import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Business Letter Online | ProofPost",
};

export default function SendBusinessLetterPage() {
  const page = seoPages[9];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
