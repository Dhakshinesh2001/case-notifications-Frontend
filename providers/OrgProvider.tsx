// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { orgRepository } from '@/repositories/org.repository';
// import { SyncService } from '@/features/sync/sync.service';
// import { NotificationService } from '@/features/notification/notification.service';

// type Org = {
//   id: string;
//   name: string;
//   role?: string;
// };

// type OrgContextType = {
//   org: Org | null;
//   orgId: string | null;
//   switchOrg: (id: string) => Promise<void>;
//   reloadOrg: () => void;
// };

// const OrgContext = createContext<OrgContextType | null>(null);

// export const OrgProvider = ({ children }: { children: React.ReactNode }) => {
//   const [org, setOrg] = useState<Org | null>(null);

//   const loadCurrentOrg = () => {
//     const current = orgRepository.currentOrg();

//     if (current) {
//       setOrg({
//         id: current.id,
//         name: current.name,
//         role: current.role,
//       });
//     } else {
//       // 🔥 Auto-select first org if none selected
//     //   const all = orgRepository.getOrgs();
//     //   if (all.length) {
//     //     orgRepository.changeOrg(all[0].id);
//     //     setOrg(all[0]);
//     //   }
//     }
//   };

//   useEffect(() => {
//     loadCurrentOrg();
//     SyncService.startRetryWorker();
//     setTimeout(() => {
//     NotificationService.checkEvents();
//   }, 1000);

//   }, []);

//   useEffect(() => {
//   if (!org?.id) return;

//   console.log("Org changed → syncing:", org.id);

//   SyncService.syncNow();

// }, [org?.id]);

//   const switchOrg = async (id: string) => {
//     console.log("Switching org →", id);

//     // 1. Update DB (source of truth)
//     orgRepository.changeOrg(id);

//     // 2. Update UI
//     loadCurrentOrg();

//     // 3. Trigger sync
//     await SyncService.syncAll();
    
//   };

//   return (
//     <OrgContext.Provider
//       value={{
//         org,
//         orgId: org?.id || null,
//         switchOrg,
//         reloadOrg: loadCurrentOrg,
//       }}
//     >
//       {children}
//     </OrgContext.Provider>
//   );
// };

// export const useOrg = () => {
//   const ctx = useContext(OrgContext);

//   if (!ctx) {
//     throw new Error('useOrg must be used inside OrgProvider');
//   }

//   return ctx;
// };