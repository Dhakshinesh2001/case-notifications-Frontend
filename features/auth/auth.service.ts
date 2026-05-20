import { authProvider } from '../../app/_layout';
import { ClerkProviderImpl } from './providers/clerk.provider';

let provider= authProvider;

export const AuthService = {
  setProvider: (p: any) => {
    provider = p;
  },

  getToken: async () => {
    return provider.getToken();
  },

  signIn: async () => {
    return provider.signIn();
  },

  signOut: async () => {
    return provider.signOut();
  },

  getUser: async () => {
    return provider.getUser();
  },
};