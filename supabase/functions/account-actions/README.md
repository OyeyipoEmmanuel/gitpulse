# Account actions Edge Function

This function securely revokes a user's GitHub OAuth grant, deletes the stored
GitHub token, and optionally deletes the Supabase Auth user.

Configure the OAuth application credentials as Supabase secrets before deploy:

```sh
supabase login
supabase link --project-ref bgqkkesorbdjpboeusrt
supabase secrets set GITHUB_CLIENT_ID=your_client_id GITHUB_CLIENT_SECRET=your_client_secret
supabase functions deploy account-actions --no-verify-jwt
```

`--no-verify-jwt` is required so browser `OPTIONS` preflight requests reach the
function's CORS handler. The function still authenticates every POST request by
validating its bearer token with `auth.getUser`.

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied automatically by the
Supabase Edge Function environment. Never expose any of these secrets through a
`VITE_` environment variable.
