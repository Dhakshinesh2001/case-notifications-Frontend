// import { AuthProvider } from '../auth.interface';
// import { getClerkInstance } from '@clerk/clerk-expo';

// const clerk = getClerkInstance();

// export class ClerkProviderImpl implements AuthProvider {
//   async getToken(): Promise<string | null> {
//     try {
//       return await clerk.session?.getToken() ?? null;
//     } catch {
//       return null;
//     }
//   }

//   async signIn() {
//     console.log("Handled via UI");
//   }

//   async signOut() {
//     await clerk.signOut();
//   }

//   async getUser() {
//     const user = clerk.user;

//     if (!user) return null;

//     return {
//       id: user.id,
//       email: user.primaryEmailAddress?.emailAddress,
//     };
//   }
// }


import { AuthProvider } from '../auth.interface';

export class ClerkProviderImpl implements AuthProvider {
  private getTokenFn?: () => Promise<string | null>;
  private signOutFn?: () => Promise<void>;
  private getUserFn?: () => any;

  configure(config: {
    getToken: () => Promise<string | null>;
    signOut: () => Promise<void>;
    getUser: () => any;
  }) {
    this.getTokenFn = config.getToken;
    this.signOutFn = config.signOut;
    this.getUserFn = config.getUser;
  }

  async getToken(): Promise<string | null> {
    if (!this.getTokenFn) return null;

    try {
      return await this.getTokenFn();
    } catch {
      return null;
    }
  }

  async signIn() {
    console.log('Handled via UI');
  }

  async signOut() {
    if (!this.signOutFn) return;

    await this.signOutFn();
  }

  async getUser() {
    if (!this.getUserFn) return null;

    return this.getUserFn();
  }
}