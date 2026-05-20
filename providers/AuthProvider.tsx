// import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
// import * as SecureStore from 'expo-secure-store';

// const tokenCache = {
//   getToken: (key: string) => SecureStore.getItemAsync(key),
//   saveToken: (key: string, value: string) =>
//     SecureStore.setItemAsync(key, value),
// };

// export const AuthProvider = ({ children }: any) => {
//   return (
//     <ClerkProvider
//       publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
//       tokenCache={tokenCache}
//     >
//       {children}r
//     </ClerkProvider>
//   );
// };