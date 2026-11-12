# ARCWAY visual refinement and sitewide QA

Implemented 11 November 2026. Existing physical pages, vanilla architecture, pricing rules, shipment IDs, local booking storage and PDF generation are preserved. This report supersedes the visual descriptions of the initial photographic-globe version.

## Page-by-page findings and fixes

| Page | Defects found | Implemented corrections |
| --- | --- | --- |
| Home 1 | Photographic Earth did not fit the desired direction; globe captions and routes were small; labels used an unsupported orientation; repeated coverage artwork; crowded tablet columns and repetitive example labels. | Pale translucent 3D Earth with real land polygons; separate domestic/international networks; readable HTML city labels with back-side occlusion; route-specific spherical camera fitting; compact mobile route selector; independent destination board; stacked tablet composition, larger copy and tracking controls; cleaner status timeline and stronger closing CTA. |
| Home 2 | Mobile headline was excessively fragmented; pickup controls were cramped; service comparison and helper text were small; repeated technical copy. | More balanced responsive heading scale, clear pickup form spacing, consistent 52px selects, readable comparison rows with a labeled scroll region, substantial photography, simplified enquiry/estimate wording and concise FAQs. Booking-first composition remains distinct. |
| Services | Small paragraphs/metadata, narrow tablet image/copy columns, inconsistent form-control scale and repeated software terminology. | Shared typographic hierarchy, larger body and actions, full-width image-before-copy stacking, consistent photograph frames, clearer service descriptions and carrier-confirmation guidance. No invented express guarantee. |
| Rate Calculator | Fine-print labels and breakdowns were small; unit selectors could be narrow; secondary result copy had developer language; native WebKit selects ignored the intended height. | Larger labels/help/values, stronger field boundaries and placeholders, reliable unit-selector sizing, consistent cross-engine dropdowns, readable itemized result and one indicative-price explanation. Conversion, volumetric, zone and rounding logic unchanged. |
| Tracking | Small ID helpers, event metadata and mobile route labels; redundant static-data warnings in marketing cards; large programmatic focus box. | Larger reference field/buttons and timeline metadata, readable route/date/status detail, clean supporting copy, a single relevant example/browser-record explanation in the result, and screen-reader focus without a decorative frame. Status data remains static. |
| Coverage | Small geographic labels, repeated per-city illustrative badges, weak search controls and potential confusion between map exploration and actual service eligibility. | Enlarged map lettering, cleaner city directory, consistent city/state search and region filter controls, a single availability notice and explicit separation of conceptual international routes from the nine-city domestic directory. |
| Contact | Supporting notices repeated implementation details; labels/helper text were small; WebKit topic dropdown was short. | Concise support categories, clearer form rhythm, standard control sizes, quieter unavailable-contact-details note and one review-only disclosure. Enquiry remains unsent unless an integration is added. |
| Login | Small Remember Me/recovery text, compact provider and theme controls, weak form boundaries. | Readable labels and same-row account controls, 52px provider buttons, 44px visibility/theme/direction targets, clear unavailable-service feedback. Standalone shell and direct dashboard access preserved. |
| Sign Up | Tight field rhythm and small support controls. | Consistent password fields, visible focus/validation, stronger labels, readable provider actions and concise account-service disclosure. No password storage or fake account creation. |
| Dashboard | Small stats/table/activity metadata; dense seven-column tablet tables; inconsistent action sizes; repeated warning banners; dark-theme caption/hover visibility defects. | Larger stat labels and timestamps, readable two-column mobile and three-column tablet shipment records, consistent actions/statuses, clear detail/invoice dialogs, subdued single workspace disclosure, stronger semantic theme colors and improved drawer targets. All six sections audited separately. |

## Globe redesign

- Local **Globe.GL 2.46.2** retained. No second Three.js bundle or application framework.
- Local **Natural Earth 5.1.2**, 127 genuine land polygons. The photographic texture was removed. Ice-blue ocean material uses subtle emissive fill/specular lighting and a restrained atmosphere. The motion fix uses one opaque depth-writing ocean surface and opaque land caps, avoiding transparent-layer sorting and the former duplicate depth pass. Land caps now use 2° curvature resolution at 0.006 radius altitude so their triangle interiors stay above the ocean during rotation.
- Nine existing Indian centers plus verified **Dubai, Singapore, London, Frankfurt and New York** centers. Exact values/source records are in `globe-source-research.md`; Natural Earth/GeoNames credits remain available.
- Domestic view retains five connections. International view adds Mumbai–Dubai, Mumbai–Singapore, Delhi–London, Bengaluru–Singapore and Hyderabad–Frankfurt. New York can be inspected as a city reference.
- Selected endpoints use orange markers and readable fixed-size labels. Camera framing uses a spherical vector midpoint; data tests verify both endpoints face the fitted camera. A continuous selected arc underlies the optional slow moving highlight.
- Phones render fewer routes/markers, use a complete native connection selector, and place endpoint labels above/below markers to avoid clipping. Ten selected routes were checked at 320px in both engines.
- The WebGL fallback renders the same 127 land polygons and great-circle route samples, with both network selectors and city/route controls available. Reduced motion, rotation pause/reset, offscreen rendering pause, resizing and cleanup remain implemented.
- International exploration does not alter calculator, pickup or confirmed coverage eligibility. A single network notice explains conceptual connections.

