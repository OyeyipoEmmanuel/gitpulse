-- Read-only metadata audit. Run in the project's Supabase SQL Editor.
-- No token values or table rows are read. Share all result sets for review.

select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'user_tokens';

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'user_tokens'
order by ordinal_position;

select con.conname, con.contype, pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'user_tokens';

select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename = 'user_tokens';

select policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'user_tokens'
order by policyname;

select grantee, privilege_type
from information_schema.table_privileges
where table_schema = 'public' and table_name = 'user_tokens'
order by grantee, privilege_type;

select grantee, column_name, privilege_type
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'user_tokens'
order by grantee, column_name, privilege_type;
