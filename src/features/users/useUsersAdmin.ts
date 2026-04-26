import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listUserProfiles,
  updateUserProfileRole,
} from "../../api/apiUserProfiles";

export function useUserProfilesQuery() {
  return useQuery({
    queryKey: ["user_profiles"],
    queryFn: listUserProfiles,
    retry: false,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      roleId,
    }: {
      userId: string;
      roleId: number | null;
    }) => updateUserProfileRole(userId, roleId),
    onSuccess: () => {
      toast.success("تم تحديث صلاحية المستخدم");
      void queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "تعذر التحديث");
    },
  });
}
