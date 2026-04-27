import { View, Text } from 'react-native';
import { useAppStatus } from '../hooks/useAppStatus';

export const OfflineBanner = () => {
  const { isOnline } = useAppStatus();

  if (isOnline) return null;

  return (
    <View style={{
      backgroundColor: '#ffcccc',
      padding: 6,
      alignItems: 'center'
    }}>
      <Text>⚠ You are offline. Changes will sync later.</Text>
    </View>
  );
};