# Stage 1: testing baseline

Recorded on 2026-09-02 against commit `5a9efd3`, before the later stabilization
stages. This is a calculator regression baseline, not a production-readiness or
authenticated end-to-end sign-off.

## Run the checks

Use Node 22.12+ on the Node 22 line (verified here with Node 22.22.2 and npm 10.9.1).
From the repository root:

```sh
npm ci
npm test
npm run lint
npm run build
```

For local iteration:

```sh
npm run test:watch
npm test -- src/lib/streakCalculator.test.ts
```

The tests use Vitest 4.1.11, a dedicated Node configuration, and explicit test API
imports. They do not import React pages, Supabase, or GitHub services and require
no credentials or API requests. The consistency tests freeze the clock at
`2026-09-02T12:00:00Z` and restore it after each test. Dependencies must be installed
before the tests can run. See the [Vitest guide](https://vitest.dev/guide/) and
[date mocking documentation](https://vitest.dev/guide/mocking/dates).

## Measured results

| Check | Before Stage 1 | After Stage 1 |
| --- | --- | --- |
| Unit tests | No test script or suite | 3 files; 52 normal passes and 2 expected failures |
| TypeScript and production build | Pass | Pass |
| Full ESLint run | Fail: 17 errors, 2 warnings | Fail: 15 errors, 2 warnings |
| Font import warnings | 3 | Still present |
| Large JavaScript chunk warning | Present; about 1,049.56 kB minified / 310.23 kB gzip | Still present; optimization deferred |

The earlier review's statement that lint passed was incorrect. The full exit
status was checked for this baseline. Extracting and typing the consistency
helper removes its mixed-component-export and explicit-`any` errors; no lint
rules were disabled or weakened. Remaining findings concern hook dependencies,
state updates in effects, impure render-time code, mixed exports, explicit `any`,
an unused catch variable, and a `prefer-const` issue elsewhere in the app.

## Changes and coverage

- Added `npm test` (one run) and `npm run test:watch`.
- Added a standalone `vitest.config.ts`, included in TypeScript's configuration
  checks. Unit test files are also checked by the existing app TypeScript project.
- Moved `calculateConsistencyScore` from `IndividualProductivity.tsx` into
  `src/lib/consistencyCalculator.ts` and updated both consuming pages. The formula,
  thresholds, colors, rounding, date comparison, and no-data behavior are unchanged.
- Streak tests cover empty/all-zero calendars, single days, contribution quantity,
  today's grace day, interrupted streaks, longest-streak date bounds, ties, year
  boundaries, and non-mutation.
- Grading tests cover empty input, every grade threshold and color, equal weights,
  zero-valued dimensions, fractional averages, and non-mutation.
- Consistency tests cover all remark boundaries and colors, integer rounding,
  active-day versus contribution-count semantics, today's inclusion, future-day
  exclusion, report-card grade composition, and non-mutation.

## Calculation contracts

Streak helpers currently expect a complete, ascending daily calendar with today
as its final entry. They count adjacent array entries, do not sort the input or
validate calendar gaps, and do not consult the clock. `getCurrentStreak` skips one
trailing inactive entry, allowing today to remain open for contributions.
`getLongestStreak` keeps the earliest streak when lengths tie.

Consistency accepts flattened days, not nested API weeks. It measures the rounded
percentage of supplied non-future days that have at least one contribution. It
does not itself enforce a 12-month window; callers are responsible for that range.

Grading averages all supplied scores equally, without rounding before grading:
A >= 80, B >= 65, C >= 50, D >= 40, E >= 30, F < 30. Valid scores are expected to
be finite percentages from 0 to 100. The current implementation does not enforce
that constraint or sanitize missing/non-finite values.

## Empty accounts and missing data

These targets distinguish a successful zero-activity response from an incomplete
or failed response. The desired no-data behavior below is documented for the
later API/analytics stages; it has not been implemented in this stage.

| Scenario | Current behavior | Expected product behavior |
| --- | --- | --- |
| Complete calendar with all zero contributions | Current/longest streak 0; longest dates null; consistency 0, Very Poor | Preserve the measured zeros; show no achieved streak date |
| Empty contribution array | Streaks 0/null; consistency score `NaN`, remark Very Poor | No observable period: unavailable consistency score (`null`), not `NaN` or an invented 0% |
| Only future contribution dates | Consistency score `NaN`, remark Very Poor | Unavailable consistency score (`null`); no eligible observations |
| No grade dimensions (`[]`) | Grade helper returns `null` | Unavailable overall grade, not a failing grade |
| Actual zero score (`[0]`) | Grade F with score 0 | Preserve the measured score under the existing grading scheme |
| Missing/null API fields or a failed request | Helpers assume valid arrays; callers can throw or propagate `NaN` | Error/retry or unavailable state; never silently treat it as a zero-activity account |
| No PRs or repositories in report-card data | Several dimension formulas divide by zero | Explicit unavailable dimensions; resolve aggregation policy during the analytics stage |

### Two expected failures

The consistency suite uses `it.fails` for the empty-calendar and future-only
calendar cases, asserting the intended `null` score. These assertions execute
and currently fail because the implementation returns `NaN`. They are not skipped
and do not indicate that those defects have been repaired.

When fixing no-data behavior, remove `.fails` from the tests. If the assertions
start passing while still marked `.fails`, Vitest fails the run so the baseline
must be updated. Any later change to the selected no-data representation should
update this document, the assertions, and consumers together.

## Deferred checks

- Auth/token recovery, logout/cache isolation, and Supabase policy verification.
- REST/GraphQL errors, rate limits, pagination, and analytics completeness.
- Full report-card dimension formulas and missing/non-finite input validation.
- Component rendering, accessibility, responsive layout, browser journeys, and PNG export.
- Existing lint errors, font imports, and bundle optimization.

No authentication settings, database policies, API access, scoring thresholds, or
dashboard layouts were changed in Stage 1.
