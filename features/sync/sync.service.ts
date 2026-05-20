import { CaseRepository } from '../../repositories/case.repository';
import { EventRepository } from '../../repositories/event.repository';
import { TaskRepository } from '../../repositories/task.repository';

import { CaseAPI } from '../../api/case.api';
import { EventAPI } from '../../api/event.api';
import { TaskAPI } from '../../api/task.api';
import { SyncAPI } from '../../api/sync.api';

import { AppStatusActions } from '../../hooks/useAppStatus';
// import { getOrgId } from '../../api/org';
import { orgRepository } from '@/repositories/org.repository';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';
import { userRepository } from '@/repositories/user.repository';
let isSyncing = false;
let hasPending = false;
let debounceTimer: any = null;

export const SyncService = {
  
  // 🔁 GLOBAL SYNC 
  scheduleSync: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    // 🔁 clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // ⏱ debounce (300ms)
    debounceTimer = setTimeout(() => {
      SyncService.runSync();
    }, 300);
  },

  syncNow: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    await SyncService.runSync();
  },

  runSync: async () => {

    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    if (!orgId) {
      console.log("Skipping sync: no org selected1");
      return;
    }

    // 🚫 If already syncing → queue next run
    if (isSyncing) {
      console.log("Sync already running → marking pending");
      hasPending = true;
      return;
    }

    isSyncing = true;
    hasPending = false;

    console.log("🚀 Running sync...");

    AppStatusActions.setSyncing(true);
    AppStatusActions.setFailed(false);

    try {
      await Promise.all([
        SyncService.pushCases(),
        SyncService.pushEvents(),
        SyncService.pushTasks(),
      ]);

      await SyncService.pullAll();
      await NotificationService.checkEvents();

      AppStatusActions.setLastSynced(new Date().toISOString());

    } catch (err) {
      console.log("SYNC ERROR", err);
      AppStatusActions.setFailed(true);
    }

    AppStatusActions.setSyncing(false);
    isSyncing = false;

    // 🔁 If something triggered sync during run → run again
    if (hasPending) {
      console.log("🔁 Running pending sync...");
      hasPending = false;
      SyncService.runSync();
    }

    // await NotificationService.checkEvents();
  },
  syncAll: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    console.log("syncAll called");
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    // console.log("orgID in sync service:", orgId);

    //  console.log("orgID in sync service:",orgId);
    if (!orgId) {
      console.log("Skipping sync: no org selected2");
      return;
    }

    AppStatusActions.setSyncing(true);
    AppStatusActions.setFailed(false);

    try {

      await Promise.all([
        SyncService.pushCases(),
        SyncService.pushEvents(),
        SyncService.pushTasks(),
      ]);

      await SyncService.pullAll();

      AppStatusActions.setLastSynced(new Date().toISOString());

    } catch (err) {
      console.log("SYNC ERROR", err);
      AppStatusActions.setFailed(true);
    }

    AppStatusActions.setSyncing(false);
  },

  // 🔽 PULL
  pullAll: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    console.log("pullAll called");

    try {
      // console.log("pull all data123:");
      const data = await SyncAPI.sync();
      //   console.log("pull all data:", data);
      const currentOrg = orgRepository.currentOrg();
      const safe = (arr: any) =>
        Array.isArray(arr) ? arr : arr?.data || [];

      const cases = safe(data.cases);
      const events = safe(data.events);
      const tasks = safe(data.tasks);
      // const orgs = safe(data.orgs);
      const orgUsers = safe(data.users);
      // console.log("inside pullALL22:", orgs);
      // console.log("beforeorgfetch");
      cases.forEach((c: any) => {
        if (c.deletedAt) {
          // console.log("beforeorgfetch11");
          CaseRepository.removeDeleted(c.id);
        } else {
          // console.log("beforeorgfetch22");
          CaseRepository.upsertFromBackend(c);
        }
      });
      // console.log("beforeveetch");
      events.forEach((e: any) => {
        if (e.deletedAt) {
          EventRepository.removeDeleted(e.id);
        } else {
          EventRepository.upsertFromBackend(e);
        }
      });

      tasks.forEach((t: any) => {
        if (t.deletedAt) {
          TaskRepository.removeDeleted(t.id);
        } else {
          TaskRepository.upsertFromBackend(t);
        }
      });

          userRepository.upsertFromBackend(orgUsers,currentOrg.id );
        // }
      // console.log("beforeorgfetch");
      // orgs.forEach((o: any) => {
      //   console.log("o in pull all", o);
      //   orgRepository.upsertFromBackend(o);
      // });



    } catch (err) {
      console.log("Pull sync failed", err);
    }
  },

  // 🔁 GENERIC PUSH HANDLER
  pushEntity: async ({
    items,
    createFn,
    updateFn,
    deleteFn,
    mapPayload,
    markSynced,
    markFailed,
    removeDeleted,
  }: any) => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    for (const item of items) {
      try {
        // 🧹 DELETE
        if (item.deletedAt) {
          if (item.isSynced) {
            await deleteFn(item.id);
          }
          removeDeleted(item.id);
          continue;
        }

        const payload = mapPayload(item);

        // 🆕 CREATE
        if (!item.isSynced) {
          console.log("in PUSH ENTITY");
          const res = await createFn(payload);
          console.log("in PUSH ENTITY2");
          markSynced(item.id, res.updatedAt);
        }
        // 🔄 UPDATE
        else {
          console.log("elese case in Push entity")
          const res = await updateFn(item.id, payload);
          markSynced(item.id, res.updatedAt);
        }

      } catch (err) {
        console.log("Push failed:", err);
        console.log(item.id, item);
        markFailed(item.id);
      }
    }
  },

  // 🔼 CASES
  pushCases: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    console.log("push cases called");
    const items = CaseRepository.getPending();

    await SyncService.pushEntity({
      items,
      createFn: (data: any) => CaseAPI.createCase(data),
      updateFn: (id: string, data: any) =>
        CaseAPI.updateCase(id, data),
      deleteFn: (id: string) => CaseAPI.deleteCase(id),

      mapPayload: (c: any) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        caseNumber: c.caseNumber,
        court: c.court,
        status: c.status,
      }),

      markSynced: CaseRepository.markSynced,
      markFailed: CaseRepository.markFailed,
      removeDeleted: CaseRepository.removeDeleted,
    });
  },

  // 🔼 EVENTS
  pushEvents: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    const items = EventRepository.getPending();
    console.log("items in SYNC service",items);

    await SyncService.pushEntity({
      items,
      createFn: (data: any) =>
        EventAPI.createEvent(data.caseId, data),
      updateFn: (id: string, data: any) =>
        EventAPI.updateEvent(id, data),
      deleteFn: (id: string) => EventAPI.deleteEvent(id),

      mapPayload: (e: any) => ({
        id: e.id,
        caseId: e.caseId,
        type: e.type,
        content: e.content,
        metadata: e.metadata,
        eventDate: e.eventDate,
      }),

      markSynced: EventRepository.markSynced,
      markFailed: EventRepository.markFailed,
      removeDeleted: EventRepository.removeDeleted,
    });
  },

  // 🔼 TASKS
  pushTasks: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    const items = TaskRepository.getPending();

    await SyncService.pushEntity({
      items,
      createFn: (data: any) =>
        TaskAPI.createTask(data.caseId, data),
      updateFn: (id: string, data: any) =>
        TaskAPI.updateTask(id, data),
      deleteFn: (id: string) => TaskAPI.deleteTask(id),

      mapPayload: (t: any) => ({
        id: t.id,
        caseId: t.caseId,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        eventId: t.eventId,
      }),

      markSynced: TaskRepository.markSynced,
      markFailed: TaskRepository.markFailed,
      removeDeleted: TaskRepository.removeDeleted,
    });
  },

  // 🔁 RETRY FAILED
  retryFailed: async () => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    await Promise.all([
      SyncService.pushCases(),
      SyncService.pushEvents(),
      SyncService.pushTasks(),
    ]);
  },


  syncCase: async (caseId: string) => {
    const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    if (!orgId) {
      console.log("No org → skipping case sync");
      return;
    }

    // 🚫 respect queue
    if (isSyncing) {
      hasPending = true;
      return;
    }

    isSyncing = true;
    hasPending = false;

    console.log("📦 Syncing case:", caseId);

    AppStatusActions.setSyncing(true);
    AppStatusActions.setFailed(false);

    try {
      // 🔼 PUSH ONLY RELATED DATA

      const caseItem = CaseRepository.getById(caseId);
      if (caseItem && caseItem.syncStatus === 'PENDING') {
        await SyncService.pushCases(); // (can optimize later)
      }

      const events = EventRepository.getByCase(caseId);
      for (const e of events) {
        if (e.syncStatus === 'PENDING') {
          await SyncService.pushEvents();
          break;
        }
      }

      const tasks = TaskRepository.getByCase(caseId);
      for (const t of tasks) {
        if (t.syncStatus === 'PENDING') {
          await SyncService.pushTasks();
          break;
        }
      }

      // 🔽 TARGETED PULL
      const data = await SyncAPI.syncCase(caseId);

      // 🧠 upsert
      if (data.case) {
        CaseRepository.upsertFromBackend(data.case);
      }

      data.events?.forEach((e: any) => {
        if (e.deletedAt) {
          EventRepository.removeDeleted(e.id);
        } else {
          EventRepository.upsertFromBackend(e);
        }
      });

      data.tasks?.forEach((t: any) => {
        if (t.deletedAt) {
          TaskRepository.removeDeleted(t.id);
        } else {
          TaskRepository.upsertFromBackend(t);
        }
      });

      AppStatusActions.setLastSynced(new Date().toISOString());

    } catch (err) {
      console.log("Case sync failed", err);
      AppStatusActions.setFailed(true);
    }

    AppStatusActions.setSyncing(false);
    isSyncing = false;

    if (hasPending) {
      hasPending = false;
      SyncService.runSync();
    }
  },

  startRetryWorker: async () => {
  const token = await AuthService.getToken();

if (!token) {
  console.log("No auth token → offline mode");
  return;
}
  setInterval(async () => {
    const currentOrg = orgRepository.currentOrg();
    const orgId = currentOrg?.id;

    if (!orgId) return;

    console.log("🔁 Retry worker running...");

    try {
      await Promise.all([
        SyncService.pushCases(),
        SyncService.pushEvents(),
        SyncService.pushTasks(),
      ]);
    } catch (err) {
      console.log("Retry worker error", err);
    }
  }, 15000); // ⏱ 15 seconds
},
};