import { View, Text, TouchableOpacity } from 'react-native';
import { useAppStatus } from '../hooks/useAppStatus';
import { SyncService } from '../features/sync/sync.service';

export const Header = ({ title, openDrawer }: any) => {
  const {
    isOnline,
    isSyncing,
    hasFailed,
  } = useAppStatus();

  const getStatus = () => {
    if (!isOnline) return '🔴 Offline';
    if (isSyncing) return '🔄 Syncing...';
    if (hasFailed) return '⚠ Failed';
    return '🟢 Online ✓';
  };

  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1
    }}>
      <TouchableOpacity onPress={openDrawer}>
        <Text>☰</Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: 'bold' }}>{title}</Text>

      <TouchableOpacity onPress={() => SyncService.syncAll()}>
        <Text>{getStatus()}</Text>
      </TouchableOpacity>
    </View>
  );
};