export type ProofLevel = "standard" | "proof" | "tracked_certified";

export type ProofLevelOption = {
  value: ProofLevel;
  label: string;
  detail: string;
};

export const proofLevelOptions: ProofLevelOption[] = [
  {
    value: "standard",
    label: "Standard letter",
    detail: "Proof packet, receipt, and order record.",
  },
  {
    value: "proof",
    label: "Proof letter",
    detail: "Expanded archive for serious client work.",
  },
  {
    value: "tracked_certified",
    label: "Tracked / certified option",
    detail: "Only when the provider account supports it.",
  },
];

export function normalizeProofLevel(value: unknown): ProofLevel {
  return value === "proof" || value === "tracked_certified" ? value : "standard";
}

export function getProofLevelLabel(value: unknown) {
  return proofLevelOptions.find((option) => option.value === normalizeProofLevel(value))?.label ?? "Standard letter";
}
