import { z } from "zod";
export const occasions = ["Bridal Consultation", "Personalised Gift"];
export const styles = ["Ivory Elegance", "Blush Romance", "Champagne Grace", "Dusty Rose", "Burgundy Detail", "Timeless Minimal"];
export const money = (c: number) => c === 0 ? "On request" : new Intl.NumberFormat("en-BW", { style: "currency", currency: "BWP", maximumFractionDigits: 2 }).format(c / 100);
export type Item = { name: string; qty: number; price: number };
export type Package = { name: string; price: number; enabled: boolean };
export type Config = {
  occasion: string;
  gown: string;
  product: string;
  lettering: string;
  textColour: string;
  productColour: string;
  motif: string;
  quantity: number;
  officialPackage?: string;
  extras?: string[];
  style: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  guests: number;
  budget: string;
  name: string;
  email: string;
  phone: string;
  contact: string;
  notes: string;
  message: string;
  reference: string;
  consent: boolean;
};
export const initial: Config = {
  occasion: occasions[0],
  gown: "Seraphina — Classic Satin",
  product: "Bridal robe",
  lettering: "Playfair Display",
  textColour: "#713F4A",
  productColour: "#FAF5F0",
  motif: "None",
  quantity: 1,
  officialPackage: "",
  extras: [],
  style: styles[0],
  date: "2026-11-21",
  time: "18:30",
  location: "Block 8, Gaborone, Botswana",
  venue: "Indoor",
  guests: 2,
  budget: "Let’s discuss",
  name: "",
  email: "",
  phone: "",
  contact: "Email",
  notes: "",
  message: "",
  reference: "",
  consent: false,
};
export const example: Config = {
  ...initial,
  name: "Lerato Mokoena",
  email: "lerato@example.com",
  phone: "DEMO ONLY",
  message: "Sarah",
  consent: true,
};
export const defaults: Package[] = [
  ...occasions.map(name => ({ name, price: 0, enabled: true })),
  ...["Bridal robe", "Champagne flute", "Bridal slippers", "Gift box", "Personalised bridal hanger"].map(name => ({ name, price: 0, enabled: true })),
];
export function estimate(c: Config, p: Package[]): Item[] {
  const gift = c.occasion === "Personalised Gift";
  const name = gift ? c.product : c.gown;
  return [{ name, qty: gift ? c.quantity : 1, price: p.find(p => p.name === name && p.enabled)?.price ?? 0 }];
}
export function totals(items: Item[], charge = 0, discount = 0, tax = 0) {
  const net = Math.max(
    0,
    items.reduce((n, i) => n + i.qty * i.price, 0) + charge - discount,
  );
  return net + Math.round((net * tax) / 100);
}
export const configSchema = z.object({
  occasion: z.enum(["Bridal Consultation", "Personalised Gift"]),
  gown: z.enum(["Seraphina — Classic Satin", "Aurelia — Romantic Lace", "Celeste — Modern Minimalist", "Vivienne — Statement Bridal", "Elara — Soft Elegance"]),
  product: z.enum(["Bridal robe", "Champagne flute", "Bridal slippers", "Gift box", "Personalised bridal hanger"]),
  message: z.string().max(40),
  lettering: z.enum(["Playfair Display", "Montserrat", "Cursive"]),
  motif: z.enum(["None", "Heart", "Botanical"]),
  textColour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  productColour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  quantity: z.number().int().min(1).max(500),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  location: z.string().min(2),
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(5),
  guests: z.number().int().min(1).max(10000),
  consent: z.literal(true),
});
export type Enquiry = {
  id: string;
  clientId: string;
  config: Config;
  items: Item[];
  estimate: number;
  status: string;
  notes: string;
  followup: boolean;
  createdAt: string;
};
export type Quote = {
  id: string;
  enquiryId: string;
  items: Item[];
  charge: number;
  discount: number;
  tax: number;
  deposit: number;
  terms: string;
  validUntil: string;
  status: "Draft" | "Accepted";
  version: number;
};
export type Booking = {
  id: string;
  enquiryId: string;
  quoteId: string;
  total: number;
  notes: string;
};
export type Client = { id: string; name: string; email: string; phone: string };
export type Activity = { id: string; text: string; at: string };
export type Data = {
  version: 1;
  revision: number;
  packages: Package[];
  enquiries: Enquiry[];
  quotes: Quote[];
  bookings: Booking[];
  clients: Client[];
  activity: Activity[];
};
export const uid = (prefix: string) =>
  prefix + "-" + crypto.randomUUID().slice(0, 8).toUpperCase();
