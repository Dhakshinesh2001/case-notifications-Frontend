import { apiClient } from './client';
export const UserAPI = {
  getUserData: async () => {
    const res = await apiClient.get('/user/data');
    return res.data || res;
  },
  getUsersInOrg: async () => {
    const res = await apiClient.get('/user/org');
    return res.data || res;
  }
}