import { InviteAPI } from '../../api/invite.api';

export const InviteService = {
  /**
   * 📥 Get all invites
   */
  getInvites: () => InviteAPI.getInvites(),

  /**
   * ➕ Send invite
   */
  sendInvite: (data: { email: string; role: string }) => {
    return InviteAPI.createInvite(data);
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
    return InviteAPI.deleteInvite(id);
  },
};