import { createClient } from "npm:@supabase/supabase-js@2"

type AccountAction = "disconnect" | "delete-account"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
})

async function revokeGithubGrant(token: string, clientId: string, clientSecret: string) {
  const response = await fetch(`https://api.github.com/applications/${encodeURIComponent(clientId)}/grant`, {
    method: "DELETE",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "GitPulse-account-controls",
    },
    body: JSON.stringify({ access_token: token }),
  })

  // A missing grant is already disconnected and is safe to treat as success.
  if (response.status !== 204 && response.status !== 404) {
    throw new Error(`GitHub grant revocation failed with status ${response.status}`)
  }
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") return json({ success: false, error: "Method not allowed." }, 405)

  const authorization = request.headers.get("Authorization")
  const jwt = authorization?.replace(/^Bearer\s+/i, "")
  if (!jwt) return json({ success: false, error: "Authentication is required." }, 401)

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const githubClientId = Deno.env.get("GITHUB_CLIENT_ID")
  const githubClientSecret = Deno.env.get("GITHUB_CLIENT_SECRET")
  if (!supabaseUrl || !serviceRoleKey || !githubClientId || !githubClientSecret) {
    return json({ success: false, error: "Account controls are not configured." }, 503)
  }

  let payload: { action?: AccountAction; confirmation?: string }
  try {
    payload = await request.json()
  } catch {
    return json({ success: false, error: "A valid request body is required." }, 400)
  }

  if (payload.action !== "disconnect" && payload.action !== "delete-account") {
    return json({ success: false, error: "Unsupported account action." }, 400)
  }
  if (payload.action === "delete-account" && payload.confirmation !== "DELETE") {
    return json({ success: false, error: "Account deletion was not confirmed." }, 400)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: { user }, error: userError } = await admin.auth.getUser(jwt)
  if (userError || !user) return json({ success: false, error: "Your session is no longer valid." }, 401)

  const { data: tokenRow, error: tokenError } = await admin
    .from("user_tokens")
    .select("github_access_token")
    .eq("user_id", user.id)
    .maybeSingle()

  if (tokenError) return json({ success: false, error: "Your stored GitHub connection could not be loaded." }, 500)

  try {
    if (tokenRow?.github_access_token) {
      await revokeGithubGrant(tokenRow.github_access_token, githubClientId, githubClientSecret)
    }
  } catch {
    return json({ success: false, error: "GitHub did not confirm the disconnection. Please try again." }, 502)
  }

  const { error: deleteTokenError } = await admin.from("user_tokens").delete().eq("user_id", user.id)
  if (deleteTokenError) return json({ success: false, error: "The stored GitHub credential could not be removed." }, 500)

  if (payload.action === "delete-account") {
    const { error: deleteUserError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteUserError) {
      return json({ success: false, error: "GitHub was disconnected, but the GitPulse account could not be deleted. Please retry." }, 500)
    }
  }

  return json({ success: true, action: payload.action })
})
