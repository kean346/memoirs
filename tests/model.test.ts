import assert from "node:assert/strict";
import { test } from "node:test";
import { seed, example, estimate, totals, submit, createQuote, confirmBooking, configSchema } from "../src/lib/model";

test("bridal enquiry retains gown, relationships and idempotent quotation/order", () => {
  const d = seed(), id = submit(d, example);
  const e = d.enquiries.find(e => e.id === id)!;
  assert.equal(e.estimate, 0);
  assert.equal(e.config.gown, "Seraphina — Classic Satin");
  const qid = createQuote(d, id);
  assert.equal(createQuote(d, id), qid);
  const q = d.quotes.find(q => q.id === qid)!;
  // Explicitly entered fixture price, never a prefilled advertised price.
  q.items[0].price = 10000;
  assert.equal(e.estimate, 0);
  assert.throws(() => confirmBooking(d, qid));
  q.status = "Accepted";
  const bid = confirmBooking(d, qid);
  assert.equal(confirmBooking(d, qid), bid);
  assert.equal(d.bookings.length, 1);
  assert.equal(d.bookings[0].enquiryId, id);
  assert.equal(d.bookings[0].total, 10000);
  assert.equal(e.status, "Booked");
  assert.ok(d.clients.some(c => c.id === e.clientId));
  assert.equal(JSON.parse(JSON.stringify(d)).bookings[0].id, bid);
});
test("personalisation and quantity survive snapshot, quotation and serialisation", () => {
  const d = seed();
  const gift = { ...example, occasion: "Personalised Gift", product: "Engraved champagne duo", message: "Sarah", lettering: "Montserrat", textColour: "#A96770", productColour: "#E8C9C5", motif: "Heart", quantity: 4 };
  const id = submit(d, gift);
  gift.message = "Changed";
  const e = d.enquiries.find(e => e.id === id)!;
  assert.equal(e.config.message, "Sarah");
  assert.equal(e.items[0].qty, 4);
  assert.equal(e.items[0].name, "Engraved champagne duo");
  const qid = createQuote(d, id);
  assert.equal(d.quotes.find(q => q.id === qid)!.items[0].qty, 4);
  const saved = JSON.parse(JSON.stringify(e));
  assert.equal(saved.config.textColour, "#A96770");
  assert.equal(saved.config.motif, "Heart");
});
test("integer-cent tax and quantity calculations remain available for entered quotes", () => {
  assert.equal(totals([{ name: "fixture", qty: 2, price: 10001 }], 1000, 500, 15), 23577);
});
test("validation rejects incomplete contact, invalid colours and gift quantity", () => {
  for (const patch of [{ email: "bad" }, { consent: false }, { quantity: 0 }, { quantity: 501 }, { quantity: 1.5 }, { textColour: "red" }, { message: "x".repeat(41) }, { gown: "Invented inventory" }]) {
    assert.equal(configSchema.safeParse({ ...example, ...patch }).success, false);
  }
});
test("business catalogue changes affect future gifts without changing snapshots", () => {
  const d = seed(), c = { ...example, occasion: "Personalised Gift", quantity: 3 };
  const id = submit(d, c);
  d.packages.find(p => p.name === c.product)!.price = 10000;
  assert.equal(totals(estimate(c, d.packages)), 30000);
  assert.equal(d.enquiries.find(e => e.id === id)!.estimate, 0);
});
test("disabled products cannot be submitted from a stale draft", () => {
  const d = seed();
  d.packages.find(p => p.name === example.product)!.enabled = false;
  assert.throws(() => submit(d, { ...example, occasion: "Personalised Gift" }), /no longer available/);
  assert.equal(d.enquiries.length, 1);
});
