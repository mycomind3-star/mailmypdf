import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: seoPages[15].title,
};

export default function Page() {
  const page = seoPages[15];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}
