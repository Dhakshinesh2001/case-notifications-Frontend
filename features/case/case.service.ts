import { generateId } from '../../utils/uuid';
import { CaseRepository } from '../../repositories/case.repository';
import { CaseAPI } from '../../api/case.api';
import { SyncService } from '../sync/sync.service';
import { EventRepository } from '@/repositories/event.repository';
import { TaskRepository } from '@/repositories/task.repository';

export const CaseService = {
  createCase: async (data: any) => {
    const now = new Date().toISOString();
    const id = generateId();

    CaseRepository.createLocal({
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    });

    SyncService.pushCases();
  },

  updateCase: async (id: string, updates: any) => {
    CaseRepository.updateLocal(id, updates);
    SyncService.pushCases();
  },

  deleteCase: async (id: string) => {
    CaseRepository.softDelete(id);
    SyncService.pushCases();
  },

  getCases: () => {
    return CaseRepository.getAll();
  },

  getCaseById: (id: string) => {
    return CaseRepository.getById(id);
  },

  // 🔥 RECORD SYNC
  syncCase: async (id: string) => {
    try {
      const remote = await CaseAPI.getCaseById(id);
      const local = CaseRepository.getById(id);

      let conflict = false;

      if (!local || new Date(remote.updatedAt) > new Date(local.updatedAt)) {
        CaseRepository.upsertFromBackend(remote);
        conflict = !!local;
      } else if (local && new Date(local.updatedAt) > new Date(remote.updatedAt)) {
        await CaseAPI.updateCase(id, local);
      }

      // 🔥 ALSO SYNC RELATED
      const eventsRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/event/${id}`).then(r => r.json());
      const events = Array.isArray(eventsRes)
  ? eventsRes
  : eventsRes?.data || [];
      events.forEach((e: any) => EventRepository.upsertFromBackend(e));

      const tasksRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/task/${id}`).then(r => r.json());
      const tasks = Array.isArray(tasksRes)
  ? tasksRes
  : tasksRes?.data || [];
      tasks.forEach((t: any) => TaskRepository.upsertFromBackend(t));

      return { conflict };
    } catch (err) {
      console.log('syncCase failed', err);
      return { conflict: false };
    }
  },
};