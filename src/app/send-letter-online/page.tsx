import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Letter Online | ProofPost",
};

export default function SendLetterOnlinePage() {
  const page = seoPages[1];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
