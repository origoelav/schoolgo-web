import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export type UserStatus = 'admin' | 'subscriber' | 'trial' | 'expired';

interface AppState {
  session: Session | null;
  authLoading: boolean;
  isAdmin: boolean;
  userStatus: UserStatus;
  profile: any | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<UserStatus>('trial');

  const fetchProfile = useCallback(async (userId: string, email: string) => {
    try {
      // 1. Check Admin
      let adminCheck = false;
      if (email.toLowerCase() === 'origoela@gmail.com') {
        adminCheck = true;
      } else {
        const { data: adminData } = await supabase
          .from('admin_emails')
          .select('email')
          .eq('email', email)
          .maybeSingle();
        adminCheck = !!adminData;
      }
      setIsAdmin(adminCheck);

      // 2. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      // 3. Calculate Status
      if (adminCheck) {
        setUserStatus('admin');
      } else if (profileData?.subscription_status === 'active') {
        setUserStatus('subscriber');
      } else if (profileData?.trial_expires_at && new Date() < new Date(profileData.trial_expires_at)) {
        setUserStatus('trial');
      } else {
        setUserStatus('expired');
      }
    } catch (err) {
      console.error('Error fetching profile/status:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await fetchProfile(session.user.id, session.user.email || '');
    }
  }, [session, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id, s.user.email || '');
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id, newSession.user.email || '');
      } else {
        setIsAdmin(false);
        setProfile(null);
        setUserStatus('trial');
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(false);
    setProfile(null);
    setUserStatus('trial');
  };

  return (
    <AppContext.Provider value={{ session, authLoading, isAdmin, userStatus, profile, signOut, refreshProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
