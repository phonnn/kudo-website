import { Button } from "@/components/ui/button";
import type { NotificationView } from "@/features/notification/types";
import { Text } from "@/components/ui/text";

interface NotificationItemProps {
  item: NotificationView;
  onRead: (item: NotificationView) => Promise<void>;
}

function notificationIcon(type: NotificationView["type"]) {
  if (type === "kudo_received") {
    return "★";
  }

  if (type === "comment") {
    return "◌";
  }

  return "♥";
}

export function NotificationItem({ item, onRead }: NotificationItemProps) {
  let className = "notification-item unread";

  if (item.readAt) {
    className = "notification-item";
  }

  async function handleClick() {
    await onRead(item);
  }

  return (
    <Button variant="ghost" className={className} onClick={handleClick}>
      <Text as="span">{notificationIcon(item.type)}</Text>

      <div>
        {item.message}
        <Text as="small">{new Date(item.createdAt).toLocaleDateString()}</Text>
      </div>
    </Button>
  );
}
