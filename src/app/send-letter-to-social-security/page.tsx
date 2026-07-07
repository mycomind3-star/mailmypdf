import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Letter to Social Security | ProofPost",
};

export default function SendSocialSecurityPage() {
  const page = seoPages[6];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
