import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, existsSync } from "node:fs";

const root = new URL("..", import.meta.url).pathname;
const inView = (b, vp) => b && b.x >= -1 && b.y >= -1 && b.x + b.width <= vp.width + 1 && b.y + b.height <= vp.height + 1;
const raise = async (page) => {
  await page.locator("#raise").click();
  await expect(page.locator("#board")).toHaveClass(/down/);
  await page.waitForTimeout(2300);  // curtain out, board down, props in
};
// Read content.js the way the browser does
const STAGE = (() => { const window = {}; eval(readFileSync(root + "content.js", "utf8")); return window.STAGE; })();

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.clear(); } catch (_) {} });
});

test("the theatre renders with no errors and every image loads", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("requestfailed", (r) => errors.push(`failed: ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`${r.status()}: ${r.url()}`); });
  await page.goto("/?lang=en");
  await expect(page.locator("h1.cartouche")).toHaveText("Stage");
  await raise(page);
  await page.locator("#open-programme").click();
  await expect(page.locator("#sheet")).toBeVisible();
  const broken = await page.$$eval("img", (ims) => ims.filter((i) => i.complete && i.naturalWidth === 0 && !i.loading).map((i) => i.src));
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});

test("before the show, the only buttons are the language and Raise the Curtain", async ({ page }) => {
  await page.goto("/?lang=en");
  const visible = await page.$$eval("button, a[href]", (els) => els.filter((e) => {
    const s = getComputedStyle(e); const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && Number(s.opacity) > 0.05 && !e.closest("[hidden]") && !e.closest(".props");
  }).map((e) => e.id || e.className));
  expect(visible.sort()).toEqual(["lang", "raise"]);
  await expect(page.locator("#raise")).toHaveText("Raise the Curtain");
  // the props are not reachable by keyboard until the curtain is up
  for (const id of ["prev", "next", "open-programme", "open-card"]) await expect(page.locator(`#${id}`)).toHaveAttribute("tabindex", "-1");
});

test("raising the curtain brings down the title board and the props", async ({ page }) => {
  await page.goto("/?lang=en");
  await raise(page);
  await expect(page.locator("#c-title")).toHaveText(STAGE.en.scenes[0].title);
  await expect(page.locator("#raise")).toHaveCSS("opacity", "0");
  for (const id of ["prev", "next", "open-programme", "open-card"]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute("tabindex", "0");
    await expect(page.locator(`#${id}`)).toHaveAttribute("aria-label", /\S/);
  }
  await expect(page.locator("#next")).toBeFocused();
});

test("the tassels and the arrow keys change the performance", async ({ page }) => {
  test.skip(STAGE.en.scenes.length < 2, "needs two performances");
  await page.goto("/?lang=en");
  await raise(page);
  const title = page.locator("#c-title");
  await page.locator("#next").click({ force: true });  // the tassels sway, so they are never "still"
  await expect(title).toHaveText(STAGE.en.scenes[1].title, { timeout: 4000 });
  await expect(page.locator("#scenes img.on")).toHaveAttribute("src", `img/${STAGE.en.scenes[1].img}.webp`);
  await page.waitForTimeout(1400);
  await page.locator("#prev").click({ force: true });
  await expect(title).toHaveText(STAGE.en.scenes[0].title, { timeout: 4000 });
  await page.waitForTimeout(1400);
  await page.keyboard.press("ArrowLeft");   // wraps round to the last one
  await expect(title).toHaveText(STAGE.en.scenes.at(-1).title, { timeout: 4000 });
});

test("the prompter's shell lowers the programme; Esc puts it away and focus comes back", async ({ page }) => {
  await page.goto("/?lang=en");
  await raise(page);
  await page.locator("#open-programme").click();
  const sheet = page.locator("#sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveAttribute("role", "dialog");
  await expect(page.locator("#p-title")).toHaveText("Programme");
  await expect(page.locator("#groups .group")).toHaveCount(STAGE.en.groups.length);
  await expect(sheet.locator("[data-away]")).toBeFocused({ timeout: 2000 });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden({ timeout: 2000 });
  await expect(page.locator("#open-programme")).toBeFocused();
});

test("the messenger brings the contact card, with the email; ✕ and a tap outside close it", async ({ page }) => {
  await page.goto("/?lang=en");
  await raise(page);
  await page.locator("#open-card").click();
  const card = page.locator("#card");
  await expect(card).toBeVisible();
  await expect(card.locator("a.mail")).toHaveAttribute("href", "mailto:mail@ivolopes.com");
  await expect(card).toContainText("Get in Touch");
  await expect(card.locator("#copy")).toHaveText("Copy Email");
  await page.waitForTimeout(1000);
  await card.locator("[data-away]").click();
  await expect(card).toBeHidden({ timeout: 2000 });
  await page.locator("#open-card").click();
  await expect(card).toBeVisible();
  await page.waitForTimeout(1000);
  await page.mouse.click(8, page.viewportSize().height / 2);   // the veil
  await expect(card).toBeHidden({ timeout: 2000 });
});

test("Portuguese: from the browser, from ?lang=pt, and remembered after switching", async ({ browser }) => {
  const ctx = await browser.newContext({ locale: "pt-PT" });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "pt");
  await expect(page.locator("#raise")).toHaveText("Subir o Pano");
  await page.locator("#lang").click();
  await expect(page.locator("#raise")).toHaveText("Raise the Curtain");
  await page.reload();
  await expect(page.locator("#raise")).toHaveText("Raise the Curtain");
  await page.goto("/?lang=pt");
  await expect(page.locator("#lang")).toHaveText("EN");
  await ctx.close();
});

test("both languages have the same performances and programme, and every backdrop exists", () => {
  expect(STAGE.pt.scenes.length).toBe(STAGE.en.scenes.length);
  expect(STAGE.pt.groups.length).toBe(STAGE.en.groups.length);
  STAGE.en.scenes.forEach((s, i) => {
    expect(STAGE.pt.scenes[i].img).toBe(s.img);
    expect(existsSync(`${root}img/${s.img}.webp`), s.img).toBe(true);
  });
  for (const g of STAGE.en.groups) expect(existsSync(`${root}img/ink-${g.icon}.webp`), g.icon).toBe(true);
});

test("English labels use Title Case", () => {
  const small = new Set(["a", "an", "and", "the", "of", "in", "on", "to", "for", "at", "by", "or"]);
  const e = STAGE.en;
  for (const label of [e.raise, e.prev, e.next, e.progTag, e.cardTag, e.openProg, e.openCard, e.away, e.copy, e.programme, e.programmeSub, e.cardTitle]) {
    const words = label.split(/\s+/);
    words.forEach((w, i) => { if (i === 0 || !small.has(w.toLowerCase())) expect(w[0], `"${label}"`).toBe(w[0].toUpperCase()); });
  }
});

test("the site never links to the hub or to the other areas", async ({ page }) => {
  await page.goto("/");
  const hosts = await page.$$eval("a[href]", (as) => as.map((a) => a.href).filter((h) => h.startsWith("http")).map((h) => new URL(h).host));
  expect(hosts.filter((h) => h.endsWith("ivolopes.com"))).toEqual([]);
});

test("the cartouche, the button and the props stay on screen, with no sideways scroll", async ({ page }) => {
  for (const vp of [{ width: 340, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }, { width: 1920, height: 1000 }, { width: 2560, height: 1080 }]) {
    await page.setViewportSize(vp);
    await page.goto("/?lang=en");
    await page.waitForTimeout(200);
    for (const sel of ["h1.cartouche", "#raise", "#lang"]) expect(inView(await page.locator(sel).boundingBox(), vp), `${sel} at ${vp.width}x${vp.height}`).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), `${vp.width}`).toBeLessThanOrEqual(0);
    await raise(page);
    for (const sel of ["#prev", "#next", "#open-programme", "#open-card"]) expect(inView(await page.locator(sel).boundingBox(), vp), `${sel} at ${vp.width}x${vp.height}`).toBe(true);
  }
});

