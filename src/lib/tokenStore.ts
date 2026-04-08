import { supabase } from "./supabase"

export const saveProviderToken = async (userId: string, token: string) => {
    const { error } = await supabase
        .from("user_tokens")
        .upsert({ 
            user_id: userId, 
            github_access_token: token,
            updated_at: new Date().toISOString()
        }, { 
            onConflict: "user_id" 
        })

    if (error) console.error("Failed to save token:", error.message)
}

export const getProviderToken = async (userId: string) => {
    const { data, error } = await supabase
        .from("user_tokens")
        .select("github_access_token")
        .eq("user_id", userId)
        .single()

    if (error) return null
    return data?.github_access_token ?? null
}