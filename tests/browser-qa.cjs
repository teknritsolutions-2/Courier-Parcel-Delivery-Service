// PLAYWRIGHT_MODULE=/path/to/playwright BROWSER_PATH=/path/to/chrome node tests/browser-qa.cjs
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const fs = require("node:fs"),
  assert = require("node:assert/strict");
const base = process.env.BASE_URL || "http://127.0.0.1:4173";
const capture = "/tmp/arcway-qa";
fs.mkdirSync(capture, { recursive: true });
(async () => {
  const engine = process.env.QA_ENGINE || "chromium";
  const browser = await (engine === "webkit" ? webkit : chromium).launch({
    executablePath: process.env.BROWSER_PATH,
    headless: true,
    args:
      engine === "webkit"
        ? []
        : [
            "--no-sandbox",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
          ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  const page = await context.newPage();
  const errors = [],
    checks = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const go = (path) => page.goto(base + "/" + path);
  const capturePage = async (name) => {
    await page.evaluate(async () => {
      for (const i of document.images) i.loading = "eager";
      await Promise.all(
        [...document.images].map((i) => i.decode().catch(() => {})),
      );
    });
    await page.screenshot({
      path: capture + "/" + name + ".png",
      fullPage: true,
    });
  };
  if (!process.env.LAYOUT_ONLY) {
    await go("pages/rate-calculator.html");
    await page.locator("#rate-form button[type=submit]").click();
    assert.match(await page.locator(".estimate-total").innerText(), /127/);
    checks.push("Calculator actual UI: INR127");
    await page.locator("[name=weightUnit]").selectOption("g");
    await page.locator("#weight").fill("1000");
    await page.locator("#rate-form button[type=submit]").click();
    assert.match(await page.locator(".estimate-total").innerText(), /127/);
    await page.locator("#service").selectOption("local");
    await page.locator("#rate-form button[type=submit]").click();
    assert.match(
      await page.locator("#rate-feedback").innerText(),
      /same pickup/,
    );
    checks.push("Calculator unit conversion and invalid local route");
    await go("pages/tracking.html?id=AW-100241");
    assert.match(
      await page.locator("#tracking-result").innerText(),
      /In transit/,
    );
    assert.equal(
      await page.locator("#tracking-result .timeline li").count(),
      4,
    );
    await page.locator('[data-sample-id="AW-100242"]').click();
    assert.match(
      await page.locator("#tracking-result").innerText(),
      /Delivered/,
    );
    await page.locator("#tracking-number").fill("AW-999999");
    await page.locator("#tracking-form button").click();
    assert.match(
      await page.locator("#tracking-result").innerText(),
      /No matching/,
    );
    await page.locator("#tracking-number").fill("bad");
    await page.locator("#tracking-form button").click();
    assert.match(
      await page.locator("#tracking-feedback").innerText(),
      /Enter a reference/,
    );
    checks.push(
      "Tracking static events, delivered sample, missing and malformed IDs",
    );
    await go("pages/coverage.html");
    await page.locator("#city-search").fill("Telangana");
    assert.equal(await page.locator(".city-card").count(), 1);
    await page.locator("#region-filter").selectOption("West");
    assert.equal(await page.locator(".city-card").count(), 0);
    checks.push("Coverage city/state search and region filter");
    await go("pages/contact.html");
    await page.locator("#contact-name").fill("Test Customer");
    await page.locator("#contact-email").fill("customer@example.com");
    await page
      .locator("#contact-message")
      .fill("Please review my sample pickup enquiry.");
    await page.locator("#contact-form button").click();
    assert.match(
      await page.locator("#contact-preview").innerText(),
      /has not been sent/,
    );
    checks.push("Contact validated unsent preview");
    await go("pages/signup.html");
    await page.locator("#full-name").fill("Test Customer");
    await page.locator("#auth-email").fill("customer@example.com");
    await page.locator("#signup-password").fill("TestOnly123");
    await page.locator("#confirm-password").fill("Mismatch123");
    await page.locator("[data-auth-form] button[type=submit]").click();
    assert.equal(
      await page.locator("#confirm-password").evaluate((e) => e.validity.valid),
      false,
    );
    await page.locator("#confirm-password").fill("TestOnly123");
    await page.locator("[data-auth-form] button[type=submit]").click();
    assert.match(
      await page.locator("#auth-feedback").innerText(),
      /No account was created/,
    );
    assert.equal(await page.locator("#signup-password").inputValue(), "");
    await page.locator("[data-provider=Google]").click();
    assert.match(
      await page.locator("#auth-feedback").innerText(),
      /not connected/,
    );
    assert.equal(
      await page.evaluate(() =>
        JSON.stringify(localStorage).includes("TestOnly123"),
      ),
      false,
    );
    checks.push(
      "Signup mismatch validation, honest feedback, OAuth unavailable, no stored password",
    );
    await go("pages/login.html");
    await page.locator("#auth-email").fill("customer@example.com");
    await page.locator("#login-password").fill("TestOnly123");
    await page.locator("[data-password-toggle]").click();
    assert.equal(
      await page.locator("#login-password").getAttribute("type"),
      "text",
    );
    await page.locator("[name=remember]").check();
    await page.locator("[data-auth-form] button[type=submit]").click();
    assert.match(
      await page.locator("#auth-feedback").innerText(),
      /requires a connected/,
    );
    await page.locator("[data-forgot]").click();
    await page.locator("#forgot-email").fill("customer@example.com");
    await page.locator("#forgot-form button").click();
    assert.match(
      await page.locator("#forgot-feedback").innerText(),
      /No reset email/,
    );
    await page.locator("#forgot-dialog [data-close-dialog]").click();
    checks.push(
      "Login, password visibility, remember preference, unavailable recovery",
    );
    await go("pages/dashboard.html#book");
    const fields = {
      senderName: "Test Sender",
      senderPhone: "9876543210",
      pickupAddress: "10 Sample Lane, Hyderabad",
      recipientName: "Test Recipient",
      recipientPhone: "9876543211",
      deliveryAddress: "20 Sample Road, Mumbai",
      weight: "2",
      length: "20",
      width: "15",
      height: "10",
      pickupDate: "2027-01-20",
      notes: "QA local request only",
    };
    for (const [key, value] of Object.entries(fields))
      await page.locator("#pickup-form [name=" + key + "]").fill(value);
    await page.locator("#pickup-form button[type=submit]").click();
    assert.equal(await page.locator("#pickup-review").isVisible(), true);
    await capturePage("booking-review-desktop");
    await page.locator("[data-save-pickup]").click();
    const ref = (await page.locator(".booking-ref").innerText()).trim();
    assert.match(ref, /^AWL-[A-F0-9]{12}$/);
    assert.equal(
      await page.evaluate(
        () => Arcway.shipments().filter((s) => s.id.startsWith("AWL-")).length,
      ),
      1,
    );
    await page.locator('.dash-nav a[href="#overview"]').click();
    assert.equal(await page.locator("[data-stat=total]").innerText(), "5");
    assert.equal(await page.locator("[data-stat=pending]").innerText(), "2");
    await page.locator('.dash-nav a[href="#history"]').click();
    await page.locator("#history-search").fill(ref);
    assert.equal(await page.locator("#history-rows tr").count(), 1);
    await page.locator("#history-rows [data-shipment-details]").click();
    await page.locator("#shipment-dialog").waitFor({ state: "visible" });
    assert.match(
      await page.locator("#shipment-dialog").innerText(),
      /Saved locally/,
    );
    await page.locator("#shipment-dialog [data-close-dialog]").click();
    await go("pages/tracking.html?id=" + ref);
    assert.match(
      await page.locator("#tracking-result").innerText(),
      /saved in this browser/i,
    );
    assert.equal(
      await page.locator("#tracking-result .timeline li").count(),
      1,
    );
    checks.push(
      "Pickup review, save once, reference, overview reconciliation, history/details and public tracking consistency",
    );
    await go("pages/dashboard.html#invoices");
    assert.equal(await page.locator("#invoice-rows tr").count(), 3);
    await page.locator("[data-view-invoice]").first().click();
    assert.match(
      await page.locator("#invoice-dialog").innerText(),
      /Not a tax invoice/,
    );
    const download = page.waitForEvent("download");
    await page.locator("[data-dialog-download]").click();
    const file = await download;
    await file.saveAs(capture + "/" + file.suggestedFilename());
    assert.ok(
      fs
        .readFileSync(capture + "/" + file.suggestedFilename())
        .subarray(0, 5)
        .toString() === "%PDF-",
    );
    await page.locator("#invoice-dialog [data-close-dialog]").click();
    checks.push("Draft invoice preview and actual PDF download");
    await page.locator('.dash-nav a[href="#profile"]').click();
    await page.locator("#profile-name").fill("Sample Customer");
    await page.locator("#profile-email").fill("sample@example.com");
    await page.locator("#profile-form button[type=submit]").click();
    await page.reload();
    assert.equal(
      await page.locator("#profile-name").inputValue(),
      "Sample Customer",
    );
    await page.locator("[data-reset-data]").click();
    await page.locator("[data-confirm-reset]").click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => Arcway.shipments().length), 4);
    checks.push("Profile persistence and confirmed local data reset");
    await go("index.html");
    await page.waitForFunction(() =>
      document.querySelector(".globe-shell").classList.contains("globe-ready"),
    );
    await page.locator('[data-route="2"]').click();
    assert.equal(
      await page.locator("[data-route-label]").innerText(),
      "Mumbai → Delhi",
    );
    assert.equal(
      await page.locator('[data-route="2"]').getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("[data-globe-reset]").click();
    assert.equal(
      await page.locator("[data-route-label]").innerText(),
      "Hyderabad → Mumbai",
    );
    await page.locator("[data-globe-rotate]").click();
    assert.equal(
      await page.locator("[data-globe-rotate]").getAttribute("aria-pressed"),
      "true",
    );
    await page.locator("[data-globe-rotate]").click();
    checks.push(
      "WebGL globe renders, route selection/reset and rotation controls",
    );
    await page.locator("#hero-tracking").fill("AW-100241");
    await page.locator("[data-tracking-shortcut] button").click();
    assert.ok(page.url().includes("tracking.html?id=AW-100241"));
    await page.locator(".home-nav summary").click();
    assert.equal(await page.locator(".home-menu").isVisible(), true);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".home-menu").isVisible(), false);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await page.locator(".back-top").click();
    await page.waitForFunction(() => scrollY < 10);
    assert.ok((await page.evaluate(() => scrollY)) < 10);
    checks.push("Shortcut query transfer, keyboard dropdown and back-to-top");
  }
  const widths = [
      320, 360, 390, 425, 430, 768, 820, 960, 1024, 1180, 1280, 1440,
    ],
    slugs = [
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
  const viewportResults = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of slugs) {
      await go(slug === "index" ? "index.html" : "pages/" + slug + ".html");
      await page.waitForTimeout(60);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(overflow, false, slug + " overflows at " + width);
      viewportResults.push({ width, page: slug, overflow });
      if ([390, 820, 1440].includes(width)) {
        if (slug === "index") await page.waitForTimeout(1000);
        await capturePage(slug + "-" + width);
      }
    }
    console.log("viewport", width, "passed");
  }
  checks.push("All ten pages: no page overflow at all 12 specified widths");
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const slug of slugs) {
      await go(slug === "index" ? "index.html" : "pages/" + slug + ".html");
      await page.evaluate(() => {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dir = "rtl";
      });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        slug + " dark RTL " + width,
      );
      if (width === 390 || width === 1440)
        await capturePage(slug + "-" + width + "-dark-rtl");
    }
  }
  checks.push("All ten pages in combined dark + RTL at 390, 820 and 1440");
  await page.setViewportSize({ width: 390, height: 844 });
  await go("pages/dashboard.html");
  await page.locator(".dash-menu").click();
  assert.equal(
    await page.locator(".dash-sidebar").evaluate((e) => e.inert),
    false,
  );
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".dash-sidebar").evaluate((e) => e.inert),
    true,
  );
  await page.locator(".dash-menu").click();
  await page.locator('.dash-nav a[href="#history"]').click();
  await page.locator("#history-table").waitFor({ state: "visible" });
  assert.equal(await page.locator("#history-table").isVisible(), true);
  assert.equal(
    await page.locator(".dash-sidebar").evaluate((e) => e.inert),
    true,
  );
  await go("pages/contact.html");
  await page.locator(".mobile-toggle").click();
  assert.equal(await page.locator(".main-nav").isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(
    await page.locator(".mobile-toggle").getAttribute("aria-expanded"),
    "false",
  );
  checks.push(
    "Mobile public menu and dashboard sidebar, Escape, tab selection, inert state",
  );
  const fallbackPage = await context.newPage();
  await fallbackPage.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (type === "webgl" || type === "webgl2") return null;
      return null;
    };
  });
  await fallbackPage.goto(base);
  await fallbackPage.waitForTimeout(300);
  assert.equal(await fallbackPage.locator(".globe-fallback").isVisible(), true);
  await fallbackPage.locator('[data-route="3"]').click();
  assert.equal(
    await fallbackPage.locator("[data-route-label]").innerText(),
    "Chennai → Kolkata",
  );
  await fallbackPage.screenshot({
    path: capture + "/fallback.png",
    fullPage: true,
  });
  await fallbackPage.close();
  checks.push("WebGL unavailable: usable fallback and route selector");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await go("index.html");
  await page.waitForFunction(() =>
    document.querySelector(".globe-shell").classList.contains("globe-ready"),
  );
  await page.locator("[data-globe-rotate]").click();
  assert.equal(
    await page.locator("[data-globe-rotate]").getAttribute("aria-pressed"),
    "false",
  );
  checks.push("Reduced motion disables automatic rotation");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    process.env.QA_ENGINE === "webkit"
      ? "documentation/functional-webkit-results.json"
      : "documentation/browser-results.json",
    JSON.stringify(
      {
        date: new Date().toISOString(),
        browser:
          engine === "webkit"
            ? "Installed WebKit 27.2"
            : "Installed Brave Chromium, software WebGL",
        checks,
        viewportResults,
        errors,
        screenshotDirectory: capture,
      },
      null,
      2,
    ),
  );
  console.log(checks.join("\n"));
  console.log("PASS all browser checks; screenshots and PDF in " + capture);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
