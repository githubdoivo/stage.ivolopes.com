// Renders og-image.jpg (the link preview) from the page itself: the theatre with the curtain down.
//   npm run og
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { chromium } from "playwright";

const root = new URL("..", import.meta.url).pathname;
const types = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".css": "text/css" };
const server = createServer(async (req, res) => {
  const p = new URL(req.url, "http://x").pathname;
  const path = join(root, decodeURIComponent(p === "/" ? "/index.html" : p));
  try { const body = await readFile(path); res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" }); res.end(body); }
  catch { res.writeHead(404).end(); }
}).listen(0);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`http://localhost:${server.address().port}/?lang=en`, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: ".lang, .raise { display: none !important; }" });
await page.waitForTimeout(800);
await page.screenshot({ path: join(root, "og-image.jpg"), type: "jpeg", quality: 85 });
await browser.close();
server.close();
console.log("Wrote og-image.jpg");
