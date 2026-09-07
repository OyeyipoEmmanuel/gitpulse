-- Restrict browser access to the operations GitPulse actually performs.
-- This migration does not read, rotate, delete, or expose existing tokens.

begin;

alter table public.user_tokens enable row level security;

-- New Supabase tables can inherit broad grants. Remove them before granting
-- only the columns used by tokenStore.ts. In particular, TRUNCATE and
-- REFERENCES are not protected by row-level security.
revoke all privileges on table public.user_tokens from anon, authenticated;

grant select (user_id, github_access_token)
  on table public.user_tokens to authenticated;
grant insert (user_id, github_access_token, updated_at)
  on table public.user_tokens to authenticated;
grant update (user_id, github_access_token, updated_at)
  on table public.user_tokens to authenticated;

drop policy if exists "Users can manage their own tokens" on public.user_tokens;
drop policy if exists "Users can read their own token" on public.user_tokens;
drop policy if exists "Users can insert their own token" on public.user_tokens;
drop policy if exists "Users can update their own token" on public.user_tokens;

create policy "Users can read their own token"
  on public.user_tokens
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own token"
  on public.user_tokens
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own token"
  on public.user_tokens
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Fail the transaction if the most important privilege postconditions are not
-- true. service_role and postgres grants are intentionally left unchanged.
do $$
begin
  if has_any_column_privilege('anon', 'public.user_tokens', 'SELECT,INSERT,UPDATE,REFERENCES')
     or has_table_privilege('anon', 'public.user_tokens', 'DELETE')
     or has_table_privilege('anon', 'public.user_tokens', 'TRUNCATE')
     or has_table_privilege('anon', 'public.user_tokens', 'TRIGGER') then
    raise exception 'user_tokens hardening failed: anon retains a privilege';
  end if;

  if has_table_privilege('authenticated', 'public.user_tokens', 'DELETE')
     or has_table_privilege('authenticated', 'public.user_tokens', 'TRUNCATE')
     or has_table_privilege('authenticated', 'public.user_tokens', 'TRIGGER')
     or has_table_privilege('authenticated', 'public.user_tokens', 'REFERENCES') then
    raise exception 'user_tokens hardening failed: authenticated retains a broad privilege';
  end if;

  if not has_column_privilege('authenticated', 'public.user_tokens', 'user_id', 'SELECT')
     or not has_column_privilege('authenticated', 'public.user_tokens', 'github_access_token', 'SELECT')
     or not has_column_privilege('authenticated', 'public.user_tokens', 'github_access_token', 'INSERT')
     or not has_column_privilege('authenticated', 'public.user_tokens', 'github_access_token', 'UPDATE') then
    raise exception 'user_tokens hardening failed: authenticated is missing a required column privilege';
  end if;
end
$$;

commit;