## Content, typography and contrast

Repeated demo/sample pills, card labels and headings were removed or rewritten. One public concept disclosure remains in the footer; transactional explanations remain at rate results, tracking records, booking review/confirmation, draft invoices and account feedback. No live-carrier, dispatch, payment or authentication success was introduced.

Body/UI copy is generally 16px; form labels/actions 15–16px; supporting and event details 14–16px; table data 14px; decorative metadata 12–14px. Containers, touch targets and reflow were adjusted with the larger type. Important text no longer relies on 9–11px sizing.

Shared semantic tokens control surfaces, muted text, fields, placeholders, primary/default button hover states, focus, badges and disabled states. Permanently dark editorial sections retain an intentional inverse palette. Fixed-surface photo captions and white tracking inputs have appropriate foregrounds in either theme. The ordinary-text solid-background audit passes AA contrast thresholds for both themes, including populated rate and tracking results. Logotypes, photographs, SVG/canvas geography and image overlays require visual judgement and were reviewed separately; this is not a formal accessibility certification.

## Responsive and browser evidence

- Existing functional suite passed in **Chromium and WebKit**: calculator/conversions, malformed tracking IDs, search/filtering, contact preview, password/OAuth/recovery feedback, pickup review/save/reference, matching history/tracking/counts, invoice preview/PDF download, profile persistence and reset, menus, back-to-top, globe controls, fallback and reduced motion.
- All ten physical pages checked at **320, 360, 390, 425, 430, 768, 820, 960, 1024, 1180, 1280 and 1440px** in both engines.
- Detailed page + six-dashboard-section audit: **240 Chromium states** and **128 WebKit states**, including combined dark/RTL at 390/820/1440. Machine-readable results are retained in `refinement-chromium-results.json` and `refinement-webkit-results.json`.
- Before captures: every page at 390/820/1440, plus desktop dark. After captures include every page and all dashboard sections; major phone/tablet/desktop and dark/RTL compositions visually inspected, not only overflow measurements.
- Cross-engine follow-up: actual select heights at 320/820/1440, final 320px city-label bounds for all ten routes, menu and invoice-dialog captures. Native WebKit select-height defects were corrected rather than accepted as a browser difference.
- `node tests/verify-data.cjs` passes pricing, bounds, conversions, invoice reconciliation, local-state deduplication/counters, all ten route endpoints, 14 coordinate centers, spherical framing and Natural Earth geometry checks.
- JavaScript syntax checks, physical asset/page reference checks and readable-source formatting checks pass. Pinned visualization/PDF libraries and font licenses remain local. Formatting/parser tools were temporary external development tools, not added site dependencies.
- Complete captures: `/tmp/arcway-refinement/` and `/tmp/arcway-qa/`; representative final images are retained under `documentation/screenshots/`.

The prior responsive reference patches were re-read from the source review in `reference-review.md`. The implemented lessons include full-width mobile photography before copy, deliberate tablet reflow, sufficient header clearance, aligned content and reachable sticky navigation.

## Limits and integration work

The browser passes use desktop Chromium/Brave and installed WebKit with viewport emulation, not a fleet of physical devices. No low-end mobile GPU or throttled-network benchmark, screen-reader certification or Firefox pass is claimed. Natural Earth is a generalized world layer, not a legal boundary or navigation dataset.

Real carrier booking/tracking, approved coverage/tariffs, authentication/OAuth/recovery, messaging and notifications, secure customer ownership and official tax/billing records still need real services. Existing sample/local data remains truthful at the relevant action points.

GitHub Pages production verification is performed after publication and reported in the delivery message; local screenshots alone are not presented as production evidence.

### Follow-up: globe motion rendering

Reproduced land patches clipping into the ocean at multiple camera longitudes. Replaced 5° land-cap curvature with 2°, raised land from 0.002 to 0.006 globe radii, and removed the duplicate depth-mask/transparent surface stack. Compared nine fixed viewpoints before/after; inspected actual drag frames in Chromium and WebKit. Both browsers passed all ten route selections, drag movement in both networks, auto-rotation, reset, and a 390px mobile view without page errors. The pale appearance is retained using opaque surfaces and lighting; the ocean is no longer literally transparent.
