/** Fictional demonstration gowns, not confirmed business inventory. */
export type OfficialPackage = { name: string; group: number; slug: string; includes: string[] };
export const gowns = ["Seraphina — Classic Satin", "Aurelia — Romantic Lace", "Celeste — Modern Minimalist", "Vivienne — Statement Bridal", "Elara — Soft Elegance"];
export const gifts = ["Bridal robe", "Champagne flute", "Bridal slippers", "Gift box", "Personalised bridal hanger"];
export const officialPackages: OfficialPackage[] = gowns.map((name, group) => ({ name, group, slug: name.split(" — ")[0].toLowerCase(), includes: ["Fictional demonstration style; not confirmed inventory.", "Request a bridal consultation for availability and pricing."] }));
export const roomExtras = ["Gift wrapping", "Bridal party set", "Personal note"];
export const productURL = () => "/studio";
export const packageGroup = () => 0;
