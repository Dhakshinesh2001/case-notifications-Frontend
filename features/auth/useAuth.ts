import { useEffect, useState } from 'react';
import { AuthService } from './auth.service';
import { Clerk } from '@clerk/clerk-expo';

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const u = await AuthService.getUser();
    setUser(u);
    setLoading(false);
  };

  useEffect(() => {
  const unsubscribe = Clerk.addListener(() => {
    loadUser();
  });

  return unsubscribe;
}, []);
  useEffect(() => {
    loadUser();
  }, []);

  return {
    user,
    loading,
    isSignedIn: !!user,
    refresh: loadUser,
  };
};