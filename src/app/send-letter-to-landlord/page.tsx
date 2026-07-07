import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send Letter to Landlord | MailMyPDF",
};

export default function SendLandlordPage() {
  const page = seoPages[8];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}

