import { SyncService } from '../features/sync/sync.service';

export const startSyncScheduler = () => {
  setInterval(() => {
    SyncService.retryFailed();
  }, 30000);
};