const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("node:fs");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.BROWSER_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  for (const theme of ["light", "dark"])
    for (const slug of [
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
    ]) {
      await p.goto(
        (process.env.BASE_URL || "http://127.0.0.1:4173/") +
          (slug === "index" ? "" : "pages/" + slug + ".html"),
      );
      if (slug === "tracking") {
        await p.locator('[data-sample-id="AW-100241"]').click();
      }
      if (slug === "rate-calculator") {
        await p.locator("#rate-form button[type=submit]").click();
      }
      await p.evaluate(
        (theme) => (document.documentElement.dataset.theme = theme),
        theme,
      );
      const list = await p.evaluate(() => {
        const rgb = (s) => {
          const v = s.match(/[\d.]+/g)?.map(Number);
          return v ? [v[0], v[1], v[2], v[3] ?? 1] : [0, 0, 0, 0];
        };
        const composite = (f, b) => [
          f[0] * f[3] + b[0] * (1 - f[3]),
          f[1] * f[3] + b[1] * (1 - f[3]),
          f[2] * f[3] + b[2] * (1 - f[3]),
          1,
        ];
        const lum = (c) =>
          c
            .slice(0, 3)
            .map((n) => {
              n /= 255;
              return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
            })
            .reduce((s, n, i) => s + n * [0.2126, 0.7152, 0.0722][i], 0);
        const ratio = (a, b) =>
          (Math.max(lum(a), lum(b)) + 0.05) / (Math.min(lum(a), lum(b)) + 0.05);
        return [...document.querySelectorAll("body *")]
          .filter(
            (e) =>
              e.offsetWidth &&
              e.offsetHeight &&
              e.closest("svg") === null &&
              [...e.childNodes].some(
                (n) => n.nodeType === 3 && n.textContent.trim(),
              ) &&
              !e.closest(
                "noscript,.home2-grid > :first-child,.globe-stage,.globe-fallback,.brand",
              ),
          )
          .flatMap((e) => {
            const cs = getComputedStyle(e);
            let ancestors = [],
              el = e,
              skip = false;
            while (el) {
              const s = getComputedStyle(el);
              if (s.backgroundImage !== "none") skip = true;
              ancestors.push(rgb(s.backgroundColor));
              el = el.parentElement;
            }
            if (skip) return [];
            let bg = [255, 255, 255, 1];
            for (const a of ancestors.reverse()) bg = composite(a, bg);
            const fg = composite(rgb(cs.color), bg);
            const r = ratio(fg, bg);
            const threshold =
              parseFloat(cs.fontSize) >= 24 ||
              (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700)
                ? 3
                : 4.5;
            return r + 0.03 < threshold
              ? [
                  {
                    tag: e.tagName,
                    selector: e.className,
                    text: e.innerText.slice(0, 90),
                    ratio: Math.round(r * 100) / 100,
                    fg: cs.color,
                    bg: bg.slice(0, 3),
                    size: cs.fontSize,
                    required: threshold,
                  },
                ]
              : [];
          });
      });
      failures.push(...list.map((f) => ({ page: slug, theme, ...f })));
    }
  fs.writeFileSync(
    "documentation/refinement-contrast-results.json",
    JSON.stringify(
      {
        engine: "Chromium",
        themes: ["light", "dark"],
        pages: 10,
        includes: [
          "initial pages",
          "solid pickup card within the photographic hero",
          "calculated rate summary",
          "tracking record",
        ],
        excludes: [
          "logotypes",
          "image overlays (visually reviewed)",
          "canvas/SVG geography",
        ],
        failures,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(failures, null, 2));
  await b.close();
  if (failures.length) process.exitCode = 1;
})();
