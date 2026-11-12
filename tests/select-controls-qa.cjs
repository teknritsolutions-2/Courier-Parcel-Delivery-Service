// Optional browser inspection. Playwright stays external to the static site.
const { chromium, webkit } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright",
);
const assert = require("node:assert/strict");
const fs = require("node:fs");
const engine = process.env.QA_ENGINE || "chromium";
const base = process.env.BASE_URL || "http://127.0.0.1:4173/";
(async () => {
  const browser = await (engine === "webkit" ? webkit : chromium).launch({
    headless: true,
    executablePath: process.env.BROWSER_PATH,
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
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [],
    checks = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const out = "/tmp/arcway-dropdowns/" + engine;
  fs.mkdirSync(out, { recursive: true });
  const contexts = [
    "index",
    "home2",
    "rate-calculator",
    "coverage",
    "contact",
    "dashboard#book",
    "dashboard#track",
    "dashboard#history",
  ];
  for (const width of [320, 390, 820, 1180]) {
    await page.setViewportSize({ width, height: 900 });
    for (const mode of ["light-ltr", "dark-rtl"]) {
      for (const context of contexts) {
        const [slug, hash] = context.split("#");
        await page.goto(
          base +
            (slug === "index" ? "" : "pages/" + slug + ".html") +
            (hash ? "#" + hash : ""),
        );
        await page.evaluate((mode) => {
          const [theme, dir] = mode.split("-");
          document.documentElement.dataset.theme = theme;
          document.documentElement.dir = dir;
        }, mode);
        if (slug === "index")
          await page.waitForSelector(".globe-ready,.globe-unavailable");
        await page.waitForSelector(".select-trigger:visible");
        const triggers = page.locator(".select-trigger:visible");
        const count = await triggers.count();
        for (let i = 0; i < count; i++) {
          const trigger = triggers.nth(i);
          await trigger.click();
          const menu = page.locator(".select-menu");
          await menu.waitFor({ state: "visible" });
          const rect = await menu.boundingBox(),
            anchor = await trigger.boundingBox();
          assert.ok(
            rect.x >= 11 && rect.x + rect.width <= width - 11,
            context + " horizontal position",
          );
          assert.ok(
            rect.y >= 0 && rect.y + rect.height <= 901,
            context + " vertical position",
          );
          assert.ok(
            Math.abs(rect.y - anchor.y - anchor.height) < 8 ||
              Math.abs(rect.y + rect.height - anchor.y) < 8,
            "anchored to the control",
          );
          assert.ok(
            await menu
              .locator("[role=option]")
              .evaluateAll((items) =>
                items.every(
                  (item) =>
                    parseFloat(getComputedStyle(item).fontSize) >= 16 &&
                    item.getBoundingClientRect().height >= 48,
                ),
              ),
          );
          if (slug === "index" && i === 0 && [390, 820].includes(width))
            await page.screenshot({
              path: out + "/globe-menu-" + width + "-" + mode + ".png",
            });
          const options = menu.locator("[role=option][aria-disabled=false]");
          const option = options.nth(Math.min(1, (await options.count()) - 1));
          const text = (await option.textContent()).trim();
          await option.click();
          assert.equal(await menu.count(), 0);
          assert.equal(
            (await trigger.locator(".select-value").textContent()).trim(),
            text,
          );
          assert.equal(
            await trigger.evaluate((e) =>
              e.previousElementSibling.selectedOptions[0].textContent.trim(),
            ),
            text,
          );
          assert.equal(await trigger.getAttribute("aria-expanded"), "false");
          assert.ok(
            await trigger.evaluate((e) => e === document.activeElement),
          );
          checks.push({ width, mode, context, control: i });
        }
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
      }
    }
    console.log(engine, width, "dropdown placement/selection passed");
  }
  // Dynamic lists, event delivery, form values, keyboard selection and native validation.
  await page.goto(base + "pages/rate-calculator.html");
  await page.locator("#origin").waitFor();
  const unit = page.locator("select[name=weightUnit] + .select-trigger");
  await unit.focus();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("select[name=weightUnit]").inputValue(),
    "lb",
  );
  const origin = page.locator("#origin + .select-trigger");
  await origin.focus();
  await page.keyboard.press("m");
  assert.equal(await page.locator("#origin").inputValue(), "mumbai");
  await origin.click();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#origin").inputValue(), "mumbai");
  await origin.click();
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(".select-menu").count(), 0);
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "select-validation";
    form.innerHTML =
      '<label for="test-select">Test selection</label><select id="test-select" name="test" required><option value="">Choose</option><option value="one">One</option><option disabled value="two">Two</option></select>';
    document.body.append(form);
  });
  await page.locator("#test-select + .select-trigger").waitFor();
  assert.equal(
    await page
      .locator("#select-validation")
      .evaluate((e) => e.reportValidity()),
    false,
  );
  assert.equal(
    await page
      .locator("#test-select + .select-trigger")
      .getAttribute("aria-invalid"),
    "true",
  );
  const testTrigger = page.locator("#test-select + .select-trigger");
  await testTrigger.click();
  await page.getByRole("option", { name: "One", exact: true }).click();
  assert.equal(
    await page
      .locator("#select-validation")
      .evaluate((e) => new FormData(e).get("test")),
    "one",
  );
  assert.equal(
    await page.locator("#select-validation").evaluate((e) => e.checkValidity()),
    true,
  );
  await page.locator("#select-validation").evaluate((e) => e.reset());
  await page.waitForFunction(
    () =>
      document.querySelector("#test-select + .select-trigger .select-value")
        .textContent === "Choose",
  );
  await page.locator("#test-select").evaluate((e) => {
    e.innerHTML = '<option value="new">New option</option>';
    e.disabled = true;
  });
  await page.waitForFunction(
    () =>
      document
        .querySelector("#test-select + .select-trigger")
        .getAttribute("aria-disabled") === "true",
  );
  assert.match(await testTrigger.textContent(), /New option/);
  // Actual globe options rebuild when switching networks.
  await page.goto(base);
  await page.waitForSelector(".globe-ready,.globe-unavailable");
  await page.locator("button[data-network=international]").click();
  const cities = page.locator("[data-globe-city] + .select-trigger");
  await cities.click();
  await page.getByRole("option", { name: "New York", exact: true }).click();
  assert.equal(
    await page.locator("[data-globe-city]").inputValue(),
    "new-york",
  );
  assert.match(
    await page.locator("[data-city-info]").textContent(),
    /New York/,
  );
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "documentation/dropdown-" + engine + "-results.json",
    JSON.stringify(
      {
        engine,
        menus: checks.length,
        checks,
        errors,
        additional: [
          "keyboard arrows/Home/End, typeahead, Enter, Escape, Tab",
          "form serialization, validation, reset, disabled/dynamic options",
          "international globe city replacement and selection",
        ],
      },
      null,
      2,
    ),
  );
  await browser.close();
  console.log(
    "PASS",
    engine,
    checks.length,
    "dropdown menus and behavioral checks",
  );
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
