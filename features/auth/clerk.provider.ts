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