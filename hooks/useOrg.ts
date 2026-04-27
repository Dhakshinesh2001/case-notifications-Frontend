import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOrgId as setGlobalOrgId } from '../api/org';

const STORAGE_KEY = 'CURRENT_ORG_ID';

export const useOrg = () => {
  const [orgId, setOrgIdState] = useState<string | null>(null);

  useEffect(() => {
    loadOrg();
  }, []);

  const loadOrg = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      setOrgIdState(stored);
      setGlobalOrgId(stored);
    }
  };

  const setOrgId = async (id: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, id);
    setOrgIdState(id);
    setGlobalOrgId(id);
  };

  return { orgId, setOrgId };
};