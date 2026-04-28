import { CaseRepository } from '../../repositories/case.repository';
import { CaseMapper } from '../../mappers/case.mapper';
import { SyncService } from '../sync/sync.service';
import { generateId } from '../../utils/uuid';

export const CaseService = {
  /**
   * 📥 Get all cases (local DB only)
   * UI should always read from local DB
   */
  getCases: () => {
    return CaseRepository.getAll();
  },

  /**
   * 📥 Get single case by ID (local)
   */
  getCaseById: (id: string) => {
    return CaseRepository.getById(id);
  },

  /**
   * ➕ Create new case (local-first)
   * - Immediately saved locally
   * - Sync happens in background
   */
  createCase: (data: any) => {
    const now = new Date().toISOString();

    const newCase = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'PENDING',
      isSynced: 0,
    };

    CaseRepository.createLocal(newCase);

    // 🔄 Trigger background sync
    SyncService.syncAll();
  },

  /**
   * ✏️ Update case (local-first)
   */
  updateCase: (id: string, updates: any) => {
    CaseRepository.updateLocal(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'PENDING',
    });

    SyncService.syncAll();
  },

  /**
   * 🗑️ Soft delete case
   */
  deleteCase: (id: string) => {
    CaseRepository.markDeleted(id);
    SyncService.syncAll();
  },

  /**
   * 🔁 Sync a single case + related data
   * Useful when opening case details page
   */
  syncCase: async (id: string) => {
    try {
      await SyncService.syncAll();
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  },
};