import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCertifiedProgram,
  deleteCertifiedProgram,
  getByYearId,
  getById,
  updateCertifiedProgram,
  type CertifiedProgramWithRelations,
  type CreateCertifiedProgramInput,
  type UpdateCertifiedProgramInput,
} from "../../api/apiCertifiedPrograms";
import { getBriefForSelect } from "../../api/apiDetailed";
import { getActiveWithProgramsFlag } from "../../api/apiNo3";

const queryKey = ["certified_programs"] as const;

/** قائمة الأنشطة المعتمدة لسنة محاسبية محددة */
export function useFetchCertifiedPrograms(yearId: number | null) {
  const { isLoading, data, error, isError, isFetching } = useQuery<
    CertifiedProgramWithRelations[]
  >({
    queryKey: [...queryKey, "year", yearId],
    queryFn: () => getByYearId(yearId as number),
    enabled: yearId != null && Number.isFinite(yearId) && yearId > 0,
    retry: false,
  });

  return { isLoading, isFetching, data, error, isError };
}

export function useCertifiedProgramById(id: number | null) {
  const { isLoading, data, error, isError } = useQuery<
    CertifiedProgramWithRelations
  >({
    queryKey: [...queryKey, "detail", id],
    queryFn: () => getById(id as number),
    enabled: id != null && Number.isFinite(id) && id > 0,
    retry: false,
  });

  return { isLoading, data, error, isError };
}

/** أنواع (no3) المفعّلة والمرتبطة بالبرامج — للنموذج */
export function useNo3ForProgramsSelect() {
  return useQuery({
    queryKey: ["no3", "programs_select"],
    queryFn: getActiveWithProgramsFlag,
    staleTime: 60_000,
    retry: false,
  });
}

/** حسابات تفصيلية لنوع محدد — للنموذج */
export function useDetailedBriefForNo3(no3Id: number | null) {
  return useQuery({
    queryKey: ["detailed_brief", no3Id],
    queryFn: () => getBriefForSelect(no3Id as number),
    enabled: no3Id != null && Number.isFinite(no3Id) && no3Id > 0,
    retry: false,
  });
}

export function useCreateCertifiedProgram() {
  const queryClient = useQueryClient();

  const { mutate: createCertifiedProgramMutation, isPending: isCreating } =
    useMutation({
      mutationFn: (input: CreateCertifiedProgramInput) =>
        createCertifiedProgram(input),
      onSuccess: () => {
        toast.success("تم تسجيل نشاط معتمد جديد");
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      },
      onError: (err: Error) => {
        toast.error(err?.message || "تعذر التسجيل");
      },
    });

  return { isCreating, createCertifiedProgram: createCertifiedProgramMutation };
}

export function useUpdateCertifiedProgram() {
  const queryClient = useQueryClient();

  const { mutate: updateCertifiedProgramMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: ({
        id,
        patch,
      }: {
        id: number;
        patch: UpdateCertifiedProgramInput;
      }) => updateCertifiedProgram(id, patch),
      onSuccess: () => {
        toast.success("تم تحديث بيانات النشاط المعتمد");
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      },
      onError: (err: Error) => {
        toast.error(err?.message || "تعذر التحديث");
      },
    });

  return { isUpdating, updateCertifiedProgram: updateCertifiedProgramMutation };
}

export function useDeleteCertifiedProgram() {
  const queryClient = useQueryClient();

  const { mutate: deleteCertifiedProgramMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: (id: number) => deleteCertifiedProgram(id),
      onSuccess: () => {
        toast.success("تم حذف النشاط المعتمد");
        void queryClient.invalidateQueries({ queryKey: [...queryKey] });
      },
      onError: (err: Error) => {
        toast.error(err?.message || "تعذر الحذف");
      },
    });

  return { isDeleting, deleteCertifiedProgram: deleteCertifiedProgramMutation };
}
