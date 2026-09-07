# Stage 3: GitHub API and analytics reliability

## Status

Implemented locally on 2026-09-05. The production build passes and 138 tests pass
across 13 files. Live authenticated GitHub smoke testing is still required before
release because the automated tests do not use real credentials or consume API
quota.

## Data-fetching contract

- REST requests now fail on non-success HTTP responses instead of allowing error
  payloads to reach dashboard calculations.
- HTTP 401 still invalidates only the current GitHub credential. HTTP 403/429 rate
  limits produce a distinct, actionable error and never invalidate a valid token.
- GraphQL responses with an `errors` array are rejected even when GitHub also
  returns partial `data`. Missing and malformed data is not presented as a complete
  result.
- Repository, pull-request, organization, review, and relevant stargazer
  connections are fully paginated. Invalid/repeated cursors and explicit safety
  limits fail visibly rather than silently truncating metrics.
- Aggregate screens offer an explicit Retry action. Retry rules avoid repeating
  authentication failures, GraphQL failures, rate limits, and non-transient 4xx
  responses automatically.
- GitHub's public events endpoint exposes at most 300 recent events. The hourly
  chart now states that limit instead of claiming a complete 90-day history.

## Analytics contract

- An empty or future-only contribution calendar has an unavailable consistency
  score (`null`), not `NaN` and not an invented zero.
- A complete calendar with no activity remains a real 0% measurement.
- Empty pull-request/repository populations make dependent code-quality and
  maintenance dimensions unavailable. They are excluded from the overall average.
- A complete observation showing zero open-source or collaboration activity remains
  a measured zero and can receive the existing F grade.
- Non-finite and out-of-range grade inputs are rejected.
- Progress bars guard zero denominators, and the PR/review/issue contribution labels
  now map to the correct values.
- Career contribution-history failures are visible and retryable; they are no longer
  caught and silently rendered as zero activity.

## Verification

Run:

```sh
npm test
npm run build
npm run lint
```

Current results:

- Tests: 138 passed; no expected failures remain.
- TypeScript and production build: pass.
- ESLint: passes.
- Existing CSS font-import and large-chunk build warnings remain.

Before release, test a user with more than 100 repositories/PRs, an empty account,
a rate-limited response, a nonexistent username, and a normal authenticated account.
