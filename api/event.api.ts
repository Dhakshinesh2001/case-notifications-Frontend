import { apiClient } from './client';

export const EventAPI = {
  getEvents: async (caseId: string) => {
    const res = await apiClient.get(`/event/${caseId}`);
    return res.data || res;
  },

  createEvent: async (
    caseId: string,
    data: {
      id: string;
      type?: string;
      content: string;
      metadata?: string;
      eventDate: string;
    }
  ) => {
    console.log("in create event API:", data);
    return apiClient.post(`/event/${caseId}`, data);
  },

  updateEvent: async (
    eventId: string,
    data: Partial<{
      type: string;
      content: string;
      metadata: string;
      eventDate: string;
    }>
  ) => {
    return apiClient.patch(`/event/${eventId}`, data);
  },

  deleteEvent: async (eventId: string) => {
    return apiClient.delete(`/event/${eventId}`);
  },
};