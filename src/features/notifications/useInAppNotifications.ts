import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyInAppNotifications,
  getUnreadInAppNotificationCount,
  markInAppNotificationRead,
} from "../../api/apiInAppNotifications";

const key = "in_app_notifications" as const;

export function useFetchMyInAppNotifications() {
  return useQuery({
    queryKey: [key, "list"],
    queryFn: getMyInAppNotifications,
    retry: false,
  });
}

export function useUnreadInAppNotificationCount() {
  return useQuery({
    queryKey: [key, "unreadCount"],
    queryFn: getUnreadInAppNotificationCount,
    refetchInterval: 60_000,
    retry: false,
  });
}

export function useMarkInAppNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markInAppNotificationRead,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [key] });
    },
  });
}
