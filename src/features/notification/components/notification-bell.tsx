"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Surface } from "@/components/ui/surface";
import type { NotificationView } from "@/features/notification/types";
import type { Page } from "@/lib/api/shared-types";
import { useApi } from "@/providers/app-providers";
import { NotificationItem } from "./notification-item";
import { Text } from "@/components/ui/text";

export function NotificationBell() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
  });

  useEffect(() => {
    let disconnect: (() => void) | undefined;
    let disposed = false;

    api
      .subscribeNotifications((notification) => {
        queryClient.setQueryData<Page<NotificationView>>(["notifications"], (old) => {
          const currentItems = old?.items ?? [];
          const itemsWithoutDuplicate = currentItems.filter((item) => {
            return item.id !== notification.id;
          });

          return {
            ...old,
            items: [notification, ...itemsWithoutDuplicate],
          };
        });
      })
      .then((stop) => {
        if (disposed) {
          stop();
          return;
        }

        disconnect = stop;
      });

    return () => {
      disposed = true;
      disconnect?.();
    };
  }, [api, queryClient]);

  const notifications = query.data?.items ?? [];
  const unread = notifications.filter((item) => !item.readAt).length;

  function togglePanel() {
    setOpen((value) => !value);
  }

  async function read(item: NotificationView) {
    if (item.readAt) {
      return;
    }

    await api.markNotificationRead(item.id);

    queryClient.setQueryData<Page<NotificationView>>(["notifications"], (old) => {
      if (!old) {
        return old;
      }

      const items = old.items.map((value) => {
        if (value.id !== item.id) {
          return value;
        }

        return {
          ...value,
          readAt: new Date().toISOString(),
        };
      });

      return {
        ...old,
        items,
      };
    });
  }

  return (
    <div className="notification-wrap">
      <Button
        variant="icon"
        className="notification-bell"
        onClick={togglePanel}
        aria-label={`${unread} unread notifications`}
      >
        <Text as="span">♢</Text>
        {unread > 0 && <Text as="span">{unread}</Text>}
      </Button>

      {open && (
        <Surface className="notification-panel">
          <div className="notification-title">
            <Text as="strong">Notifications</Text>
            <Text as="small">{unread} unread</Text>
          </div>

          {notifications.map((item) => (
            <NotificationItem item={item} key={item.id} onRead={read} />
          ))}

          {!notifications.length && <EmptyState>You are all caught up.</EmptyState>}
        </Surface>
      )}
    </div>
  );
}
