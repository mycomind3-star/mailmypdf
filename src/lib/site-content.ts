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
  submitted_to_provider: "Proof file created",
  provider_processing: "Preparing proof file",
  mailed: "Archived",
  in_transit: "In transit",
  delivered: "Delivered",
  returned: "Returned",
  failed_payment: "Payment failed",
  failed_provider_submission: "Needs review",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;

export const seoPages = [
  {
    slug: "mail-a-pdf",
    title: "Mail a PDF | ProofPost",
    heading: "Mail a PDF online",
    description:
      "Upload a PDF, create a formal letter record, and keep a clean proof file for client work.",
  },
  {
    slug: "send-letter-online",
    title: "Send a Letter Online | ProofPost",
    heading: "Send a letter online",
    description:
      "Skip the printer and post office. Build, review, and archive professional business letters from your browser.",
  },
  {
    slug: "send-a-letter-without-a-printer",
    title: "Send a Letter Without a Printer | ProofPost",
    heading: "Send a letter without a printer",
    description:
      "Create a serious client letter, validate the address, and pay without touching a printer.",
  },
  {
    slug: "print-and-mail-pdf-online",
    title: "Print and Mail PDF Online | ProofPost",
    heading: "Print and mail a PDF online",
    description:
      "ProofPost is a U.S.-focused workflow for turning PDFs into formal business mail with proof records.",
  },
  {
    slug: "send-documents-by-mail-online",
    title: "Send Documents by Mail Online | ProofPost",
    heading: "Send documents by mail online",
    description:
      "For client letters, notices, and records you want to send without handling envelopes or stamps.",
  },
  {
    slug: "send-letter-to-irs",
    title: "Send a Letter to the IRS | ProofPost",
    heading: "Send a letter to the IRS online",
    description:
      "ProofPost helps you format and archive formal letters. We do not provide tax advice or guarantee acceptance.",
  },
  {
    slug: "send-letter-to-social-security",
    title: "Send a Letter to Social Security | ProofPost",
    heading: "Send a letter to Social Security online",
    description:
      "Use the same workflow to archive a formal letter without a printer.",
  },
  {
    slug: "send-letter-to-dmv",
    title: "Send a Letter to the DMV | ProofPost",
    heading: "Send a letter to the DMV online",
    description:
      "Upload a PDF, confirm the address, and pay online before you archive it.",
  },
  {
    slug: "send-letter-to-landlord",
    title: "Send a Letter to Your Landlord | ProofPost",
    heading: "Send a letter to your landlord online",
    description:
      "A straightforward way to create a formal letter record for a landlord or property manager.",
  },
  {
    slug: "send-business-letter-online",
    title: "Send a Business Letter Online | ProofPost",
    heading: "Send a business letter online",
    description:
      "Turn a PDF into a polished business letter without handling printing or postage.",
  },
] as const;
