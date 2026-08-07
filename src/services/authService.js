import { supabase } from '../lib/supabaseClient';

export const authService = {
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  },
};
