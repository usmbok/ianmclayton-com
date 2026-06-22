import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; mfaRequired: boolean; factorId: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  verifyMfa: (factorId: string, code: string) => Promise<{ error: string | null }>;
  enrollMfa: () => Promise<{ error: string | null; qrCode: string | null; secret: string | null; factorId: string | null }>;
  confirmMfaEnrollment: (factorId: string, code: string) => Promise<{ error: string | null }>;
  unenrollMfa: (factorId: string) => Promise<{ error: string | null }>;
  listMfaFactors: () => Promise<{ id: string; status: string; friendly_name?: string }[]>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  isAdmin: false,
  signIn: async () => ({ error: null, mfaRequired: false, factorId: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  verifyMfa: async () => ({ error: null }),
  enrollMfa: async () => ({ error: null, qrCode: null, secret: null, factorId: null }),
  confirmMfaEnrollment: async () => ({ error: null }),
  unenrollMfa: async () => ({ error: null }),
  listMfaFactors: async () => [],
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function fetchProfile(userId: string) {
    setProfileLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data ?? null);
    setProfileLoading(false);
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setProfileLoading(true);
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, mfaRequired: false, factorId: null };

    // Check if MFA is required (user has verified TOTP factors)
    const { data: factorsData } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factorsData?.totp?.find(f => f.status === 'verified');

    if (verifiedFactor && data.session) {
      // AAL1 session exists — need to elevate to AAL2 via TOTP
      return { error: null, mfaRequired: true, factorId: verifiedFactor.id };
    }

    return { error: null, mfaRequired: false, factorId: null };
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function verifyMfa(factorId: string, code: string) {
    const { error: challengeError, data: challengeData } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) return { error: challengeError.message };

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });
    return { error: error?.message ?? null };
  }

  async function enrollMfa() {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) return { error: error.message, qrCode: null, secret: null, factorId: null };
    return {
      error: null,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      factorId: data.id,
    };
  }

  async function confirmMfaEnrollment(factorId: string, code: string) {
    const { error: challengeError, data: challengeData } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) return { error: challengeError.message };

    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challengeData.id,
      code,
    });
    return { error: error?.message ?? null };
  }

  async function unenrollMfa(factorId: string) {
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return { error: error?.message ?? null };
  }

  async function listMfaFactors() {
    const { data } = await supabase.auth.mfa.listFactors();
    return data?.totp ?? [];
  }

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      profileLoading,
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      verifyMfa,
      enrollMfa,
      confirmMfaEnrollment,
      unenrollMfa,
      listMfaFactors,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
