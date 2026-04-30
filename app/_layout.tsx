import { runMigrations } from '../db/migrations';
import { Drawer } from 'expo-router/drawer';
import { Header } from '../components/Header';
import { DrawerContent } from '../components/DrawerContent';
import { OfflineBanner } from '../components/OfflineBanner';
import { useEffect } from 'react';
import { OrgProvider } from '@/providers/OrgProvider';

export default function RootLayout() {
  useEffect(() => {
    runMigrations(); // 🔥 run once on app start
  }, []);

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