export function seed(): Data {
  const c = {
    ...example,
    name: "Amara Sample",
    email: "amara@example.com",
    date: "2026-12-05",
    occasion: "Personalised Gift",
  };
  const items = estimate(c, defaults);
  return {
    version: 1,
    revision: 0,
    packages: defaults,
    enquiries: [
      {
        id: "PM-ENQ-DEMO01",
        clientId: "CLIENT-DEMO01",
        config: c,
        items,
        estimate: totals(items),
        status: "New",
        notes: "Fictional sample enquiry.",
        followup: true,
        createdAt: "2026-11-05T08:00:00Z",
      },
    ],
    quotes: [],
    bookings: [],
    clients: [
      { id: "CLIENT-DEMO01", name: c.name, email: c.email, phone: c.phone },
    ],
    activity: [
      {
        id: "ACT-DEMO01",
        text: "Sample studio opened",
        at: "2026-11-05T08:00:00Z",
      },
    ],
  };
}
export function submit(d: Data, c: Config): string {
  configSchema.parse(c);
  const required = [c.occasion, ...(c.occasion === "Personalised Gift" ? [c.product] : [])];
  if (
    required.some(
      (name) => !d.packages.some((p) => p.name === name && p.enabled),
    )
  )
    throw new Error(
      "A selected service is no longer available. Update your occasion or details before submitting.",
    );
  const id = uid("PM-ENQ");
  let client = d.clients.find((x) => x.email === c.email);
  if (!client) {
    client = {
      id: uid("CLIENT"),
      name: c.name,
      email: c.email,
      phone: c.phone,
    };
    d.clients.push(client);
  }
  const items = estimate(c, d.packages);
  d.enquiries.unshift({
    id,
    clientId: client.id,
    config: { ...c },
    items,
    estimate: totals(items),
    status: "New",
    notes: "",
    followup: false,
    createdAt: new Date().toISOString(),
  });
  return id;
}
export function createQuote(d: Data, id: string) {
  const found = d.quotes.find((q) => q.enquiryId === id);
  if (found) return found.id;
  const e = d.enquiries.find((e) => e.id === id);
  if (!e) throw Error("Enquiry not found");
  const q: Quote = {
    id: uid("PM-QUO"),
    enquiryId: id,
    items: structuredClone(e.items),
    charge: 0,
    discount: 0,
    tax: 0,
    deposit: 50,
    terms:
      "Demonstration quotation. Pricing, consultation dates and product availability require business confirmation. No payment is collected.",
    validUntil: "2026-12-31",
    status: "Draft",
    version: 1,
  };
  d.quotes.push(q);
  e.status = "Quoted";
  return q.id;
}
export function confirmBooking(d: Data, id: string) {
  const q = d.quotes.find((q) => q.id === id);
  if (!q || q.status !== "Accepted")
    throw Error("Accept the quotation before confirming.");
  const existing = d.bookings.find((b) => b.quoteId === id);
  if (existing) return existing.id;
  const b = {
    id: uid("PM-BKG"),
    enquiryId: q.enquiryId,
    quoteId: q.id,
    total: totals(q.items, q.charge, q.discount, q.tax),
    notes: "",
  };
  d.bookings.push(b);
  d.enquiries.find((e) => e.id === q.enquiryId)!.status = "Booked";
  return b.id;
}
