import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";

interface AuthState {
    user: User | null
    session: Session | null
    loading: boolean
    initialize: () => () => void
}

// let ses: Session | null;
// supabase.auth.getSession().then(({data: {session}}) => {
//     ses = session
// })

export const useAuthStore = create<AuthState>((set)=>({
    user: null,
    session: null,
    loading: true,
    
    initialize: ()=>{
        supabase.auth.getSession().then(({ data: { session }}) =>{
            set({
                session,
                user: session?.user,
                loading: false
            })
        })

        //Listen for changes
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_, session)=>{
            set({
                session,
                user: session?.user,
            })
        })

        return ()=>subscription.unsubscribe()
    }
}))