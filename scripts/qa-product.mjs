import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

mkdirSync("/workspace/screenshots/product", { recursive: true });

const chrome =
  process.env.CHROME_PATH ||
  ["/usr/local/bin/google-chrome", "/usr/bin/google-chrome"].find(Boolean);

const browser = await chromium.launch({
  headless: true,
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("response", (res) => {
  if (res.status() === 404) errors.push(`404 ${res.url()}`);
});

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const profile = {
  name: "Don",
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
    band: false,
  },
  programStartedAt: new Date().toISOString().slice(0, 10),
  includeGearOverload: true,
  onboarded: true,
  demoModel: "female",
  coachTrashTalk: true,
};

async function seed(extra = {}) {
  await page.evaluate(
    ({ profile, yKey, extra }) => {
      const payload = {
        state: {
          profile,
          history: extra.history ?? [
            {
              id: "seed-y",
              date: yKey,
              startedAt: new Date().toISOString(),
              finishedAt: new Date().toISOString(),
              exercises: [],
              totalCalories: 80,
              programId: "beginner",
            },
          ],
          active: extra.active ?? null,
          favorites: ["crunch", "hollow-hold"],
          customIds: ["plank", "crunch", "hollow-hold", "dead-bug"],
        },
        version: 0,
      };
      localStorage.setItem("coreforge-fitness-v3", JSON.stringify(payload));
    },
    { profile, yKey: dateKey(yesterday), extra },
  );
}

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle", timeout: 45000 });
await seed();
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({
  path: "/workspace/screenshots/product/home-female-trashtalk.png",
  fullPage: true,
});

await page.getByRole("button", { name: "Male", exact: true }).click();
await page.waitForTimeout(400);
await page.screenshot({
  path: "/workspace/screenshots/product/home-male.png",
  fullPage: true,
});
await page.getByRole("button", { name: "Female", exact: true }).click();

await page.goto("http://127.0.0.1:8080/exercises", {
  waitUntil: "networkidle",
  timeout: 45000,
});
await page.waitForTimeout(800);
const libText = await page.locator("body").innerText();
const banned = ["Heel Touch", "Scissor", "Long-Arm", "Toe Touch", "Swimmer"];
const leaked = banned.filter((b) => libText.includes(b));
await page.screenshot({
  path: "/workspace/screenshots/product/library.png",
  fullPage: true,
});

await page.goto("http://127.0.0.1:8080/profile", {
  waitUntil: "networkidle",
  timeout: 45000,
});
await page.waitForTimeout(800);
await page.screenshot({
  path: "/workspace/screenshots/product/profile-coach.png",
  fullPage: true,
});

await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.getByRole("button", { name: /Start circuit/i }).click();
await page.waitForURL("**/workout", { timeout: 15000 });
await page.waitForTimeout(1500);
await page.screenshot({
  path: "/workspace/screenshots/product/workout-warmup.png",
});

// Skip warmup into the work circuit so trash talk overlays the demo
for (let i = 0; i < 2; i++) {
  const skip = page.getByRole("button", { name: /^Skip$/ });
  if (await skip.count()) await skip.click();
  await page.waitForTimeout(700);
}
await page.waitForTimeout(1800);
await page.screenshot({
  path: "/workspace/screenshots/product/workout-trashtalk.png",
});

// Skip through the rest of the session for the finish overlay
for (let i = 0; i < 50; i++) {
  if (await page.getByRole("heading", { name: /session closed|streak|heater/i }).count()) {
    break;
  }
  const skipRest = page.getByRole("button", { name: /Skip rest/i });
  if (await skipRest.count()) {
    await skipRest.click();
    await page.waitForTimeout(200);
    continue;
  }
  const skip = page.getByRole("button", { name: /^Skip$/ });
  if (await skip.count()) {
    await skip.click();
    await page.waitForTimeout(280);
    continue;
  }
  await page.waitForTimeout(200);
}
await page.waitForTimeout(1000);
await page.screenshot({
  path: "/workspace/screenshots/product/celebration.png",
});

// Onboarding
await seed({ history: [] });
await page.evaluate(() => {
  const raw = JSON.parse(localStorage.getItem("coreforge-fitness-v3") || "{}");
  if (raw.state?.profile) raw.state.profile.onboarded = false;
  localStorage.setItem("coreforge-fitness-v3", JSON.stringify(raw));
});
await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.screenshot({
  path: "/workspace/screenshots/product/onboarding-gear.png",
  fullPage: true,
});
await page.getByRole("button", { name: /Continue/i }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Continue/i }).click();
await page.waitForTimeout(600);
await page.screenshot({
  path: "/workspace/screenshots/product/onboarding-coach.png",
  fullPage: true,
});
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) =>
    (b.textContent || "").includes("Coach talks shit"),
  );
  btn?.click();
});
await page.waitForTimeout(400);
await page.screenshot({
  path: "/workspace/screenshots/product/onboarding-trashtalk.png",
  fullPage: true,
});

console.log(JSON.stringify({ leaked, errors: errors.slice(0, 12) }, null, 2));
await browser.close();
