import { supabase } from "../lib/supabase"

export const signInWithGithub = async()=>{
    const {error} = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: new URL("/auth/callback", import.meta.env.VITE_APP_URL || window.location.origin).href,
            scopes: "read:user user:email read:org"
        }
    })

    if(error){
        throw new Error("GitHub sign-in could not be started. Please try again.")
    }
}
