export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/archive", label: "Archive" },
  { href: "/templates", label: "Templates" },
  { href: "/send", label: "Send" },
  { href: "/pricing", label: "Pricing" },
  { href: "/settings", label: "Settings" },
  { href: "/#faq", label: "FAQ" },
] as const;

export const howItWorks = [
  {
    title: "Choose a template",
    body: "Start from a client, vendor, or compliance letter that fits the job instead of a blank page.",
  },
  {
    title: "Polish the draft",
    body: "Tighten the tone, shorten the copy, or make it calmer before you preview the final letter.",
  },
  {
    title: "Upload or preview the PDF",
    body: "Attach your final PDF or use the browser preview to review the generated letter before checkout.",
  },
  {
    title: "Validate the addresses",
    body: "Confirm sender and recipient details so the final proof file is clean and ready to archive.",
  },
  {
    title: "Pay and archive",
    body: "Stripe Checkout handles test payments for now, then the order record and proof file are saved together.",
  },
] as const;

export const pricingBands = [
  {
    pages: "1-2 pages",
    price: "$4.99",
    detail: "Black-and-white, standard U.S. proof-file workflow.",
  },
  {
    pages: "3-5 pages",
    price: "$6.99",
    detail: "Best for short business or client letters.",
  },
  {
    pages: "6-10 pages",
    price: "$9.99",
    detail: "For longer documents that still stay within the service limits.",
  },
] as const;

export const faqItems = [
  {
    question: "What file types do you accept?",
    answer: "PDF only for now.",
  },
  {
    question: "Do I need an account?",
    answer: "No. Guest checkout is the default.",
  },
  {
    question: "Can I use this for client letters?",
    answer: "Yes. It is built for freelancers, small businesses, and other formal correspondence that needs a clean record.",
  },
  {
    question: "Can I send international mail?",
    answer: "Not in phase 1. The first release is U.S.-focused and proof-file oriented.",
  },
  {
    question: "Can I cancel an order?",
    answer: "Only before the mock checkout completes, or through support review after that.",
  },
  {
    question: "Do you read my document?",
    answer: "Only enough to support the preview and proof file workflow.",
  },
  {
    question: "Is this certified mail?",
    answer: "No. ProofPost is not a certified mail replacement.",
  },
] as const;

export const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Builder, preview, proof file",
    body: "Template selection, AI polish mock, address validation, Stripe test checkout, dashboard, and a clean proof file.",
  },
  {
    phase: "Phase 2",
    title: "One real mail provider",
    body: "Add Lob or PostGrid, real status updates, and webhook handling when the business is ready for production mail.",
  },
  {
    phase: "Phase 3",
    title: "AI writing assistant",
    body: "Formalize drafts, shorten them, calm the tone, and generate final copy before checkout.",
  },
  {
    phase: "Phase 4",
    title: "Subscriptions",
    body: "Saved sender profiles, saved contacts, monthly letters, and a fuller proof archive.",
  },
  {
    phase: "Phase 5",
    title: "New niches",
    body: "Expand into freelancers, landlords, tenants, medical records, insurance, consumer disputes, and compliance letters.",
  },
] as const;

export const orderStatusLabels: Record<string, string> = {
  draft: "Draft",
  uploaded: "Uploaded",
  priced: "Ready to pay",
  checkout_created: "Awaiting payment",
  paid: "Payment received",
  submitted_to_provider: "Submitted for mailing",
  provider_processing: "Preparing your letter",
  mailed: "Mailed",
  in_transit: "In transit",
  delivered: "Delivered",
  returned: "Returned",
  failed_payment: "Payment failed",
  failed_provider_submission: "Needs review",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;

export { seoPages } from "./seo-landing-pages";
