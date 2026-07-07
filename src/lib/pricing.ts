export function calculateLetterPrice(pageCount: number): number {
  if (!Number.isFinite(pageCount) || pageCount <= 0) {
    throw new Error("Invalid page count");
  }

  if (pageCount <= 2) return 499;
  if (pageCount <= 5) return 699;
  if (pageCount <= 10) return 999;

  throw new Error("Maximum page count exceeded");
}

export function pricingCopy(pageCount: number) {
  const priceCents = calculateLetterPrice(pageCount);

  return {
    priceCents,
    label:
      pageCount <= 2
        ? "1-2 pages, black-and-white"
        : pageCount <= 5
          ? "3-5 pages, black-and-white"
          : "6-10 pages, black-and-white",
  };
}

