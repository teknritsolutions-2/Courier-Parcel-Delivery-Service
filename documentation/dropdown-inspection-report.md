# Shared dropdown inspection — 12 November 2026

The browser-native popup in the supplied screenshot rendered tiny option text and a detached menu. Styling the closed native select alone did not control the operating system popup. ARCWAY now enhances single selects with a shared, accessible select-only combobox, using the established interaction pattern from the owner’s travel project and ARCWAY’s own visual tokens.

## Result

- Closed controls: 16px text and at least 52px height. Options: 16px text and at least 48px height, with a clear current selection and keyboard highlight.
- Menus open 6px above or below the control according to available space, align to the appropriate edge in LTR/RTL, stay inside the visible viewport and scroll when the option list is long. Small unit selectors receive a readable popup width. Outside click, focus departure, Escape, page scroll and resize dismiss the menu.
- Globe city and route selectors, both homepage estimators, Home 2 pickup form, calculator cities/units/services, coverage region, contact topic, pickup package/service/window and dashboard status/sort filters all use the same behavior.
- Dark editorial sections retain the inverse palette; regular light/dark surfaces use shared theme tokens. Navbar Home 1/Home 2 menus retain their existing readable navigation rows.
- Original native select elements retain values, form names, validity and default values. Custom choices dispatch the original input/change events. Native fields are hidden from assistive navigation; the visible combobox exposes its label/value, expansion state, required/disabled/invalid state and active option. Labels focus the visible control. Without the enhancement script, the original native fields remain usable.
- Keyboard support includes arrows, Home/End, Enter/Space, Escape, Tab and typeahead. Dynamic city/route option replacement, disabled options, reset and required-field validation remain synchronized.

## Verified

Both Chromium and WebKit passed the existing end-to-end browser suite: estimator values and unit conversion, tracking states, coverage filters, contact preview, auth validation, local pickup save/reconciliation, invoice preview/PDF download, profile/reset, globe/fallback, public navigation and dashboard drawer. All ten pages passed the 12-width layout checks and representative dark/RTL checks.

Each browser also passed 196 open-menu placement/selection checks across 320, 390, 820 and 1180px in light/LTR and dark/RTL. Checked every visible dropdown on both homepages, calculator, coverage, contact and pickup/track/history dashboard sections. Verified 16px options, 48px rows, viewport bounds, anchor adjacency, choice synchronization and focus return. Additional checks covered keyboard selection, form serialization/validation/reset, disabled/dynamic options and international New York selection.

Short-screen checks at 320×568, 844×390 and 1180×600 passed in both engines, including the narrow weight-unit menu and resize dismissal. Actual globe and calculator popup screenshots were inspected.

Evidence: [Chromium dropdown checks](dropdown-chromium-results.json), [WebKit dropdown checks](dropdown-webkit-results.json), [existing functional checks](browser-results.json), [WebKit functional checks](functional-webkit-results.json). Reproduce with `tests/select-controls-qa.cjs` using the same external Playwright/browser environment variables as the existing suites. Browser viewport emulation was used; physical-device and screen-reader certification are not claimed.
