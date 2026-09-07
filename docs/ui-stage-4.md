# Stage 4: dashboard UI, accessibility, and browser hardening

## Status

Implemented locally on 2026-09-05. Automated checks pass. Signed-out desktop and
375x812 mobile browser checks pass with no console warnings or errors. Authenticated
dashboard and PNG-export smoke tests still require the user's existing browser
session because the isolated test browser is not signed in.

## Changes

- Dashboard pages are route-level lazy loaded with an announced loading fallback.
  The former single JavaScript bundle of about 1,058 kB was split; the largest
  generated chunk is about 326 kB and the entry chunk is about 193 kB.
- Duplicate and incorrectly ordered CSS imports were corrected. The three font
  import warnings and the large-chunk build warning are gone.
- Loading and error states use live-region semantics. Data errors expose a keyboard-
  accessible Retry action.
- Charts include text alternatives assembled from their displayed values. Empty
  language, pull-request, and star datasets show explicit empty states.
- Global focus-outline suppression was removed and visible keyboard focus styling
  was added for controls and links.
- Mobile personal and organization navigation includes labeled close controls,
  Escape handling, inert background content, and hidden-state tab exclusion.
- Account selection uses a semantic button instead of a clickable `div`; image alt
  text and unstable list keys were corrected.
- Organization routes now render their nested route through `Outlet` instead of
  always hard-coding the profile page.
- Misleading global repository paging controls were removed. They did not control
  the currently visible dashboard page, whose aggregate data is already paginated.
- Career-snapshot PNG generation waits for fonts, excludes its download controls,
  limits pixel density, cleans temporary DOM on both success and failure, and shows
  a visible failure message.
- Server-rendered component regression tests cover loading/error semantics and
  closed/open mobile navigation behavior.

## Verification

- `npm test`: 142 tests pass across 15 files.
- `npm run build`: passes.
- `npm run lint`: passes.
- `git diff --check`: passes.
- Browser: signed-out protected-route redirect, desktop landing layout, mobile
  landing layout, and console output verified.

Before release, use an authenticated browser to traverse every dashboard route,
open/close the mobile menu by keyboard, retry one simulated request failure, and
download/open a career-snapshot PNG.
