
import { supabase } from "@/integrations/supabase/client";

export interface AuthUser {
  id: string;
  email?: string;
}

export const AuthService = {
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  register: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    
    return {
      id: data.user.id,
      email: data.user.email,
    };
  },
  
  onAuthStateChange: (callback: (user: AuthUser | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email,
        });
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
    
    return data.subscription.unsubscribe;
  }
};
