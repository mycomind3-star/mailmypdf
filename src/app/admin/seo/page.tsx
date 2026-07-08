import type { Metadata } from "next";
import { SeoHubDashboard } from "@/components/seo-hub-dashboard";

export const metadata: Metadata = {
  title: "SEO hub | ProofPost",
  description: "Admin hub for managing ProofPost SEO landing pages and sitemap coverage.",
};

export default function SeoHubPage() {
  return <SeoHubDashboard />;
}
