import { OrgAPI } from '../../api/org.api';
// import { setOrgId } from '../../api/org';
import { SyncService } from '../sync/sync.service';
import { generateId } from '@/utils/uuid';
import { orgRepository } from '@/repositories/org.repository';
import { Alert } from 'react-native';
import { userRepository } from '@/repositories/user.repository';
// import { generateId } from '../../utils/uuid';

export const OrgService = {
  /**
   * 📥 Get all orgs with roles
   */

  getOrg: async () => {
  return orgRepository.getOrg();
},
joinOrg: async (inviteCode: string) => {
  console.log("ORG SERVICE JOIN ORG FN1");
  const res = await OrgAPI.acceptInvite(inviteCode);
  console.log("ORG SERVICE JOIN ORG FN1.1: ", res);
  /**
   * 🔥 YOUR BACKEND SHAPE:
   * res.data.data
   */
  const payload = res.data?.data || res.data || res;

  const org = payload.org;

  if (!org) {
    throw new Error('Invalid org response');
  }

  const normalized = {
    id: org.id,
    name: org.name,
    role: payload.role || 'ADMIN',
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };

  // ✅ Save locally (single org)
  console.log("ORG SERVICE JOIN ORG FN2");
  orgRepository.changeOrg(normalized);

  // 🔥 FULL INITIAL SYNC
  await SyncService.pullAll();

  return normalized;
},




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

  getCurrentUserOrg: async (id: string) => {

    // Alert.alert("Inside get current ORG");
  const res = orgRepository.currentOrg();//.currentUserOrg(id);
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
  switchOrg: async (org: any) => {
    // setOrgId(orgId);
    
    orgRepository.changeOrg(org);
    userRepository.setCurrentUserOrg(org.id);
    await SyncService.pullAll();
  },

  /**
   * ➕ Create new org
   */
  createOrg: async (name: string ) => {
    console.log("inside create org1");
    // Alert.alert("inside ORG SERVICE");
    const now = new Date().toISOString();
    const newOrg = {
        id: generateId(),
        name,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'PENDING',
        isSynced: 0,
      };
      console.log("inside create org2");
      orgRepository.saveOrg(newOrg);
   const res = await OrgAPI.createOrg(newOrg);
  // Alert.alert("Success", JSON.stringify(res));
  return res;
  },

  insertOrgFromBackend: async (org: any ) => {
    // console.log("inside create org1");
    // Alert.alert("inside ORG SERVICE");
    const now = new Date().toISOString();
    const newOrg = {
        // id: generateId(),
        id: org.id,
        name: org.name,
        createdAt: org.createdAt ||  now,
        updatedAt: org.updatedAt || now,
        syncStatus: 'SYNCED',
        isSynced: 1,
      };
      orgRepository.saveOrg(newOrg);
      console.log("serviceORG: ", org);
  //  const res = await OrgAPI.createOrg(org);
  // Alert.alert("Success", JSON.stringify(res));
  // return res;
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