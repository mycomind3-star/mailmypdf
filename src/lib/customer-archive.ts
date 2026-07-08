export type ArchiveParty = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type ArchiveOrder = {
  orderId: string;
  token: string;
  createdAt: string;
  status: string;
  proofLevel: string;
  templateTitle: string;
  recipientName: string;
  recipientState: string;
  priceCents: number;
  pageCount: number;
  fileName: string;
  sender: ArchiveParty;
  recipient: ArchiveParty;
};

export type CustomerArchive = {
  orders: ArchiveOrder[];
};

const STORAGE_KEY = "proofpost.customerArchive.v1";

function readStorage(): CustomerArchive {
  if (typeof window === "undefined") {
    return { orders: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { orders: [] };
    const parsed = JSON.parse(raw) as Partial<CustomerArchive>;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { orders: [] };
  }
}

function writeStorage(archive: CustomerArchive) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(archive));
}

export function getCustomerArchive() {
  return readStorage();
}

export function saveCustomerOrder(order: ArchiveOrder) {
  const archive = readStorage();
  const nextOrders = [order, ...archive.orders.filter((item) => item.orderId !== order.orderId)].slice(0, 24);
  writeStorage({ orders: nextOrders });
}

export function clearCustomerArchive() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function collectSenderProfiles(archive: CustomerArchive) {
  const seen = new Set<string>();
  return archive.orders
    .map((order) => order.sender)
    .filter((sender) => {
      const key = [sender.name, sender.line1, sender.city, sender.state, sender.postalCode].join("|").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function collectRecentContacts(archive: CustomerArchive) {
  const seen = new Set<string>();
  return archive.orders
    .map((order) => order.recipient)
    .filter((recipient) => {
      const key = [recipient.name, recipient.line1, recipient.city, recipient.state, recipient.postalCode].join("|").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
