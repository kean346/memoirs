import { test, expect } from "@playwright/test";
import { seed, initial } from "../src/lib/model";

test("gift personalisation persists through enquiry, quotation PDF and confirmed order", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Personalise a Gift", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Load Example", exact: true }).click();
  await page.getByRole("button", { name: /Personalised Gift/ }).click();
  await page.getByRole("combobox", { name: "Gift product", exact: true }).selectOption("Monogrammed satin robe");
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
  await expect(page.locator(".summary")).toContainText("Monogrammed satin robe");
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

test("bridal consultation shows gown and style reference and retains every choice", async ({ page }) => {
  await page.goto("/collections/aurelia");
  await page.getByRole("link", { name: "Request a Consultation", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Selected gown", exact: true })).toHaveValue("Aurelia — Romantic Lace");
  await page.getByRole("button", { name: "Load Example", exact: true }).click();
  await page.getByRole("combobox", { name: "Selected gown", exact: true }).selectOption("Aurelia — Romantic Lace");
  await expect(page.locator(".bridal-preview-pair .moodboard-main img")).toHaveAttribute("src", "/images/gown-1.webp");
  await expect(page.locator(".style-reference")).toHaveAttribute("data-style", "Ivory Elegance");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: /Blush Romance/ }).click();
  await expect(page.locator(".style-reference")).toHaveAttribute("data-style", "Blush Romance");
  await expect(page.locator(".style-reference-image")).toHaveCSS("background-position", "50% 0%");
  await page.evaluate(async () => { const image = new Image(); image.src = "/images/bridal-style-sheet.webp"; await image.decode(); });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Bridal consultation preferences").fill("Ivory lace with blush details");
  await expect(page.locator(".preview-request-note")).toContainText("Ivory lace with blush details");
  await page.locator(".moodboard").screenshot({ path: "/workspace/outputs/bridal-two-image-preview.png" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Additional notes").fill("Please discuss sleeve options");
  await expect(page.locator(".moodboard")).toContainText("Please discuss sleeve options");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Request a Consultation", exact: true }).click();
  await page.getByRole("link", { name: "View in Studio Manager" }).click();
  await expect(page.locator(".summary")).toContainText("Aurelia — Romantic Lace");
  await expect(page.locator(".summary")).toContainText("Blush Romance");
  await expect(page.locator(".summary")).toContainText("Please discuss sleeve options");
  await page.reload();
  await expect(page.locator(".summary")).toContainText("Ivory lace with blush details");
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
  for (const product of ["Monogrammed satin robe", "Engraved champagne duo", "Bridal morning gift set", "Bridesmaid proposal box", "Pearl jewellery keepsake"]) {
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

test("all generated product bases load and selected styling appears in the live preview", async ({ page }) => {
  await page.goto("/studio?request=gift&product=Bridal%20morning%20gift%20set");
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toHaveValue("Bridal morning gift set");
  const paths = ["curated-satin-robe", "curated-champagne-duo", "curated-morning-set", "curated-proposal-box", "curated-jewellery"];
  const names = ["Monogrammed satin robe", "Engraved champagne duo", "Bridal morning gift set", "Bridesmaid proposal box", "Pearl jewellery keepsake"];
  for (let i = 0; i < names.length; i++) {
    await page.getByRole("combobox", { name: "Gift product", exact: true }).selectOption(names[i]);
    await expect(page.locator(".gift-preview image")).toHaveAttribute("href", "/images/" + paths[i] + ".webp");
    await page.evaluate(async src => { const image = new Image(); image.src = src; await image.decode(); if (!image.naturalWidth) throw Error("Missing generated image"); }, "/images/" + paths[i] + ".webp");
  }
  const before = await page.locator(".gift-preview").evaluate(el => getComputedStyle(el).backgroundColor);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: /Blush Romance/ }).click();
  await expect(page.locator(".gift-preview")).toHaveAttribute("data-style", "Blush Romance");
  await expect(page.locator(".preview-style")).toContainText("Blush Romance");
  await expect.poll(() => page.locator(".gift-preview").evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(before);
  await page.reload();
  await expect(page.locator(".gift-preview")).toHaveAttribute("data-style", "Blush Romance");
});

test("depth runway loops, synchronises products and opens the selected gown in the studio", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/collections");
  const scene = page.locator(".runway-stage");
  await expect(page.locator(".runway-model")).toHaveCount(5);
  await page.waitForFunction(() => Array.from(document.querySelectorAll<HTMLImageElement>(".runway-model img")).every(img => img.complete && img.naturalWidth > 0));
  const first = await page.locator(".runway-model").first().getAttribute("style");
  for (const name of ["Aurelia", "Celeste", "Vivienne", "Elara", "Seraphina"]) {
    await page.getByRole("button", { name: "Next gown", exact: true }).click();
    await expect(page.locator(".runway-caption h3")).toContainText(name);
  }
  await scene.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".runway-caption h3")).toContainText("Aurelia");
  await expect(page.locator(".runway-model").first()).not.toHaveAttribute("style", first!);
  await page.locator(".runway-lookbook").screenshot({ path: "/workspace/outputs/depth-lookbook-tested.png" });
  await page.getByRole("link", { name: "Request this silhouette" }).click();
  await expect(page.getByRole("combobox", { name: "Selected gown", exact: true })).toHaveValue("Aurelia — Romantic Lace");
});

test("gift showcase slowly advances without manual controls and opens the simple gift request", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.locator("#keepsakes").scrollIntoViewIfNeeded();
  await expect(page.locator(".cylinder-card")).toHaveCount(5);
  await expect(page.locator("#keepsakes button")).toHaveCount(0);
  await expect(page.locator(".cylinder-camera")).toHaveCSS("perspective", "1350px");
  await expect(page.locator(".cylinder-scene")).toHaveCSS("touch-action", "pan-y");
  const first = await page.locator(".cylinder-card").first().getAttribute("style");
  await expect.poll(() => page.locator(".cylinder-card").first().getAttribute("style")).not.toBe(first);
  const product = await page.locator(".cylinder-index strong").textContent();
  await expect.poll(() => page.locator(".cylinder-index strong").textContent(), { timeout: 16000 }).not.toBe(product);
  await page.locator("#keepsakes").getByRole("link", { name: "Personalise a keepsake", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toBeVisible();
});

test("vertical video categories reveal, autoplay and link to the existing pages on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.locator(".video-categories").scrollIntoViewIfNeeded();
  await expect(page.locator(".video-category")).toHaveCount(3);
  await expect(page.locator(".video-category-grid")).toHaveClass(/is-visible/);
  expect(await page.locator(".video-category video").evaluateAll(videos => new Set(videos.map(v => (v as HTMLVideoElement).getAttribute("src"))).size)).toBe(3);
  await expect(page.locator(".video-category video").first()).toHaveAttribute("src", "/videos/category-bridal.mp4");
  await expect(page.locator(".video-category h2").first()).toHaveCSS("writing-mode", "vertical-lr");
  await page.locator(".video-category").nth(1).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => { const v = document.querySelectorAll<HTMLVideoElement>(".video-category video")[1]; return v && !v.paused && v.currentTime > 0; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "personalise a gift", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toBeVisible();
});

test("4K starts on mobile without interaction even with data saver, repeats and supports byte ranges", async ({ page, request }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true }));
  await page.goto("/");
  await expect(page.locator("video.active")).toHaveAttribute("autoplay", "");
  await page.waitForFunction(() => { const video = document.querySelector<HTMLVideoElement>("video.active"); return !!video && video.videoWidth === 3840 && video.videoHeight === 2160 && !video.paused && video.currentTime > .1; });
  await expect(page.getByRole("button", { name: "Pause background videos" })).toBeVisible();
  await page.locator("video.active").evaluate((el: HTMLVideoElement) => { el.currentTime = el.duration - .3; });
  await page.waitForFunction(() => { const video = document.querySelector<HTMLVideoElement>("video.active"); return !!video && video.currentTime > 0 && video.currentTime < 1; });
  const response = await request.get("/videos/ivory-venue-4k.mp4", { headers: { Range: "bytes=0-1023" } });
  expect(response.status()).toBe(206);
  expect(response.headers()["content-range"]).toMatch(/^bytes 0-1023\//);
  expect((await response.body()).length).toBe(1024);
});


