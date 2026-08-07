import type { NotificationView } from "@/features/notification/types";
import type { HttpTransport } from "../http/http-transport";
import type { NotificationClient } from "./notification-client.interface";

type NotificationPayload = {
  message?: unknown;
  senderName?: unknown;
  points?: unknown;
};

type NotificationResponse = {
  id: string;
  type: NotificationView["type"];
  payload: NotificationPayload;
  readAt: string | null;
  createdAt: string;
};

export class HttpNotificationClient implements NotificationClient {
  constructor(private readonly transport: HttpTransport) {}

  async getNotifications() {
    const page = await this.transport.request<{
      items: NotificationResponse[];
      nextCursor: string | null;
    }>("/notifications");

    return {
      ...page,
      items: page.items.map(toNotificationView),
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
        listener(toNotificationView(data as NotificationResponse));
      },
    });
  }
}

function toNotificationView(item: NotificationResponse): NotificationView {
  let senderName: string | null = null;

  if (typeof item.payload.senderName === "string") {
    senderName = item.payload.senderName;
  }

  let message = notificationLabel(item.type, senderName, item.payload.points);

  if (typeof item.payload.message === "string") {
    message = item.payload.message;
  }

  return {
    id: item.id,
    type: item.type,
    senderName,
    message,
    readAt: item.readAt,
    createdAt: item.createdAt,
  };
}

function notificationLabel(
  type: NotificationView["type"],
  senderName: string | null,
  points: unknown,
) {
  const sender = senderName ?? "Someone";

  if (type === "kudo_received") {
    if (typeof points === "number") {
      return `${sender} sent you ${points} points.`;
    }

    return `${sender} sent you a kudo.`;
  }

  if (type === "comment") {
    return `${sender} commented on your post.`;
  }

  return `${sender} reacted to your post.`;
}
