#!/usr/bin/env node
/**
 * QA the public CoreForge SPA: onboarding → home (Male/Female, trash talk) → start circuit.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.argv[2] || "https://black-tree-1904.zerodeploy.app/";
const outDir = "/workspace/screenshots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err?.message || err)));

try {
  const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  const title = await page.title();
  const status = resp?.status() ?? 0;
  await page.screenshot({ path: `${outDir}/pages-live-first.png` });

  const gear = page.getByText("What gear do you have?");
  if (await gear.isVisible().catch(() => false)) {
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /continue/i }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /^Female/ }).click();
    const trash = page.getByRole("button", { name: /Coach talks shit/i });
    if (await trash.isVisible()) {
      const pressed = await trash.locator("p, span").filter({ hasText: /“|\"/ }).count();
      // Toggle on if the sample line is not showing
      const sample = await page.locator("text=/Coach talks shit/").locator("..").locator("text=/“/").count();
      if (sample === 0) await trash.click();
    }
    await page.screenshot({ path: `${outDir}/pages-live-onboarding.png` });
    await page.getByRole("button", { name: /start training/i }).click();
    await page.waitForTimeout(800);
  }

  await page.getByText("Female").first().waitFor({ timeout: 10000 });
  await page.getByText("Male").first().waitFor({ timeout: 5000 });
  const trashHome = page.getByRole("button", { name: /Trash talk/i });
  if (await trashHome.isVisible().catch(() => false)) {
    const label = await trashHome.innerText();
    if (/off/i.test(label)) await trashHome.click();
  }
  await page.screenshot({ path: `${outDir}/pages-live-home.png` });

  const start = page.getByRole("button", { name: /start circuit/i });
  await start.click();
  await page.waitForTimeout(2500);
  const video = page.locator("video").first();
  const videoSrc = (await video.count()) ? await video.getAttribute("src") : null;
  const videoOk =
    !!videoSrc &&
    (videoSrc.includes("/exercises/") || videoSrc.includes("jsdelivr") || videoSrc.endsWith(".mp4"));
  await page.screenshot({ path: `${outDir}/pages-live-workout.png` });

  const body = (await page.locator("body").innerText()).slice(0, 500);
  console.log(
    JSON.stringify(
      {
        url,
        status,
        title,
        videoSrc,
        videoOk,
        errors,
        bodyPreview: body,
      },
      null,
      2,
    ),
  );
  if (status >= 400 || !videoOk) process.exit(1);
} catch (err) {
  await page.screenshot({ path: `${outDir}/pages-live-error.png` }).catch(() => {});
  console.error(JSON.stringify({ ok: false, error: String(err?.message || err), errors }, null, 2));
  process.exit(1);
} finally {
  await browser.close();
}
