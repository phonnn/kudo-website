import type { NotificationView } from "@/features/notification/types";
import type { Page } from "@/lib/api/shared-types";

export interface NotificationClient {
  getNotifications(): Promise<Page<NotificationView>>;
  markNotificationRead(id: string): Promise<void>;
  subscribeNotifications(listener: (notification: NotificationView) => void): Promise<() => void>;
}
