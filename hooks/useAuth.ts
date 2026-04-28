import { useUser, useAuth } from '@clerk/clerk-expo';

export const useAuthData = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  return {
    user,
    signOut,
  };
};