import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  providerToken: string | null;
  loading: boolean;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      providerToken: null, 
      loading: true,

      initialize: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            session,
            user: session?.user,
            loading: false,
          });
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          set({ session, user: session?.user, loading: false });

          if (event === "SIGNED_IN") {
            set({ providerToken: session?.provider_token ?? null });
          }
        });

        return () => subscription.unsubscribe();
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ providerToken: state.providerToken }),
    }
  )
);