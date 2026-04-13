import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";
import { saveProviderToken, getProviderToken } from "@/lib/tokenStore";

interface AuthState {
  user: User | null;
  session: Session | null;
  providerToken: string | null;
  loading: boolean;
  initialize: () => () => void;
  getToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      providerToken: null,
      loading: true,

      initialize: () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            session,
            user: session?.user ?? null,
            loading: false,
          });
          
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          set({ session, user: session?.user ?? null, loading: false });

          if (
            event === "SIGNED_IN" &&
            session?.provider_token &&
            session?.user
          ) {
            await saveProviderToken(session.user.id, session.provider_token);
            set({ providerToken: session.provider_token });
          }
        });

        return () => subscription.unsubscribe();
      },

      getToken: async () => {
        const { providerToken, user } = get();
        if (providerToken) return providerToken;
        if (!user) return null;

        const token = await getProviderToken(user.id);
        set({ providerToken: token });
        return token;
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        providerToken: state.providerToken,
        user: state.user,
        session: state.session,
      }),
    }
  )
);
