import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="cases" options={{ title: 'Cases' }} />
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
      <Tabs.Screen name="notifications" 
      />
    </Tabs>
  );
}