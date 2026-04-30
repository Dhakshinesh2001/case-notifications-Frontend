// import { useEffect, useState } from 'react';
// import * as GlobalOrg from '../api/org'; // Import your global file
// import { orgRepository } from '../repositories/org.repository';

// export const useOrg = () => {
//   // Initialize from global state so components starting up stay in sync
//   const [orgId, setOrgIdState] = useState<string | null>(GlobalOrg.getOrgId());

//   useEffect(() => {
//     // 1. On mount, try to find the active org in DB
//     const current = orgRepository.currentOrg();
//     if (current) {
//       syncStates(current.id);
//     }

//     // 2. Subscribe to global changes (in case another part of the app calls setOrgId)
//     const unsubscribe = GlobalOrg.subscribeOrg((id) => {
//       setOrgIdState(id);
//     });

//     return unsubscribe;
//   }, []);

//   const syncStates = (id: string | null) => {
//     setOrgIdState(id);          // Updates current component
//     GlobalOrg.setOrgId(id!);    // Updates global variable for API calls
//   };

//   const setOrgId = (id: string) => {
//     orgRepository.changeOrg(id); // Persistence (SQLite)
//     syncStates(id);              // Memory (Global + React)
//   };

//   return { orgId, setOrgId };
// };