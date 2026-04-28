import { OrgAPI } from '../../api/org.api';
import { setOrgId } from '../../api/org';
import { SyncService } from '../sync/sync.service';
// import { generateId } from '../../utils/uuid';

export const OrgService = {
  /**
   * 📥 Get all orgs with roles
   */
  getOrgs: async () => {
  const res = await OrgAPI.getOrgs();
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
    setOrgId(orgId);
    await SyncService.syncAll();
  },

  /**
   * ➕ Create new org
   */
  createOrg: async (data: { name: string }) => {
    return await OrgAPI.createOrg(data);
  },
};