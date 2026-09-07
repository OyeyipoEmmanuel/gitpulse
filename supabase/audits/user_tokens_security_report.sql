-- Read-only, single-result metadata audit for Supabase SQL Editor.
-- It never reads user_tokens rows or token values.
-- Share the one JSON result so every section can be reviewed together.

select jsonb_build_object(
  'table_security', coalesce((
    select jsonb_agg(to_jsonb(q)) from (
      select n.nspname as schema_name, c.relname as table_name,
             c.relrowsecurity as rls_enabled,
             c.relforcerowsecurity as rls_forced,
             pg_get_userbyid(c.relowner) as table_owner
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'columns', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.ordinal_position) from (
      select ordinal_position, column_name, data_type, udt_name,
             is_nullable, column_default
      from information_schema.columns
      where table_schema = 'public' and table_name = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'constraints', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.constraint_name) from (
      select con.conname as constraint_name, con.contype as constraint_type,
             pg_get_constraintdef(con.oid) as definition
      from pg_constraint con
      join pg_class c on c.oid = con.conrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'indexes', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.indexname) from (
      select indexname, indexdef
      from pg_indexes
      where schemaname = 'public' and tablename = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'policies', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.policyname) from (
      select policyname, permissive, roles, cmd, qual, with_check
      from pg_policies
      where schemaname = 'public' and tablename = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'table_privileges', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.grantee, q.privilege_type) from (
      select grantee, privilege_type, is_grantable
      from information_schema.table_privileges
      where table_schema = 'public' and table_name = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'column_privileges', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.grantee, q.column_name, q.privilege_type) from (
      select grantee, column_name, privilege_type, is_grantable
      from information_schema.column_privileges
      where table_schema = 'public' and table_name = 'user_tokens'
    ) q
  ), '[]'::jsonb),
  'dependent_views', coalesce((
    select jsonb_agg(to_jsonb(q) order by q.view_schema, q.view_name) from (
      select view_schema, view_name
      from information_schema.view_table_usage
      where table_schema = 'public' and table_name = 'user_tokens'
    ) q
  ), '[]'::jsonb)
) as user_tokens_security_report;
