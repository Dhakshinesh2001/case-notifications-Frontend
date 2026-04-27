import { runMigrations } from '../db/migrations';
import { Drawer } from 'expo-router/drawer';
import { Header } from '../components/Header';
import { DrawerContent } from '../components/DrawerContent';
import { OfflineBanner } from '../components/OfflineBanner';
import { useEffect } from 'react';
import { SyncService } from '@/features/sync/sync.service';
import { useOrg } from '@/hooks/useOrg';
// import { useAppStatus } from '@/hooks/useAppStatus';

// const title =  "hihi";
export default function RootLayout() {

   useEffect(() => {
    runMigrations(); // 🔥 MUST RUN FIRST
  }, []);

  const { orgId } = useOrg();

useEffect(() => {
  if (!orgId) return;

  SyncService.syncAll();
}, [orgId]);

// const { isOnline, isSyncing, hasFailed } = useAppStatus();
  return (
    <Drawer
      drawerContent={(props: any) => <DrawerContent {...props} />}
      screenOptions={{
        
        header: ({ navigation, route }) => (
          <>
            <Header
              title={route.name}
              // title={title}
              openDrawer={navigation.openDrawer}
            />
            <OfflineBanner />
          </>
        ),
      }}
    />
  );
}