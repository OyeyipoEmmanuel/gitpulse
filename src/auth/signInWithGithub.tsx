import { supabase } from "../lib/supabase"

export const signInWithGithub = async()=>{
    const {error} = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${import.meta.env.VITE_APP_URL}/auth/callback`,
            scopes: "read:user user:email public_repo read:org"
        }
    })

    if(error){
        console.error("Error: " + error.message)
    }
}