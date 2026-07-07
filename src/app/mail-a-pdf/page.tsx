import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Mail a PDF | MailMyPDF",
};

export default function MailAPdfPage() {
  const page = seoPages[0];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}

