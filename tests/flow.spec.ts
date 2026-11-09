import { test, expect } from "@playwright/test";

test("gift personalisation persists through enquiry, quotation PDF and confirmed order", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Personalise a Gift", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load Example", exact: true }).click();
  await page.getByRole("button", { name: /Personalised Gift/ }).click();
  await page.getByRole("combobox", { name: "Gift product", exact: true }).selectOption("Bridal robe");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Personalised name or text").fill("Sarah");
  await page.getByLabel("Font style").selectOption("Montserrat");
  await page.getByLabel("Text colour", { exact: true }).fill("#a96770");
  await page.getByLabel("Product colour", { exact: true }).fill("#e8c9c5");
  await page.getByLabel("Decorative motif").selectOption("Heart");
  await page.getByLabel("Quantity", { exact: true }).fill("3");
  await expect(page.getByTestId("preview-name")).toHaveText("Sarah");
  await expect(page.getByTestId("preview-name").locator("..")).toHaveAttribute("fill", "#a96770");
  await expect(page.getByTestId("preview-name").locator("..")).toHaveAttribute("style", /font-sans/);
  await page.reload();
  await expect(page.getByTestId("preview-name")).toHaveText("Sarah");
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Request a Quote", exact: true }).click();
  await expect(page).toHaveURL(/enquiry\/success\/PM-ENQ/);
  await page.getByRole("link", { name: "View in Studio Manager" }).click();
  await expect(page.locator(".summary")).toContainText("Sarah");
  await expect(page.locator(".summary")).toContainText("Bridal robe");
  await page.getByRole("combobox", { name: "Enquiry status", exact: true }).selectOption("In review");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Enquiry status", exact: true })).toHaveValue("In review");
  await page.getByRole("button", { name: "Create / open quotation" }).click();
  await page.getByRole("button", { name: "Edit quotation", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Unit price (BWP)").first().fill("100");
  await page.getByRole("button", { name: "Save quotation", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^PM-QUO.*\.pdf$/);
  const { readFile } = await import("node:fs/promises");
  const saved = test.info().outputPath("quotation.pdf");
  await download.saveAs(saved);
  const bytes = await readFile(saved);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.length).toBeGreaterThan(1000);
  await page.getByRole("button", { name: "Mark accepted" }).click();
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page).toHaveURL(/admin\/calendar/);
  await page.getByRole("button", { name: "2026-11-21, 1 confirmed events", exact: true }).click();
  await expect(page.getByText("2026-11-21 · 18:30 · Block 8, Gaborone, Botswana")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "2026-11-21, 1 confirmed events", exact: true })).toBeVisible();
  const data = await page.evaluate(() => JSON.parse(localStorage.getItem("precious-memoirs-v1")!));
  expect(data.enquiries).toHaveLength(2);
  expect(data.quotes).toHaveLength(1);
  expect(data.bookings).toHaveLength(1);
  expect(data.quotes[0].items[0].qty).toBe(3);
  expect(errors).toEqual([]);
});

test("bridal collection consultation retains selected gown", async ({ page }) => {
  await page.goto("/collections/aurelia");
  await page.getByRole("link", { name: "Request a Consultation", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Selected gown", exact: true })).toHaveValue("Aurelia — Romantic Lace");
  await page.getByRole("button", { name: "Load Example", exact: true }).click();
  await page.getByRole("combobox", { name: "Selected gown", exact: true }).selectOption("Aurelia — Romantic Lace");
  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Request a Consultation", exact: true }).click();
  await page.getByRole("link", { name: "View in Studio Manager" }).click();
  await expect(page.locator(".summary")).toContainText("Aurelia — Romantic Lace");
  await page.reload();
  await expect(page.locator(".summary")).toContainText("Aurelia — Romantic Lace");
});

test("mobile routes, local assets, navigation and reduced motion remain accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/collections", "/collections/seraphina", "/gallery", "/studio", "/admin", "/admin/enquiries", "/admin/quotations", "/admin/bookings", "/admin/calendar", "/admin/clients", "/admin/packages", "/admin/analytics", "/admin/settings"]) {
    await page.goto(route);
    await expect(page.locator("#main")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator("body")).not.toContainText(/KPM|OPULENCE/);
    await page.waitForFunction(() => Array.from(document.images).filter(i => i.getBoundingClientRect().top < innerHeight).every(i => i.complete && i.naturalWidth > 0));
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.locator(".mobile-nav").getByRole("link", { name: "Collections", exact: true }).click();
  await expect(page).toHaveURL(/collections$/);
  await page.goto("/gallery");
  await page.getByRole("button", { name: /Satin, sculpted in light/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("all five gift previews update and invalid quantity is blocked", async ({ page }) => {
  await page.goto("/studio?request=gift");
  for (const product of ["Bridal robe", "Champagne flute", "Bridal slippers", "Gift box", "Personalised bridal hanger"]) {
    await page.getByRole("combobox", { name: "Gift product", exact: true }).selectOption(product);
    await expect(page.getByRole("img", { name: new RegExp(product + ",") })).toBeVisible();
  }
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("0");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("Enter a quantity from 1 to 500.")).toBeVisible();
});

test("desktop hero plays original 4K footage with pause and rotation controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Every Detail. A Precious Memory." })).toBeVisible();
  await page.waitForFunction(() => { const v = document.querySelector<HTMLVideoElement>("video.active"); return !!v && v.videoWidth === 3840 && v.videoHeight === 2160 && !v.paused && v.currentTime > 0; });
  await page.getByRole("button", { name: "Pause background videos" }).click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll("video")).every(v => v.paused));
  await page.getByRole("button", { name: "Play background videos" }).click();
  await expect(page.locator(".cinema-scene").nth(1)).toHaveClass(/active/, { timeout: 15000 });
  await page.screenshot({ path: "/workspace/outputs/precious-memoirs-desktop.png", fullPage: true });
});
