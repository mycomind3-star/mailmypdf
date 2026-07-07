export type TemplateCategory = "Legal" | "Records" | "Housing" | "Business" | "Operations";

export type Template = {
  id: string;
  category: TemplateCategory;
  title: string;
  summary: string;
  body: string;
  disclaimer: string;
  aiPrompt: string;
};

export const templates: Template[] = [
  {
    id: "formal-demand-letter",
    category: "Legal",
    title: "Formal demand letter",
    summary: "A serious first notice for unresolved obligations or disputes.",
    body:
      "This letter documents the issue, identifies the requested resolution, and asks for written confirmation by the date stated below.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt:
      "Draft a serious, concise demand letter that stays professional and avoids inflammatory language.",
  },
  {
    id: "records-request",
    category: "Records",
    title: "Records request",
    summary: "Request copies of records and a clear delivery timeline.",
    body:
      "Please provide copies of the records listed in the attachment checklist and confirm the expected delivery timeline in writing.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Draft a formal records request with a tidy attachment checklist.",
  },
  {
    id: "written-confirmation",
    category: "Business",
    title: "Request for written confirmation",
    summary: "Ask for receipt confirmation and a named point of contact.",
    body:
      "Please send written confirmation of receipt, next steps, and the name of the person handling this matter so we can keep our records current.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Write a formal request for written confirmation.",
  },
  {
    id: "notice-of-nonpayment",
    category: "Legal",
    title: "Notice of non-payment",
    summary: "A clear follow-up for overdue invoices or balances.",
    body:
      "This letter serves as formal notice that the balance described in the attached records remains unpaid. Please respond in writing with your proposed resolution.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Create a calm but serious non-payment notice.",
  },
  {
    id: "contract-termination",
    category: "Legal",
    title: "Contract termination notice",
    summary: "Formally end an agreement and note remaining deliverables.",
    body:
      "This letter confirms the termination of our current engagement, effective on the date stated below. Please acknowledge receipt and confirm any remaining deliverables.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt:
      "Draft a formal contract termination letter that remains professional and concise.",
  },
  {
    id: "service-suspension",
    category: "Operations",
    title: "Service suspension notice",
    summary: "Warn that services may pause if the issue remains unresolved.",
    body:
      "Unless the outstanding balance is resolved or a written payment arrangement is approved, services may be paused on the date stated in this notice.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Make a clear service suspension notice without legal threats.",
  },
  {
    id: "housing-notice",
    category: "Housing",
    title: "Housing notice",
    summary: "Document a formal notice for landlords or property managers.",
    body:
      "This letter documents the issue, notes the requested action, and requests a written response by the deadline stated below.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Draft a calm housing notice for landlord correspondence.",
  },
  {
    id: "change-of-address",
    category: "Operations",
    title: "Change of address notice",
    summary: "Notify counterparties that your mailing address has changed.",
    body:
      "Please update your records with the new mailing address shown in this letter and confirm once the change has been completed.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Write a simple, official change-of-address notice.",
  },
  {
    id: "project-closeout",
    category: "Business",
    title: "Project closeout notice",
    summary: "Summarize wrap-up items and request written signoff.",
    body:
      "This letter summarizes project closeout, includes remaining deliverables, and requests final written signoff so records are complete.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Create a polished closeout notice with a calm, businesslike tone.",
  },
  {
    id: "formal-business-letter",
    category: "Business",
    title: "General formal business letter",
    summary: "A neutral default for formal business correspondence.",
    body:
      "I am writing to document the request, summarize the issue, and confirm the next step in a clear and professional format.",
    disclaimer:
      "Informational template only. Review before sending. Not legal advice or a substitute for counsel.",
    aiPrompt: "Turn a rough note into a clear, formal business letter.",
  },
];

export const featuredTemplateIds = templates.slice(0, 4).map((template) => template.id);

export const templatePreviewBlocks = templates.slice(0, 6);

export const proofHighlights = [
  "Letter PDF",
  "Recipient address",
  "Sender address",
  "Mail provider status",
  "Receipt and reference number",
  "Timeline of actions",
];
