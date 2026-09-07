import { supabase } from "./supabase"

export const saveProviderToken = async (userId: string, token: string, signal: AbortSignal) => {
    const { error } = await supabase
        .from("user_tokens")
        .upsert({ 
            user_id: userId, 
            github_access_token: token,
            updated_at: new Date().toISOString()
        }, { 
            onConflict: "user_id" 
        }).abortSignal(signal)

    if (error) throw new Error("Your GitHub connection could not be saved. You may need to reconnect after reloading.")
}

export const getProviderToken = async (userId: string, signal: AbortSignal) => {
    const { data, error } = await supabase
        .from("user_tokens")
        .select("github_access_token")
        .eq("user_id", userId)
        .abortSignal(signal)
        .maybeSingle()

    if (error) throw new Error("Your saved GitHub connection could not be loaded. Please try again.")
    return data?.github_access_token ?? null
}
