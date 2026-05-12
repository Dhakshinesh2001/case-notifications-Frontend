import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

/**
 * Handles requesting and verifying notification permissions.
 * Optimized for Android 13+ and iOS.
 */
export const PermissionService = {
  requestNotificationPermissions: async (): Promise<boolean> => {
    // 1. Check current permission status
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 2. Only ask if permissions haven't been determined or were denied previously
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // 3. If the user ultimately says no, show a helpful alert
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Action Required',
        'Notifications are currently disabled. To receive legal case updates, please enable them in your phone settings.',
        [{ text: 'OK' }]
      );
      return false;
    }

    // 4. Android Configuration: Setup the Notification Channel
    // Standalone APKs require a channel to display notifications properly.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default Channel',
        importance: Notifications.AndroidImportance.MAX, // Pops up on screen
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }

    console.log("✅ Notification permissions and channels are ready.");
    return true;
  },

  /**
   * Helper to check if we already have permission without triggering a popup.
   */
  hasPermission: async (): Promise<boolean> => {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }
};