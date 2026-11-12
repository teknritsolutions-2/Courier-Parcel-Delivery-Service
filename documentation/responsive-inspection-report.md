# Mobile and tablet inspection — 12 November 2026

Inspected all 10 physical pages and all six dashboard sections using Chromium and WebKit browser viewports. Reviewed actual screenshots of both homepages, services, calculator, tracking, coverage, contact, login/signup, all dashboard sections, the navigation drawer, populated results and the footer.

## Fixes made

| Observed issue | Correction |
| --- | --- |
| FAQ rows looked large but their actual summary touch area was only 26px high. | Moved row padding onto the interactive summary, with a 70px minimum target. Kept the complete row clickable and the expand indicator from shrinking. |
| Dashboard drawer close target was 32–40px, depending on breakpoint. | Increased it to at least 44 × 44px on phones and tablets. |
| Dashboard sidebar content extended below a 390px-high landscape screen; Exit was unreachable because overflow was visible and the page behind was locked. | Made the sidebar independently scrollable, prevented flex items from compressing, and contained overscroll. Verified Exit can be brought fully into view. |
| The floating Back to top control covered a recorded tracking timestamp on mobile. | Placed it inside the footer on compact layouts through 1320px. It still scrolls to the page top; desktop retains its floating control. |

## Verification

- Existing full responsive suite: Chromium passed 240 layout states across 320, 360, 390, 425, 430, 768, 820, 960, 1024, 1180, 1280 and 1440px; WebKit passed 128 layout states at representative widths. Both covered all pages and all dashboard tabs, including dark/RTL states, route selection, real-geometry fallback, mobile navigation and shipment dialog behavior.
- Follow-up checks after fixes: each browser passed 20 viewport/theme/direction combinations at 320×568, 390×844, 844×390, 820×1180 and 1180×820. Tested taps near the edge of FAQ rows, short-screen public drawer reachability, dashboard close target, scrolling Exit into view, Escape/focus return and horizontal overflow.
- Populated calculator and tracking results were checked at 390px and 820px in both browsers. The default estimate remains INR127. Verified the footer Back to top control is reachable and returns the page to its top.
- Audited visible button, input, select, textarea and summary target dimensions on all 10 pages at 320, 390 and 820px. The identified undersized FAQ and sidebar controls were corrected; the repeated audit reported no undersized targets in that control set.
- No browser page errors in the final follow-up checks. Source formatting, JavaScript syntax and whitespace checks passed.

Browser viewport emulation was used; no claim of testing on physical phones or tablets is made. Detailed follow-up evidence: [Chromium](responsive-followup-chromium-results.json), [WebKit](responsive-followup-webkit-results.json). Existing comprehensive layout results: [Chromium](refinement-chromium-results.json), [WebKit](refinement-webkit-results.json).
