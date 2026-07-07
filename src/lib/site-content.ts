export const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const howItWorks = [
  {
    title: "Upload your PDF",
    body: "Drop in a single PDF and we verify file type, size, and page count before you continue.",
  },
  {
    title: "Enter addresses",
    body: "Add the sender and recipient details. U.S. domestic mailing only in this version.",
  },
  {
    title: "Review carefully",
    body: "Review the file name, page count, addresses, and final price before payment.",
  },
  {
    title: "Pay & mail",
    body: "Stripe Checkout handles payment, then the letter is submitted to the mail partner and tracked.",
  },
] as const;

export const pricingBands = [
  {
    pages: "1-2 pages",
    price: "$4.99",
    detail: "Black-and-white, standard U.S. mailing.",
  },
  {
    pages: "3-5 pages",
    price: "$6.99",
    detail: "Best for short business or personal letters.",
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
    question: "Can I send international mail?",
    answer: "No. U.S. domestic mail only.",
  },
  {
    question: "Can I cancel an order?",
    answer: "Only before provider processing starts, or through support review after that.",
  },
  {
    question: "Do you read my document?",
    answer: "Not unless support or abuse review requires it.",
  },
  {
    question: "Is this certified mail?",
    answer: "No. MailMyPDF is not a certified mail replacement.",
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

export const seoPages = [
  {
    slug: "mail-a-pdf",
    title: "Mail a PDF",
    heading: "Mail a PDF online",
    description:
      "Upload a PDF, enter the recipient address, and have it printed and mailed for you.",
  },
  {
    slug: "send-letter-online",
    title: "Send a Letter Online",
    heading: "Send a letter online",
    description:
      "Skip the printer and post office. Upload, address, review, and pay from your browser.",
  },
  {
    slug: "send-a-letter-without-a-printer",
    title: "Send a Letter Without a Printer",
    heading: "Send a letter without a printer",
    description:
      "Upload your PDF, pay online, and mail it as a real physical letter.",
  },
  {
    slug: "print-and-mail-pdf-online",
    title: "Print and Mail PDF Online",
    heading: "Print and mail a PDF online",
    description:
      "MailMyPDF is a simple U.S.-only workflow for turning PDFs into physical letters.",
  },
  {
    slug: "send-documents-by-mail-online",
    title: "Send Documents by Mail Online",
    heading: "Send documents by mail online",
    description:
      "For documents you want printed and mailed without handling envelopes or stamps.",
  },
  {
    slug: "send-letter-to-irs",
    title: "Send a Letter to the IRS",
    heading: "Send a letter to the IRS online",
    description:
      "MailMyPDF helps you print and mail documents. We do not provide tax advice or guarantee acceptance.",
  },
  {
    slug: "send-letter-to-social-security",
    title: "Send a Letter to Social Security",
    heading: "Send a letter to Social Security online",
    description:
      "Use the same simple workflow to mail a PDF without a printer.",
  },
  {
    slug: "send-letter-to-dmv",
    title: "Send a Letter to the DMV",
    heading: "Send a letter to the DMV online",
    description:
      "Upload a PDF, confirm the address, and pay online before we mail it.",
  },
  {
    slug: "send-letter-to-landlord",
    title: "Send a Letter to Your Landlord",
    heading: "Send a letter to your landlord online",
    description:
      "A straightforward way to print and mail a document to a landlord or property manager.",
  },
  {
    slug: "send-business-letter-online",
    title: "Send a Business Letter Online",
    heading: "Send a business letter online",
    description:
      "Turn a PDF into a mailed business letter without handling printing or postage.",
  },
] as const;
