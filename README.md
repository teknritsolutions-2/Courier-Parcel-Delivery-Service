# ARCWAY — Courier & Parcel Delivery Service

A complete buildless frontend demonstration for a proposed courier brand. Traditional HTML5, CSS3 and vanilla JavaScript. No application framework, bundler, application server, API keys or runtime CDN requests.

## Open locally

Run from this directory:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173/`. Use HTTP rather than double-clicking HTML files so browser storage and WebGL texture loading work consistently. Any static HTTP server works; Python is only a local preview convenience.

## Architecture

- `index.html`: primary brand homepage with interactive Earth.
- `pages/home2.html`: photograph-led, booking-first homepage.
- `pages/services.html`, `rate-calculator.html`, `tracking.html`, `coverage.html`, `contact.html`: public shipping tools.
- `pages/login.html`, `signup.html`: standalone authentication interfaces.
- `pages/dashboard.html`: directly accessible workspace with six hash-addressable sections.
- `assets/css/`: fonts, shared design, dark theme, RTL, dashboard and authentication styles.
- `assets/js/site-config.js`: central business details and volumetric divisor.
- `city-data.js`, `service-data.js`, `shipment-data.js`: geographic references, pricing and shared records.
- `rate-calculator.js`, `tracking.js`, `pickup-booking.js`, `invoices.js`, `dashboard.js`, `auth.js`: focused interaction layers.
- `main.js`, `utils.js`: shared navigation, theme/direction, formatting and storage.
- `select-controls.js`, `assets/css/select-controls.css`: shared select-only comboboxes with readable options, viewport positioning, keyboard support and native form state.
- `globe.js`: lazy-loaded pale ice-blue Earth, domestic/international networks, spherical route framing, lifecycle and accurate static fallback.
- `assets/data/ne_110m_land.geojson`: locally pinned Natural Earth 5.1.2 land geometry. `assets/css/globe.css` owns explorer styling. International centers are geographic references only; they do not expand the nine-city domestic estimator.
- `assets/vendor/`: pinned Globe.GL 2.46.2 and jsPDF 3.0.3 with licenses.
- `assets/fonts/`: local Barlow Condensed, DM Sans and IBM Plex Mono; OFL licenses included.
- `documentation/`: reference review, source credits, QA evidence and completion report.
- `tests/`: dependency-free data tests and optional Playwright browser checks.

Pages are physical files with relative URLs, including query-string transfer between tools. Shared navigation is rendered by JavaScript. A no-script message explains the dependency if JavaScript is disabled.

## Demonstration boundaries

ARCWAY is a proposed brand; name/trademark availability has not been checked. There is no operational courier, carrier API, authentication, OAuth, form delivery, tax configuration, payment service or billing backend. Every affected interface makes this explicit.

- Sample IDs: `AW-100241`, `AW-100242`, `AW-100243`, `AW-100244`.
- Sample dates/events are fixed and do not simulate real-time progress.
- Pickup requests use `AWL-` plus 12 cryptographically generated hexadecimal characters.
- Review → save creates exactly one browser-local request. It appears in public tracking, history, overview and parcel lists. No driver is dispatched.
- Invoice records exist only for the three linked sample shipments. Newly saved pickups have no invoice.
- Downloadable documents are explicitly draft/illustrative, not tax invoices or payment receipts.
- Login/signup validate input and explain unavailable account services. No credentials are saved or transmitted. Remember Me saves only the preference; recovery and provider buttons report their unconnected state.
- Contact creates an unsent local preview and offers copying.

Local storage is origin-specific, not encrypted cloud storage. Pickup address/contact details and profile data stay on the browser. Use the reset action under Profile & Settings to remove local records/profile/Remember Me. Theme/direction preferences and original samples remain. Never put sensitive information into the demo.

## Sample pricing rules

`assets/js/service-data.js` defines editable tariffs. All amounts below are illustrative INR.

| Service | Base (first 0.5 kg) | Each additional 0.5 kg | Over 1,000 km zone |
| --- | ---: | ---: | ---: |
| Local | 55 | 18 | 0 |
| Domestic | 95 | 32 | 35 |
| Express | 165 | 55 | 55 |

Convert g/lb to kg and inches to cm. Volumetric kg = length × width × height ÷ configurable divisor (default 5,000). Billable weight = greater of actual/volumetric, rounded up to 0.5 kg. Base + additional weight increments + distance-zone charge = estimate. Distances are great-circle references, not road mileage. Local requires the same city; Domestic and Express support all reference city pairs. Actual/billable maximum 70 kg, each dimension maximum 200 cm. No taxes, official surcharges or optional paid extras are configured.

Example: Hyderabad → Mumbai, Domestic, 1 kg, 20 × 15 × 10 cm gives 0.6 kg volumetric, 1 kg billable and **INR 127**.

## Static deployment

For GitHub Pages, publish the repository root on the desired branch. `.nojekyll` and relative paths are included. No build command is needed.

For Sites packaging only, `python3 scripts/package-static.py` copies the same `index.html`, `pages/` and `assets/` into ignored `out/`. This is a deployment staging copy; it is not a generated application frontend. `.openai/hosting.json` identifies the private Sites project. No secrets are stored in the repository.

## Verification

```sh
node tests/verify-data.cjs
```

Optional browser QA uses an available Playwright installation and Chromium. Neither is a runtime dependency:

```sh
PLAYWRIGHT_MODULE=/absolute/path/to/playwright \
BROWSER_PATH=/absolute/path/to/chromium \
node tests/browser-qa.cjs
```

Start the local preview first. `BASE_URL` overrides the preview URL; `LAYOUT_ONLY=1` runs layout, mode, mobile navigation and fallback checks. Browser captures and downloaded test PDFs go to `/tmp/arcway-qa/`. See `documentation/visual-refinement-report.md` for the latest page-by-page audit and `documentation/qa-report.md` for checks and limits. The refinement was tested in both Chromium and WebKit, including international routes and all six dashboard sections.

Dropdown-specific QA uses the same browser environment variables with `node tests/select-controls-qa.cjs` (`QA_ENGINE=webkit` selects WebKit). See [dropdown inspection](documentation/dropdown-inspection-report.md).

## Connecting real services later

Replace the local shipment read/write adapter with an authenticated carrier-backed data service. Enforce ownership and validation on the server; add idempotency for booking. Supply approved tariffs/coverage/contact details, secure credential handling, account recovery and OAuth callbacks. Add real messaging/notification delivery and jurisdiction-appropriate billing/tax records. Do not expose provider secrets in static JavaScript. Keep local demonstration data distinguishable from carrier records throughout migration.
