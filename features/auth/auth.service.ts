import { getAuthToken as clerkGetToken, signOut as clerkSignOut } from './clerk.provider';

export const AuthService = {
  /**
   * 🔐 Get auth token (used by apiClient)
   */
  getToken: async () => {
    return await clerkGetToken();
  },

  /**
   * 🚪 Sign out user
   */
  signOut: async () => {
    await clerkSignOut();
  },
};