test("touch targets are at least 44px", async ({ page, isMobile }) => {
  test.skip(!isMobile, "phone only");
  await page.goto("/?lang=en");
  for (const sel of ["#lang", "#raise"]) {
    const b = await page.locator(sel).boundingBox();
    expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(44);
  }
  await raise(page);
  for (const sel of ["#prev", "#next", "#open-programme", "#open-card"]) {
    const b = await page.locator(sel).boundingBox();
    expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(44);
  }
  await page.locator("#open-card").click();
  await page.waitForTimeout(1000);
  for (const sel of ["#card [data-away]", "#copy"]) {
    const b = await page.locator(sel).boundingBox();
    expect(Math.min(b.width, b.height), sel).toBeGreaterThanOrEqual(44);
  }
});

test("with reduced motion, everything still works, straight away", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/?lang=en");
  await page.locator("#raise").click();
  await expect(page.locator("#c-title")).toHaveText(STAGE.en.scenes[0].title);
  await page.locator("#open-card").click();
  await expect(page.locator("#card")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#card")).toBeHidden();
  await ctx.close();
});

test("no serious accessibility problems, before and after the curtain rises", async ({ page }) => {
  await page.goto("/?lang=en");
  const check = async (when) => {
    const r = await new AxeBuilder({ page }).analyze();
    const bad = r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(", ")}`);
    expect(bad, when).toEqual([]);
  };
  await check("curtain down");
  await raise(page);
  await check("curtain up");
  await page.locator("#open-programme").click();
  await page.waitForTimeout(1000);
  await check("programme open");
});
