# Stage 2: authentication and GitHub token lifecycle

## Status

Frontend hardening is implemented. The least-privilege database migration was
successfully applied and its metadata report verified on 2026-09-05. An
authenticated OAuth smoke test still needs project-owner participation. Stage 1
edits are preserved.

## What changed

- Zustand no longer persists a duplicate copy of the Supabase session and GitHub
  token. Initialization removes only the legacy `auth-store` localStorage key;
  Supabase remains responsible for its own session storage and renewal.
- Auth events are handled synchronously. Token recovery/persistence is deferred
  outside Supabase's auth lock. Stale session lookups and canceled component
  lifecycles cannot overwrite newer account state.
- Recovery coalesces simultaneous requests. It uses the new OAuth provider token
  when available, otherwise reads the signed-in user's saved token. Before making
  it available to dashboards, it calls GitHub `/user` and matches the GitHub ID
  (or login for older metadata) to the Supabase user. Recovery requests have a
  15-second abort timeout.
- Account selection no longer requires a token to be in memory before recovery
  can start. Protected routes wait for verification. Missing/revoked/mismatched
  credentials show reconnect; network/database failures show retry. Failed token
  saving is visible but does not block a token GitHub has already verified.
- Logout buttons now work on both dashboard sidebars, account selection, and
  the signed-in landing navigation. Logout clears in-memory provider access and
  cancels/clears the shared query cache immediately. Failed or timed-out sign-out
  requests show an error; they do not claim that Supabase has ended the session.
- New accounts and new provider credentials reset cached queries and remount
  protected page state. Token recovery and API responses from old account
  generations cannot repopulate current state.
- All GitHub REST/GraphQL network calls use an authentication boundary. It sends
  credentials only to `https://api.github.com`, detects HTTP 401, invalidates only
  the current token, and suppresses pointless auth retries. HTTP 403/429 are not
  treated as proof of invalid credentials. General API error handling is Stage 3.
- OAuth initiation failures are visible. Failed callbacks show retry/home actions
  rather than navigating to the nonexistent `/login` route. Successful callbacks
  use an encoded account-selection path. The free-plan sign-in button now works.
- New OAuth requests ask for `read:user user:email read:org`, not `public_repo`.
  The latter includes repository write privileges; it was not read-only.

Supabase warns that awaiting other Supabase calls inside auth callbacks can
deadlock. The installed auth SDK documents this at `onAuthStateChange`; see also
the [Supabase auth event documentation](https://supabase.com/docs/reference/javascript/auth-onauthstatechange).
Scope meanings are documented in [GitHub's OAuth scope reference](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps).

## Security boundary that remains

This is still a browser-only GitHub client, not a server-held-token design.
Removing Zustand persistence does **not** make tokens inaccessible to JavaScript:
Supabase's persisted session can include a provider token, and `user_tokens` still
holds the raw token as in the original architecture. XSS protection and correct
database access policies remain essential. A backend/Edge Function migration and
encryption/key-management design require a separate deployment decision.

Logging out is not GitHub token revocation. It ends the local Supabase session
(including same-origin tabs) without intentionally logging out other devices or
deleting the saved database row. Existing OAuth grants/tokens are not automatically
stripped of earlier privileges by this code change. To fully remove a previously
granted `public_repo` permission, the user should review/revoke the old GitPulse
grant in GitHub's authorized OAuth apps, then reconnect. Do not revoke unrelated
apps or credentials.

## Supabase audit result

The consolidated metadata report confirms:

- RLS is enabled. It is not forced, which is normal for this client path; the
  table owner and bypass roles are outside the publishable-key client role.
- The existing permissive `ALL` policy applies to `public` but uses both
  `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)`.
  Because `user_id` is non-null and unauthenticated `auth.uid()` is null, it
  provides correct row ownership for ordinary SELECT/INSERT/UPDATE/DELETE.
- `user_id` is unique, indexed, and has an `ON DELETE CASCADE` foreign key to
  `auth.users(id)`. No dependent views were reported.
- Both client roles have all table privileges. This is excessive and includes
  `TRUNCATE`, `TRIGGER`, and `REFERENCES`; TRUNCATE and REFERENCES do not use RLS.
  The app needs no anonymous table access and needs only authenticated token
  SELECT/INSERT/UPDATE access.

An anonymous REST count probe returned HTTP 200 with zero visible rows. That
supports the current row policy but cannot replace authenticated cross-user tests.

The applied idempotent migration
`supabase/migrations/20260905000000_harden_user_tokens.sql` revokes both client
roles, grants back only required authenticated column operations, replaces the
broad policy with explicit authenticated SELECT/INSERT/UPDATE policies, and
aborts if critical grant postconditions are not met. It preserves `postgres` and
`service_role` privileges and does not inspect, rotate, or delete token values.

The post-migration `supabase/audits/user_tokens_security_report.sql` result confirms:

- `anon` has no table or column privileges.
- `authenticated` has no DELETE/TRUNCATE/TRIGGER/REFERENCES privileges and only
  the listed column-level SELECT/INSERT/UPDATE privileges.
- Exactly three policies target `authenticated`, with ownership checks for
  SELECT, INSERT, and UPDATE.

Do not share the database password, service-role key, provider tokens, or session JWTs.

Review targets:

- `public.user_tokens` exists with `user_id` uniquely constrained for upserts and
  related to `auth.users.id` as appropriate for the deployed schema.
- RLS is enabled. Client-accessible SELECT and UPDATE policies limit rows to
  `auth.uid() = user_id`. INSERT and UPDATE checks enforce that ownership too.
- Review **all** policies, not just a newly named policy: permissive policies can
  combine to widen access. Anonymous/PUBLIC grants, views, and privileged RPCs
  must not offer a route to read or mutate other users' tokens.
- In staging, verify two distinct users cannot read, insert, or update one
  another's rows, and anonymous requests cannot access credentials. A client-side
  `.eq("user_id", ...)` filter is not an authorization control.

See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Verification and remaining manual checks

Run `npm test`, `npm run build`, and `npm run lint`. Auth tests mock external
services; they never access live credentials or write database records. They cover
initial/fresh/saved sessions, recovery deduplication, wrong-account/revoked tokens,
timeouts, logout, cross-tab sign-out events, account switching, late responses,
StrictMode cleanup, scopes, callback routing, token repository failures, and route
gate rendering. The two expected failures from Stage 1 remain unrelated.

Recorded verification: 117 normal test passes and 2 expected failures across
10 files; TypeScript/production build passes with the existing font/chunk
warnings. Full-project ESLint reports 15 pre-existing errors and 1 warning
(the auth initialization dependency warning was resolved).

Local browser checks verified the signed-out landing page, failed OAuth callback,
Return home action, and redirect away from a protected route when signed out.

Still run with an authorized test account before release:

1. Sign in through GitHub, confirm account selection and profile loading, then reload.
2. Open a second tab, log out in the first, and confirm both clear protected content.
3. Sign in as another GitHub account and confirm no previous account's data appears.
4. Revoke the GitPulse test-account grant on GitHub; refresh a dashboard and confirm
   the reconnect screen, then reconnect successfully.
5. Simulate a temporary network/database failure and verify retry, not a forced
   credential-revocation message. Verify a failed sign-out is visibly reported.
6. Confirm Supabase's redirect allowlist includes the configured `VITE_APP_URL`
   callback. For local OAuth, configure the local origin and allowlist deliberately;
   the test server does not overwrite the production redirect configuration.

Full-project lint still has pre-existing findings. No lint rules were disabled
to make the new auth files pass. Browser XSS hardening, general GraphQL error
handling/pagination, and other previously planned stages remain separate work.
