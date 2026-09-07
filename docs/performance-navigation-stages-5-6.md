# Stages 5–6: performance and complete navigation

## Status

Implemented locally on 2026-09-06. The supported application routes no longer
resolve to blank screens, GitHub-backed queries use one bounded cache policy, and
repository star-history requests are batched.

## Performance changes

- Repository star history is requested in batches of up to ten repositories per
  GraphQL operation. Pagination continues only while a page can still contain
  stars from the last 30 days, preserving the displayed result while reducing
  request count.
- The shared repository query no longer requests archived/fork flags, issue data,
  language edges, push timestamps, or commit timestamps that none of its consumers
  use.
- All React Query requests now share a five-minute freshness window, a 30-minute
  garbage-collection window, and no automatic window-focus refetch.
- Report Card and Career Snapshot continue to reuse the same profile, repository,
  productivity, and report-card cache entries without permanently caching them.
- Dashboard routes and the Career Snapshot export dependency remain lazy-loaded.

## Navigation changes

- Unknown URLs render a dedicated, accessible 404 page.
- Route rendering failures use an accessible recovery page with a reload action.
- Unknown personal, organization, and dashboard child routes have explicit
  not-found handling.
- Every organization navigation item now resolves to a named coming-soon state.
  Organization Profile is also explicit instead of rendering a blank page.
- Personal and organization dashboard index routes continue to use deterministic
  profile defaults.

## Verification

- `npm test`: 147 tests pass across 20 files.
- `npm run build`: passes.
- `npm run lint`: passes.
- `git diff --check`: passes.
- Browser: public 404 and signed-out protected-route redirect verified.

An authenticated browser session was not available to the isolated browser. The
authenticated dashboard traversal and Career Snapshot download remain release
smoke checks rather than unresolved implementation work.
