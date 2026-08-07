import type { NotificationView } from "@/features/notification/types";
import type { HttpTransport } from "../http/http-transport";
import type { NotificationClient } from "./notification-client.interface";

export class HttpNotificationClient implements NotificationClient {
  constructor(private readonly transport: HttpTransport) {}

  async getNotifications() {
    const page = await this.transport.request<{
      items: Array<{
        id: string;
        type: NotificationView["type"];
        payload: Record<string, unknown>;
        readAt: string | null;
        createdAt: string;
      }>;
      nextCursor: string | null;
    }>("/notifications");

    return {
      ...page,
      items: page.items.map((item) => ({
        ...item,
        message: String(item.payload.message ?? notificationLabel(item.type)),
      })),
    };
  }

  markNotificationRead(id: string) {
    return this.transport.request<void>(`/notifications/${id}/read`, {
      method: "POST",
    });
  }

  subscribeNotifications(listener: (notification: NotificationView) => void) {
    return this.transport.eventSource("/notifications/events", {
      "notification.created": (data) => {
        const item = data as NotificationView & { payload?: { message?: string } };

        listener({
          ...item,
          message: item.message ?? item.payload?.message ?? notificationLabel(item.type),
        });
      },
    });
  }
}

function notificationLabel(type: NotificationView["type"]) {
  if (type === "kudo_received") {
    return "You received a new kudo.";
  }

  if (type === "comment") {
    return "Someone commented on your post.";
  }

  return "Someone reacted to your post.";
}
