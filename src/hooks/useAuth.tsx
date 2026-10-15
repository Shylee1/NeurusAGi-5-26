import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { AuthUser, Profile } from '../types';
import { User } from '@supabase/supabase-js';
import { hasExecutiveSession, executiveUser, executiveProfile } from '../lib/executiveAdmin';

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export function useAuth() {
  const { user, profile, loading, login, setProfile, logout, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Executive Admin session (local bootstrap account) takes precedence
    if (hasExecutiveSession()) {
      login(executiveUser());
      setProfile(executiveProfile());
      setLoading(false);
      return () => { mounted = false; };
    }

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        login(mapSupabaseUser(session.user));
        
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (mounted && profileData) {
          setProfile(profileData as Profile);
        }
      }
      if (mounted) setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          login(mapSupabaseUser(session.user));
          
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (mounted && profileData) {
            setProfile(profileData as Profile);
          }
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          logout();
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          login(mapSupabaseUser(session.user));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    loading,
    login,
    setProfile,
    logout,
    setLoading,
    isAdmin: profile?.role === 'admin',
  };
}
