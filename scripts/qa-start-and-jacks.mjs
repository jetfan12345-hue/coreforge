#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

mkdirSync("/workspace/screenshots", { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

function seedFirstRunHome() {
  return page.evaluate(() => {
    localStorage.setItem(
      "coreforge-fitness-v3",
      JSON.stringify({
        state: {
          profile: {
            name: "Athlete",
            age: 30,
            weight: 180,
            height: 70,
            weightUnit: "lb",
            heightUnit: "in",
            goal: "definition",
            restSeconds: 10,
            gear: {
              barbell: false,
              plate: false,
              cable: false,
              "pull-up bar": false,
              "ab wheel": false,
              dumbbell: false,
              band: false,
              bench: false,
            },
            programStartedAt: new Date().toISOString().slice(0, 10),
            includeGearOverload: true,
            onboarded: true,
            demoModel: "female",
            coachTrashTalk: false,
          },
          history: [],
          active: null,
          favorites: [],
          customIds: [],
        },
        version: 0,
      }),
    );
  });
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/start-get-to-it.png" });
const startText = await page.locator("body").innerText();
if (!/Get to it/i.test(startText) || !/Enter some details/i.test(startText)) {
  console.error("missing start CTAs", startText.slice(0, 400));
  process.exit(1);
}

await page.getByRole("button", { name: /enter some details/i }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: "/workspace/screenshots/start-details.png" });
await page.getByRole("button", { name: /back/i }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: /^get to it$/i }).click();
await page.waitForURL("**/workout", { timeout: 15000 });
await page.waitForTimeout(900);
await page.screenshot({ path: "/workspace/screenshots/workout-after-get-to-it.png" });
const afterGetToIt = await page.locator("body").innerText();
if (!/jumping jacks/i.test(afterGetToIt)) {
  console.error("Get to it did not start beginner warmup", afterGetToIt.slice(0, 400));
  process.exit(1);
}
if (/don't be a pussy/i.test(afterGetToIt) || /Coach talks shit/i.test(afterGetToIt)) {
  console.error("Get to it path leaked trash talk", afterGetToIt.slice(0, 400));
  process.exit(1);
}

await seedFirstRunHome();
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/home-first-run.png" });
const startBox = await page.getByRole("button", { name: /^start circuit$/i }).boundingBox();
if (!startBox || startBox.y + startBox.height > 760) {
  console.error("Start circuit is below the fold", startBox);
  process.exit(1);
}
const homeText = await page.locator("body").innerText();
const homeBad = [
  /Your gear/i,
  /Rest between moves/i,
  /Trash talk/i,
  /Coach talks shit/i,
  /Advanced forge/i,
  /Pure bodyweight forge/i,
  /don't be a pussy/i,
  /How sessions work/i,
  /This week/i,
  /Program week/i,
  /Resume workout/i,
  /Month 2/i,
].filter((re) => re.test(homeText));
if (homeBad.length) {
  console.error("first-run home still a manual", homeBad.map(String), homeText.slice(0, 600));
  process.exit(1);
}
if (
  !/Start circuit/i.test(homeText) ||
  !/Month 1/i.test(homeText) ||
  !/Beginner/i.test(homeText) ||
  !/Warm-up/i.test(homeText) ||
  !/floor circuit/i.test(homeText)
) {
  console.error("first-run home missing Start / Month 1 Beginner line", homeText.slice(0, 400));
  process.exit(1);
}
if (/Resume/i.test(homeText)) {
  console.error("first-run stacked a fake Resume", homeText.slice(0, 400));
  process.exit(1);
}

await page.getByRole("navigation").getByRole("link", { name: /^you$/i }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: "/workspace/screenshots/profile-you.png" });
const youText = await page.locator("body").innerText();
if (!/Coach talks shit/i.test(youText) || !/Off by default/i.test(youText)) {
  console.error("profile missing optional trash-talk toggle", youText.slice(0, 500));
  process.exit(1);
}
await page.getByRole("navigation").getByRole("link", { name: /^home$/i }).click();
await page.waitForTimeout(400);

await page.getByRole("button", { name: /^start circuit$/i }).click();
await page.waitForURL("**/workout", { timeout: 15000 });
await page.waitForTimeout(2500);
const video = page.locator("video").first();
const src = await video.getAttribute("src");
await page.screenshot({ path: "/workspace/screenshots/workout-jacks-phone.png" });
const workoutText = await page.locator("body").innerText();
if (!/jumping jacks/i.test(workoutText)) {
  console.error("Start circuit did not open beginner warmup", workoutText.slice(0, 400));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      videoSrc: src,
      startHasGetToIt: /Get to it/.test(startText),
      startHasDetails: /Enter some details/.test(startText),
      workoutText: workoutText.slice(0, 280).replace(/\n/g, " | "),
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exit(2);
await browser.close();
