import { runMigrations } from '../db/migrations';
import { Drawer } from 'expo-router/drawer';
import { Header } from '../components/Header';
import { DrawerContent } from '../components/DrawerContent';
import { OfflineBanner } from '../components/OfflineBanner';
import { useEffect, useState } from 'react';
import { OrgProvider } from '@/providers/OrgProvider';
import * as Notifications from 'expo-notifications';
import { NotificationService } from '@/features/notification/notification.service';
import { PermissionService } from '@/features/permission/permission.service';
// import { PermissionService } from  



export default function RootLayout() {

  const [isDBReady, setIsDBReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const isAllowed = await PermissionService.requestNotificationPermissions();
      
      if (isAllowed) {
        // Now that we have permissions, start the background check
        await NotificationService.initBackgroundFetch();
      }
    };

    initializeApp();
  }, []);
  useEffect(() => {

    const init = async () => {
      console.log("Running migrations...");
      runMigrations();
      setIsDBReady(true);

    };
    NotificationService.initBackgroundFetch();

    init();// 🔥 run once on app start
  }, []);

  useEffect(() => {
  Notifications.requestPermissionsAsync();
}, []);
  if (!isDBReady) {
    return null; // or splash screen
  }

  return (
    <OrgProvider>
      <Drawer
        drawerContent={(props: any) => <DrawerContent {...props} />}
        screenOptions={{
          header: ({ navigation, route }) => (
            <>
              <Header
                title={route.name}
                openDrawer={navigation.openDrawer}
              />
              <OfflineBanner />
            </>
          ),
        }}
      />
    </OrgProvider>
  );
}