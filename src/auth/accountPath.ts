import type { User } from "@supabase/supabase-js"

export function accountPath(user: User) {
  return `/${encodeURIComponent(user.user_metadata.user_name || user.id)}/select-account`
}

export function hasOAuthError(search: string, hash: string) {
  return [search, hash].some(value => {
    const params = new URLSearchParams(value.replace(/^[?#]/, ""))
    return params.has("error") || params.has("error_description") || params.has("error_code")
  })
}
