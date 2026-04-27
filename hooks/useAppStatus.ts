import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * 🔥 GLOBAL STATE (singleton)
 */
type AppStatusState = {
  isOnline: boolean;
  isSyncing: boolean;
  hasFailed: boolean;
  lastSyncedAt: string | null;
};

let globalState: AppStatusState = {
  isOnline: true,
  isSyncing: false,
  hasFailed: false,
  lastSyncedAt: null,
};

/**
 * 🔥 LISTENERS (subscribers)
 */
let listeners: ((state: AppStatusState) => void)[] = [];

/**
 * 🔥 INTERNAL: notify all subscribers
 */
const notify = () => {
  listeners.forEach((l) => l({ ...globalState }));
};

/**
 * 🔥 EXPORT: setters for global state
 */
export const AppStatusActions = {
  setOnline: (val: boolean) => {
    globalState.isOnline = val;
    notify();
  },

  setSyncing: (val: boolean) => {
    globalState.isSyncing = val;
    notify();
  },

  setFailed: (val: boolean) => {
    globalState.hasFailed = val;
    notify();
  },

  setLastSynced: (val: string | null) => {
    globalState.lastSyncedAt = val;
    notify();
  },
};

/**
 * 🔥 HOOK (subscribes to global state)
 */
export const useAppStatus = () => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    // subscribe
    listeners.push(setState);

    // network listener
    const unsubscribe = NetInfo.addEventListener((net) => {
      AppStatusActions.setOnline(!!net.isConnected);
    });

    return () => {
      // cleanup listener
      listeners = listeners.filter((l) => l !== setState);
      unsubscribe();
    };
  }, []);

  return state;
};