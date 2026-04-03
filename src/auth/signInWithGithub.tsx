import { supabase } from "../lib/supabase"

export const signInWithGithub = async()=>{
    const {error} = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: "http://localhost:5173/auth/callback",
            scopes: "read:user user:email public_repo read:org"
        }
    })

    if(error){
        console.error("Error: " + error.message)
    }
}