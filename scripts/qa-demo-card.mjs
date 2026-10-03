#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

mkdirSync("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function onboardAndStart(page) {
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  const getToIt = page.getByRole("button", { name: /^get to it$/i });
  if (await getToIt.count()) {
    await getToIt.click();
    await page.waitForTimeout(600);
  }
  await page.getByRole("button", { name: /start circuit/i }).click();
  await page.waitForTimeout(400);
}

function assertCard(box, label) {
  if (!box) {
    console.error(`${label}: missing demo card`);
    process.exit(1);
  }
  const ratio = box.height / box.width;
  if (box.width < 330) {
    console.error(`${label}: demo is still a thumbnail`, box);
    process.exit(1);
  }
  if (Math.abs(ratio - 1.25) > 0.08) {
    console.error(`${label}: not 4:5`, { ...box, ratio });
    process.exit(1);
  }
}

const stillPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
await stillPage.route("**/*.{mp4,webm}*", (route) => route.abort());
await onboardAndStart(stillPage);
const stillCard = stillPage.getByTestId("demo-card");
await stillCard.waitFor({ timeout: 10000 });
assertCard(await stillCard.boundingBox(), "still");
const stillImg = stillCard.locator("img").first();
if (!(await stillImg.isVisible())) {
  console.error("first paint has no still");
  process.exit(1);
}
await stillPage.screenshot({ path: "/workspace/screenshots/workout-jacks-still-first.png" });
const stillSrc = await stillImg.getAttribute("src");
await stillPage.close();

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await onboardAndStart(page);
await page.waitForTimeout(1800);
const card = page.getByTestId("demo-card");
assertCard(await card.boundingBox(), "video");
const videoSrc = await page.locator("video").first().getAttribute("src");
const pauseButtons = page.getByRole("button", { name: /^pause$/i });
const pauseCount = await pauseButtons.count();
if (pauseCount !== 1) {
  console.error("expected one Pause control", pauseCount);
  process.exit(1);
}
await page.screenshot({ path: "/workspace/screenshots/workout-jacks-phone.png" });

await page.getByRole("button", { name: /^skip$/i }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: "/workspace/screenshots/workout-climber-phone.png" });
const climberName = await page.locator("body").innerText();
if (!/Mountain Climber/i.test(climberName)) {
  console.error("did not reach mountain climber", climberName.slice(0, 240));
  process.exit(1);
}
if (/Skipped /i.test(climberName)) {
  console.error("skip toast still on screen", climberName.slice(0, 300));
  process.exit(1);
}

await page.goto("http://127.0.0.1:8080/exercises/crunch", {
  waitUntil: "networkidle",
  timeout: 20000,
});
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/workout-crunch-phone.png" });

console.log(
  JSON.stringify(
    {
      stillSrc,
      videoSrc,
      card: await card.boundingBox(),
    },
    null,
    2,
  ),
);
await browser.close();
