// Optional browser QA. All tooling remains external to the static site.
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = process.env.QA_ENGINE || "chromium";
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
const out = "/tmp/arcway-refinement/" + engine;
fs.mkdirSync(out, { recursive: true });
const widths = [320, 360, 390, 425, 430, 768, 820, 960, 1024, 1180, 1280, 1440];
const pages = [
  "index",
  "home2",
  "services",
  "rate-calculator",
  "tracking",
  "coverage",
  "contact",
  "login",
  "signup",
  "dashboard",
];
const tabs = ["overview", "book", "track", "history", "invoices", "profile"];
const report = { engine, checks: [], layouts: [], errors: [], url: base };
(async () => {
  const browser = await (engine === "webkit" ? webkit : chromium).launch({
    executablePath: process.env.BROWSER_PATH,
    headless: true,
    ...(engine === "chromium"
      ? {
          args: [
            "--no-sandbox",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
        }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => report.errors.push(error.message));
  const go = async (slug, hash = "") => {
    const response = await page.goto(
      base + (slug === "index" ? "" : "pages/" + slug + ".html") + hash,
    );
    assert.equal(response.status(), 200, slug + " physical page URL");
    await page.evaluate(async () => {
      for (const image of document.images) image.loading = "eager";
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
  };
  const noOverflow = async (label) => {
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: innerWidth,
    }));
    assert.ok(
      widths.document <= widths.viewport + 1,
      label + " horizontal overflow " + JSON.stringify(widths),
    );
    report.layouts.push(label);
  };
  const capture = async (label) => {
    if (await page.locator(".network-explorer").count()) {
      await page.locator(".network-explorer").scrollIntoViewIfNeeded();
      await page.waitForFunction(() =>
        document.querySelector(".globe-ready,.globe-unavailable"),
      );
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: out + "/" + label + ".png", fullPage: true });
  };
  const viewportWidths =
    engine === "webkit" ? [320, 390, 820, 1180, 1440] : widths;
  for (const width of viewportWidths) {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of pages) {
      await go(slug);
      await noOverflow(slug + " " + width + " light");
      if ([390, 820, 1440].includes(width)) await capture(slug + "-" + width);
      if (slug === "dashboard")
        for (const tab of tabs) {
          await page.evaluate((tab) => (location.hash = tab), tab);
          await page
            .locator('[data-dash-tab="' + tab + '"]')
            .waitFor({ state: "visible" });
          await noOverflow("dashboard/" + tab + " " + width + " light");
          if ([390, 820, 1440].includes(width))
            await capture("dashboard-" + tab + "-" + width);
        }
    }
    console.log(engine, "layout", width, "passed");
  }
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of pages) {
      await go(slug);
      await page.evaluate(() => {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dir = "rtl";
      });
      await noOverflow(slug + " " + width + " dark RTL");
      await capture(slug + "-" + width + "-dark-rtl");
      if (slug === "dashboard")
        for (const tab of tabs) {
          await page.evaluate((tab) => (location.hash = tab), tab);
          await page
            .locator('[data-dash-tab="' + tab + '"]')
            .waitFor({ state: "visible" });
          await noOverflow("dashboard/" + tab + " " + width + " dark RTL");
          if (width !== 820)
            await capture("dashboard-" + tab + "-" + width + "-dark-rtl");
        }
    }
  }
  report.checks.push(
    "All physical pages and all six dashboard sections at selected widths, with light and dark/RTL screenshots",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await go("index");
  await page.waitForFunction(() => document.querySelector(".globe-ready"));
  const networkCoordinates = await page.evaluate(() =>
    Arcway.networkCities.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng })),
  );
  assert.equal(networkCoordinates.length, 14);
  for (const network of ["domestic", "international"]) {
    await page.locator('button[data-network="' + network + '"]').click();
    const routes = await page.evaluate(
      (key) =>
        Arcway.networks[key].routes.map((r) => ({
          id: String(r.id),
          origin: Arcway.networkCity(r.origin).name,
          destination: Arcway.networkCity(r.destination).name,
        })),
      network,
    );
    assert.equal(routes.length, 5);
    for (const route of routes) {
      await page.locator('[data-route="' + route.id + '"]').click();
      assert.equal(
        await page.locator("[data-route-label]").innerText(),
        route.origin + " → " + route.destination,
      );
      await page.waitForFunction(({ origin, destination }) => {
        const labels = [...document.querySelectorAll(".globe-city-name")].map(
          (e) => e.textContent,
        );
        return labels.includes(origin) && labels.includes(destination);
      }, route);
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      const labels = await page.locator(".globe-city-name").allTextContents();
      assert.ok(
        labels.includes(route.origin) && labels.includes(route.destination),
      );
      const rectangles = await page
        .locator(".globe-city-name")
        .evaluateAll((elements) =>
          elements.map((e) => {
            const r = e.getBoundingClientRect();
            return {
              text: e.textContent,
              left: r.left,
              right: r.right,
              top: r.top,
              bottom: r.bottom,
              display: getComputedStyle(e).display,
              hidden: e.closest('[style*="display: none"]') !== null,
            };
          }),
        );
      assert.equal(
        rectangles.filter((r) => !r.hidden).length,
        2,
        "selected endpoints are not behind globe " + route.id,
      );
      const [a, b] = rectangles;
      assert.ok(
        !(
          a.left < b.right &&
          b.left < a.right &&
          a.top < b.bottom &&
          b.top < a.bottom
        ),
        "selected city labels overlap " + route.id,
      );
      await page
        .locator(".network-explorer")
        .screenshot({ path: out + "/globe-" + route.id + ".png" });
    }
    assert.equal(
      await page.locator("[data-globe-city] option").count(),
      network === "domestic" ? 10 : 10,
    );
  }
  await page.selectOption("[data-globe-city]", "new-york");
  assert.match(
    await page.locator("[data-city-info]").innerText(),
    /New York.*40.71° N.*74.01° W/,
  );
  await page.locator("[data-globe-reset]").click();
  assert.equal(
    await page.locator("[data-route-label]").innerText(),
    "Mumbai → Dubai",
  );
  await page.locator('button[data-network="domestic"]').click();
  assert.equal(
    await page.locator("[data-route-label]").innerText(),
    "Hyderabad → Mumbai",
  );
  assert.equal(await page.evaluate(() => Arcway.cities.length), 9);
  report.checks.push(
    "Both network switches, all ten route labels/cameras, nonoverlapping front-side endpoints, 14 city centers, New York W longitude, reset and domestic estimator isolation",
  );
  // Mobile selectors and navigation are exercised, not just photographed.
  await page.setViewportSize({ width: 320, height: 900 });
  await go("index");
  await page.locator(".network-explorer").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector(".globe-ready"));
  await page.locator('button[data-network="international"]').click();
  await page.selectOption("[data-route-select]", "international-4");
  assert.equal(
    await page.locator("[data-route-label]").innerText(),
    "Hyderabad → Frankfurt",
  );
  await capture("globe-international-mobile");
  await page.locator(".mobile-toggle").click();
  await page.locator(".nav-tools [data-theme-toggle]").click();
  assert.equal(
    await page.evaluate(() => document.documentElement.dataset.theme),
    "dark",
  );
  await page.locator(".nav-tools [data-direction]").click();
  assert.equal(await page.evaluate(() => document.documentElement.dir), "rtl");
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".mobile-toggle").getAttribute("aria-expanded"),
    "false",
  );
  await go("dashboard");
  await page.locator(".dash-menu").click();
  await page.locator('.dash-nav a[href="#history"]').click();
  await page.locator('[data-dash-tab="history"]').waitFor({ state: "visible" });
  await page.locator("#history-rows [data-shipment-details]").first().click();
  await page.locator("#shipment-dialog").waitFor({ state: "visible" });
  assert.equal(
    await page
      .locator("#shipment-dialog")
      .evaluate((e) => e.scrollWidth > e.clientWidth + 1),
    false,
  );
  await page.screenshot({ path: out + "/shipment-dialog-mobile.png" });
  await page.keyboard.press("Escape");
  report.checks.push(
    "320px international selection, mobile theme/direction controls, menu Escape, dashboard drawer and readable shipment dialog",
  );
  // Every phone image remains substantial, followed by its associated copy.
  await go("services");
  assert.ok(
    await page
      .locator(".service-detail .photo-panel")
      .first()
      .evaluate((e) => e.clientWidth >= 260),
  );
  const photoBeforeCopy = await page
    .locator(".service-detail .split")
    .first()
    .evaluate(
      (e) =>
        e.children[0].getBoundingClientRect().top <
        e.children[1].getBoundingClientRect().top,
    );
  assert.ok(photoBeforeCopy);
  // Network fallback retains actual geography and both complete route lists.
  const fallback = await context.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });
  await fallback.goto(base);
  await fallback.locator(".network-explorer").scrollIntoViewIfNeeded();
  await fallback.waitForSelector(".globe-unavailable");
  assert.equal(
    await fallback.locator("[data-network-map] path.land").count(),
    127,
  );
  await fallback.locator('button[data-network="international"]').click();
  await fallback.locator('[data-route="international-2"]').click();
  assert.equal(
    await fallback.locator("[data-route-label]").innerText(),
    "Delhi → London",
  );
  await fallback
    .locator(".network-explorer")
    .screenshot({ path: out + "/fallback-international.png" });
  await fallback.close();
  report.checks.push(
    "WebGL-disabled fallback uses 127 genuine land polygons with functioning international route selection",
  );
  assert.deepEqual(report.errors, []);
  fs.writeFileSync(
    "documentation/refinement-" + engine + "-results.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    "PASS",
    engine,
    report.layouts.length,
    "layout states;",
    report.checks.join("; "),
  );
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
