export type NotificationView = {
  id: string;
  type: "kudo_received" | "comment" | "reaction";
  senderName: string | null;
  message: string;
  readAt: string | null;
  createdAt: string;
};
