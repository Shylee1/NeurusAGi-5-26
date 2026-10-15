import { supabase } from './supabase';
import { executiveSignOut } from './executiveAdmin';
import { User } from '@supabase/supabase-js';
import { AuthUser } from '../types';

class AuthService {
  mapUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email!,
      username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    };
  }

  async sendOtp(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  }

  async verifyOtpAndSetPassword(email: string, token: string, password: string, username?: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;

    const finalUsername = username || email.split('@')[0];
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { username: finalUsername },
    });
    if (updateError) throw updateError;

    // Create profile
    await supabase.from('profiles').upsert({
      id: data.user!.id,
      email,
      username: finalUsername,
      role: 'user',
    });

    return data.user;
  }

  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  }

  async signOut() {
    executiveSignOut();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async updateProfile(userId: string, updates: Partial<{
    username: string;
    location_city: string;
    location_state: string;
    location_country: string;
    compliance_region: string;
  }>) {
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) throw error;
  }
}

export const authService = new AuthService();
