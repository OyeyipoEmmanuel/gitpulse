-- PostgREST may read generated and timestamp columns while resolving an upsert.
-- Keep row ownership enforced by RLS while allowing authenticated users to read
-- every column on their own token row.

begin;

grant usage on schema public to authenticated;
grant select (id, user_id, github_access_token, updated_at)
  on table public.user_tokens to authenticated;

do $$
begin
  if not has_column_privilege('authenticated', 'public.user_tokens', 'id', 'SELECT')
     or not has_column_privilege('authenticated', 'public.user_tokens', 'updated_at', 'SELECT') then
    raise exception 'user_tokens upsert fix failed: authenticated is missing required read privileges';
  end if;
end
$$;

commit;
