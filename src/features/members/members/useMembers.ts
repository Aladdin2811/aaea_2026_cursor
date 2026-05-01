import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMember as createMemberAPI,
  deleteMember as deleteMemberAPI,
  getAll,
  orgMember,
  type MemberRow,
  updateMember as updateMemberAPI,
} from "../../../api/apiMembers";

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { mutate: createMember, isPending: isCreating } = useMutation({
    mutationFn: createMemberAPI,
    onSuccess: () => {
      toast.success("تم تسجيل الدولة العضو بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ أثناء الإضافة");
    },
  });

  return { createMember, isCreating };
}

export function useFetchAllMembers() {
  const { isLoading, data, error, isError } = useQuery<MemberRow[]>({
    queryKey: ["members", "all"],
    queryFn: () => getAll(),
  });

  return { isLoading, data, error, isError };
}

export function useFetchMembers() {
  const { isLoading, data, error, isError } = useQuery<MemberRow[]>({
    queryKey: ["members", "org"],
    queryFn: orgMember,
  });

  return { isLoading, data, error, isError };
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  const { mutate: updateMember, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Partial<MemberRow> }) =>
      updateMemberAPI(id, patch),
    onSuccess: () => {
      toast.success("تم تعديل بيانات الدولة العضو بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ أثناء التعديل");
    },
  });

  return { updateMember, isUpdating };
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { mutate: deleteMember, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => deleteMemberAPI(id),
    onSuccess: () => {
      toast.success("تم حذف الدولة العضو بنجاح");
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "حدث خطأ أثناء الحذف");
    },
  });

  return { deleteMember, isDeleting };
}
