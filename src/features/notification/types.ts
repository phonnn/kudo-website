export type NotificationView = {
  id: string;
  type: "kudo_received" | "comment" | "reaction";
  message: string;
  readAt: string | null;
  createdAt: string;
};