test("home edits remove the named sections, gallery responds to hover and the footer links work", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.locator(".editorial-invitation, #boutique, #your-chapter, .closing")).toHaveCount(0);
  await expect(page.locator("#questions")).toHaveCount(1);
  await page.locator(".inspiration-section").scrollIntoViewIfNeeded();
  await expect(page.locator(".fluid-gallery-item")).toHaveCount(3);
  await expect.poll(() => page.locator(".fluid-gallery-item").first().evaluate(el => Number(getComputedStyle(el).opacity))).toBe(1);
  await expect(page.locator(".fluid-gallery-frame").first()).toHaveCSS("animation-name", "gallery-water");
  const card = page.locator(".fluid-gallery-card").first();
  await card.hover({ position: { x: 50, y: 80 } });
  await expect(card).toHaveAttribute("style", /--magnetic-x/);
  await page.locator(".inspiration-section").screenshot({ path: "/workspace/outputs/flowing-gallery.png" });
  await page.locator(".professional-footer").scrollIntoViewIfNeeded();
  await page.getByRole("link", { name: "Privacy & data", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Privacy & data.", exact: true })).toBeVisible();
  await expect(page.locator(".privacy-information")).toContainText("localStorage");
});

test("homepage personalisation preview carries the name and selected gift into the studio", async ({ page }) => {
  await page.goto("/");
  await page.locator(".personalisation-editorial").scrollIntoViewIfNeeded();
  await page.getByRole("group", { name: "Choose a preview keepsake" }).getByRole("button", { name: "Bridesmaid proposal box", exact: true }).click();
  await page.getByLabel("Try your name").fill("Amelia");
  await expect(page.locator(".teaser-product-sculpture text")).toHaveText("Amelia");
  await page.getByRole("link", { name: "Continue in the studio", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Gift product", exact: true })).toHaveValue("Bridesmaid proposal box");
  await expect(page.getByTestId("preview-name")).toHaveText("Amelia");
  await page.reload();
  await expect(page.getByTestId("preview-name")).toHaveText("Amelia");
});


test("legacy saved gifts keep their history while the new collection is available", async ({ page }) => {
  const data = seed();
  data.packages = [{ name: "Personalised bridal hanger", price: 0, enabled: true }];
  data.enquiries[0].config.product = "Personalised bridal hanger";
  await page.addInitScript(({ data, draft }) => {
    localStorage.setItem("precious-memoirs-v1", JSON.stringify(data));
    localStorage.setItem("precious-memoirs-v1-draft", JSON.stringify(draft));
  }, { data, draft: { ...initial, product: "Personalised bridal hanger", message: "Amelia" } });
  await page.goto("/studio?request=gift");
  const products = page.getByRole("combobox", { name: "Gift product", exact: true });
  await expect(products).toHaveValue("Bridal morning gift set");
  await expect(products.locator("option")).toHaveCount(5);
  await expect(products).not.toContainText("hanger");
  await products.selectOption("Pearl jewellery keepsake");
  await expect(page.getByTestId("preview-name")).toHaveText("Amelia");
  const history = await page.evaluate(() => JSON.parse(localStorage.getItem("precious-memoirs-v1")!).enquiries[0].config.product);
  expect(history).toBe("Personalised bridal hanger");
});
