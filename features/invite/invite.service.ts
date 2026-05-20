import { generateId } from '@/utils/uuid';
import { InviteAPI } from '../../api/invite.api';

export const InviteService = {
  /**
   * 📥 Get all invites
   */
  // getInvites: () => InviteAPI.getInvites(),

  /**
   * ➕ Send invite
   */
  createInvite: ( email: string, role: string ) => {
    const id = generateId();
    return InviteAPI.createInvite({id, email,role});
  },

  /**
   * ✅ Accept invite
   */
  acceptInvite: (token: string) => {
    return InviteAPI.acceptInvite(token);
  },

  /**
   * 🗑️ Delete invite
   */
  deleteInvite: (id: string) => {
    // return InviteAPI.deleteInvite(id);
  },
};