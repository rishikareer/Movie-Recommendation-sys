import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile } from '../types';
import { movieApi } from '../services/api';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: UserProfile;
  isConfigured: boolean;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, username: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateGenres: (genres: string[]) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'guest_user',
  username: 'Guest Cinephile',
  preferredGenres: ['Sci-Fi', 'Action', 'Drama']
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load local stored profile if present
    const saved = localStorage.getItem('cinematch_user_profile');
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch {}
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(DEFAULT_PROFILE);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const p: UserProfile = {
          id: data.id,
          username: data.username || email?.split('@')[0] || 'Movie Lover',
          avatarUrl: data.avatar_url,
          preferredGenres: data.preferred_genres || ['Sci-Fi', 'Action']
        };
        setProfile(p);
        localStorage.setItem('cinematch_user_profile', JSON.stringify(p));
      }
    } catch {
      // fallback
    }
  };

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      // Mock login for demo
      const fakeUser = { id: 'demo_' + (email.length * 101 + Date.now()), email };
      setUser(fakeUser);
      const newP: UserProfile = { id: fakeUser.id, username: email.split('@')[0], preferredGenres: ['Sci-Fi', 'Action'] };
      setProfile(newP);
      localStorage.setItem('cinematch_user_profile', JSON.stringify(newP));
      return {};
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (email: string, pass: string, username: string) => {
    if (!isSupabaseConfigured) {
      const fakeUser = { id: 'demo_' + Date.now(), email };
      setUser(fakeUser);
      const newP: UserProfile = { id: fakeUser.id, username, preferredGenres: ['Sci-Fi', 'Action'] };
      setProfile(newP);
      localStorage.setItem('cinematch_user_profile', JSON.stringify(newP));
      return {};
    }
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { username } }
    });
    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('cinematch_user_profile');
  };

  const updateGenres = async (genres: string[]) => {
    const updated = { ...profile, preferredGenres: genres };
    setProfile(updated);
    localStorage.setItem('cinematch_user_profile', JSON.stringify(updated));

    if (isSupabaseConfigured && user) {
      await supabase.from('profiles').update({ preferred_genres: genres }).eq('id', user.id);
    }
    await movieApi.updateProfile(updated);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isConfigured: isSupabaseConfigured,
      loading,
      signIn,
      signUp,
      signOut,
      updateGenres
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
