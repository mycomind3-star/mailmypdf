import { SeoPage } from "@/components/seo-page";
import { seoPages } from "@/lib/site-content";

export const metadata = {
  title: "Send a Letter Without a Printer | MailMyPDF",
};

export default function SendWithoutPrinterPage() {
  const page = seoPages[2];
  return <SeoPage title={page.title} heading={page.heading} description={page.description} />;
}

