import { runMigrations } from '../db/migrations';
import { Drawer } from 'expo-router/drawer';
import { Header } from '../components/Header';
import { DrawerContent } from '../components/DrawerContent';
import { OfflineBanner } from '../components/OfflineBanner';
import { useEffect, useState } from 'react';
import { OrgProvider } from '@/providers/OrgProvider';

export default function RootLayout() {

  const [isDBReady, setIsDBReady] = useState(false);
  useEffect(() => {

    const init = async () => {
      console.log("Running migrations...");
      runMigrations();
      setIsDBReady(true);
    };

    init();// 🔥 run once on app start
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