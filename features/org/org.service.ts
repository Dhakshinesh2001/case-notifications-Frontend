import { OrgAPI } from '../../api/org.api';
// import { setOrgId } from '../../api/org';
import { SyncService } from '../sync/sync.service';
import { generateId } from '@/utils/uuid';
import { orgRepository } from '@/repositories/org.repository';
import { Alert } from 'react-native';
// import { generateId } from '../../utils/uuid';

export const OrgService = {
  /**
   * 📥 Get all orgs with roles
   */
  getOrgs: async () => {
  const res = await OrgAPI.getOrgs();
  const data = res.data || res;
  // Alert.alert("Inside get ORGS");

  return data.map((o: any) => ({
    id: o.orgId,
    name: o.org.name,
    role: o.role,
  }))},

  getCurrentOrg: async () => {
    // Alert.alert("Inside get current ORG");
  const res = orgRepository.currentOrg();
  console.log("res in org ser:", res);
  const data = res.data || res;

  return data.map((o: any) => ({
    id: o.orgId,
    name: o.org.name,
    role: o.role,
  }))},


  /**
   * 🔄 Switch org
   * - updates global org
   * - triggers sync
   */
  switchOrg: async (orgId: string) => {
    // setOrgId(orgId);
    orgRepository.changeOrg(orgId);
    await SyncService.syncAll();
  },

  /**
   * ➕ Create new org
   */
  createOrg: async (data: { name: string }) => {
    console.log("inside create org1");
    // Alert.alert("inside ORG SERVICE");
    const now = new Date().toISOString();
    const newOrg = {
        id: generateId(),
        ...data,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'PENDING',
        isSynced: 0,
      };
      console.log("inside create org2");
      orgRepository.createLocal(newOrg);
   const res = await OrgAPI.createOrg(newOrg);
  // Alert.alert("Success", JSON.stringify(res));
  return res;
  },
//   createCase: (data: any) => {
//       const now = new Date().toISOString();
  
//       const newCase = {
//         id: generateId(),
//         ...data,
//         createdAt: now,
//         updatedAt: now,
//         syncStatus: 'PENDING',
//         isSynced: 0,
//       };
  
//       CaseRepository.createLocal(newCase);
  
//       // 🔄 Trigger background sync
//       SyncService.syncAll();
//     },
};