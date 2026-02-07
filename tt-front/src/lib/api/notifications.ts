import { http } from "./http";

export interface Notification {
  id: number;
  type:
    | "PARTICIPANT_REGISTERED"
    | "ARMY_LIST_SUBMITTED"
    | "PARTICIPATION_CONFIRMED"
    | "PAYMENT_CONFIRMED"
    | "ARMY_LIST_APPROVED"
    | "ARMY_LIST_REJECTED";
  tournamentId: number;
  tournamentName: string;
  message: string;
  read: boolean;
  createdAt: string;
  triggeredByUserName: string | null;
}

export const notificationApi = {
  getRecent: async (
    token: string,
    limit: number = 5,
  ): Promise<Notification[]> => {
    return http<Notification[]>(`/api/notifications/recent?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  getUnreadCount: async (token: string): Promise<number> => {
    const response = await http<{ count: number }>(
      "/api/notifications/unread-count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.count;
  },

  markAsRead: async (notificationId: number, token: string): Promise<void> => {
    await http(`/api/notifications/${notificationId}/mark-read`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  markAllAsRead: async (token: string): Promise<void> => {
    await http("/api/notifications/mark-all-read", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
