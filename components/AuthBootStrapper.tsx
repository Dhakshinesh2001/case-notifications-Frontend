import { authProvider } from '@/app/_layout';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
// import { authProvider } from './path/to/provider';

export function AuthBootstrapper() {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    authProvider.configure({
      getToken,
      signOut,
      getUser: () => {
        if (!user) return null;

        return {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
        };
      },
    });
  }, [user]);

  return null;
}