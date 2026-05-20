import { runMigrations } from '../db/migrations';
import { Drawer } from 'expo-router/drawer';
import { Header } from '../components/Header';
import { DrawerContent } from '../components/DrawerContent';
import { OfflineBanner } from '../components/OfflineBanner';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { useEffect, useState } from 'react';

// import { OrgProvider } from '@/providers/OrgProvider';

import * as Notifications from 'expo-notifications';

import { NotificationService } from '@/features/notification/notification.service';
import { PermissionService } from '@/features/permission/permission.service';

import { ClerkProvider, useAuth } from '@clerk/clerk-expo';

import { Redirect, Slot } from 'expo-router';
import { ClerkProviderImpl } from '@/features/auth/providers/clerk.provider';
import { AuthBootstrapper } from '@/components/AuthBootStrapper';

export const authProvider = new ClerkProviderImpl();

function ProtectedLayout() {
  const { isLoaded, isSignedIn } = useAuth();
//   console.log('KEYS:', {
//   clerk: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
// });

  if (!isLoaded) {
    return null;
  }

  // if (!isSignedIn) {
  //   return <Redirect href="./(auth)/sign-in" />;
  // }

  return (
    // <OrgProvider>
    <>
     <Header title="App" />
      <OfflineBanner />
      <Slot /></>
    // </OrgProvider>
  );
}

export default function RootLayout() {
  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const isAllowed =
        await PermissionService.requestNotificationPermissions();

      if (isAllowed) {
        await NotificationService.initBackgroundFetch();
      }

      console.log('Running migrations...');
      runMigrations();

      setIsDBReady(true);
    };

    initializeApp();
  }, []);

  if (!isDBReady) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    ><AuthBootstrapper />
      <ProtectedLayout />
    </ClerkProvider>
  );
}