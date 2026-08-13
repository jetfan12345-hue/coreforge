import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await page.evaluate(() => {
  const payload = {
    state: {
      profile: {
        name: "Athlete",
        age: 28,
        weight: 140,
        height: 66,
        weightUnit: "lb",
        heightUnit: "in",
        goal: "definition",
        restSeconds: 10,
        gear: {
          dumbbell: false,
          barbell: false,
          cable: false,
          "pull-up bar": false,
          "ab wheel": false,
          bench: false,
          plate: false,
        },
        programStartedAt: new Date().toISOString().slice(0, 10),
        includeGearOverload: false,
        onboarded: true,
      },
      history: [],
      active: null,
      favorites: ["crunch", "hollow-hold"],
      customIds: ["plank", "crunch", "hollow-hold", "dead-bug"],
    },
    version: 0,
  };
  localStorage.setItem("coreforge-fitness-v3", JSON.stringify(payload));
});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1000);
await page.screenshot({ path: "/workspace/screenshots/home-onboarded-v5.png" });
const homeText = await page.locator("body").innerText();
console.log("home", homeText.slice(0, 250).replace(/\n/g, " | "));

const ids = ["crunch", "hollow-hold", "dead-bug", "flutter-kick", "long-arm-crunch", "reverse-crunch", "bird-dog", "heel-touch", "sit-up", "plank-hip-dip", "plank-shoulder-tap", "toe-touch", "v-up"];
for (const id of ids) {
  await page.goto(`http://127.0.0.1:8080/exercises/${id}`, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1500);
  // try play video if present
  const hasVideo = await page.locator("video").count();
  if (hasVideo) {
    await page.locator("video").first().evaluate((v) => { v.muted = true; return v.play().catch(() => {}); });
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: `/workspace/screenshots/ex-${id}-v5.png` });
  const t = (await page.locator("body").innerText()).slice(0, 160).replace(/\n/g, " | ");
  const hasImg = await page.locator(`img`).count();
  console.log(JSON.stringify({ id, hasVideo, hasImg, t }));
}
console.log("errors", errors.slice(0, 10));
await browser.close();
