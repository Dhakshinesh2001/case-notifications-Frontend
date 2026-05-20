import { useEffect } from 'react';
import { router } from 'expo-router';
// import * as Linking from 'expo-linking';

export default function OAuthCallback() {
  useEffect(() => {
    router.replace('/(tabs)/account'); // adjust to your route
  }, []);

  return null;
}