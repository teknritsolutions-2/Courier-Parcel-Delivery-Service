# ARCWAY QA report

Tested 11 November 2026 on the local HTTP site using installed Brave (Chromium), Playwright, and software-rendered WebGL. No real logistics, identity, messaging or billing service was used.

## Completed checks

- All ten physical pages loaded without JavaScript page errors or missing page/script/style/image references.
- Every page checked for document-level horizontal overflow at **320, 360, 390, 425, 430, 768, 820, 960, 1024, 1180, 1280 and 1440 px**: passed.
- Full-page captures of every page at **390, 820 and 1440 px**. All ten desktop pages and all ten mobile compositions visually inspected. Representative tablet, dark/RTL, booking and result screens also inspected.
- Every page checked in combined dark + RTL at **390, 820 and 1440 px**: no document overflow. Twenty full-page dark/RTL captures produced. Geographic objects are not mirrored.
- Standalone authentication pages have no public header/footer. Validated mismatched passwords, visibility controls, Remember Me preference, unavailable Google/Apple providers and recovery. No password persisted in local storage, no fake account or authentication success.
- Calculator checked in browser and data tests: kg/g/lb conversions, cm/in conversions, actual vs volumetric weights, 0.5 kg rounding, same-city eligibility, invalid local intercity route, weight and size bounds, distance zone, totals and empty/stale results.
- Tracking checked: valid in-transit and delivered records, event count, malformed ID, missing ID, local reference, route and current status. Historical sample dates remain static.
- Coverage: city/state text search, region filter, no-match state and calculator links.
- Contact: validation, local preview and explicitly unsent state. Copy uses browser clipboard with honest fallback.
- Booking: required fields, review, saved reference, single local record, updated total/pending counts, filtered history, detail dialog, public tracking lookup. New request shows exactly one event and no draft invoice.
- History/search: shared data, sorting/filtering interfaces, detail actions and empty states. Fixed a blur/change redraw that could interrupt clicks after filtering.
- Profile: browser persistence and confirmed data reset. Theme/direction settings shared with public pages. No real notification delivery.
- Navigation: query transfer from homepage tracking, dropdown opening and Escape, mobile menu, dashboard sidebar close/select/Escape/inert behavior, hash sections, back-to-top and sticky header position while scrolled.
- Shared data tests reconcile all four sample amounts against calculator rules, prevent duplicate local records and verify all five route endpoints against city coordinates.

## Globe verification

- Local **Globe.GL 2.46.2** successfully rendered actual textured Earth in Chromium/WebGL.
- Original raster 4096 × 2048, optimized 2048 × 1024, 2:1 equirectangular. No crop/mirror applied. Visual inspection confirmed India, Africa, the Arabian Peninsula and Asia in their expected orientations. Initial camera centered at 22° N / 79° E.
- Nine city centers sourced from GeoNames; north/east sign conventions checked. Data tests confirm geographic bounds and exact route endpoint equality.
- Five coordinate-based spherical arcs. Selected route highlighting, reset, opt-in slow rotation and city inspection tested. Labels limited to selected endpoints and arranged on opposite sides where close.
- Keyboard-accessible city dropdown tested with Pune: 18.52° N / 73.86° E shown. Route selection pauses rotation and updates its pressed state.
- WebGL-disabled test confirmed a visible intentional fallback and working route selection. Reduced-motion test confirmed automatic rotation cannot be enabled.
- Canvas resizing exercised across all widths. Render loop pauses outside view or on hidden tabs; resize/intersection observers and renderer are cleaned up on exit. Browser return-navigation was checked for a restored globe canvas. No continuous GPS or shipment events are fabricated.

## Invoice verification

Actual browser PDF downloads use local **jsPDF 3.0.3**, with references DRAFT-00241, DRAFT-00242 and DRAFT-00244. The first actual downloaded file was opened, text-extracted and rendered with macOS PDFKit (Poppler unavailable). Its one-page layout was visually inspected: legible headings, aligned charge rows, safe margins, correct INR 191.00 total, shipment link and explicit draft/no-payment/no-tax-invoice limitations.

All three actual downloaded PDFs were then reopened with PDFKit: each has one page, the correct linked shipment/reference, total (INR 191 / INR 275 / INR 194) and explicit tax/payment limitations. The other two use the same visually verified template. No invented GST, registration numbers, paid status or real billing identity is present.

## Evidence and commands

- `node tests/verify-data.cjs`: passed.
- `tests/browser-qa.cjs`: full functional + viewport/mode matrix passed. Machine-readable run in `browser-results.json`.
- Follow-up targeted browser check passed after final refinements: city dropdown, rotation state, sticky header, back navigation, 320 px booking/tracking, final RTL wordmark and comparison scroll hint.
- All captures and test PDF downloads: `/tmp/arcway-qa/` in the working environment.
- Representative captures retained in `documentation/screenshots/`.
- Static relative asset/page reference checker: passed.

The first test runs exposed ambiguous test selectors and timing assumptions; those were narrowed to the relevant forms and changed to await visible hash sections and completed smooth scrolling. Product defects found and fixed included 320 px navigation overflow, sticky-header containment and filter redraw clicks. Initial lazy-image screenshot blanks were resolved by loading images before captures; actual source images were checked independently.

## Limits

Browser viewport emulation is not real-device certification. No physical mobile GPU, low-bandwidth performance benchmark, assistive-technology audit or cross-browser Safari/Firefox pass was performed. WebGL QA used software rendering; real hardware performance varies. Shipping data is browser-local and tied to the origin. The public grid diagram is a coordinate diagram, not an administrative map.

GitHub Pages compatibility was checked through static relative paths and local HTTP serving; no GitHub repository deployment was performed. Sites publication status is reported separately by the deployment tool. Real carrier integration, approved rates/coverage/contact details, authentication/OAuth, request delivery, secure multi-user data, notifications and official billing remain backend work.
