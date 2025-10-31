import { useState, useEffect } from 'react';
import { localAuth, type LocalUser } from '@/lib/local-auth';

export function useAuth() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = () => {
      const currentUser = localAuth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkSession();

    // Listen for storage changes (when user signs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tailor_ai_session') {
        checkSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for changes (for same-tab updates)
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { user, error } = await localAuth.signUp(email, password, fullName);
    
    if (user && !error) {
      setUser(user);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { user, error } = await localAuth.signIn(email, password);
    
    if (user && !error) {
      setUser(user);
    }
    
    return { error };
  };

  const signOut = async () => {
    localAuth.signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
