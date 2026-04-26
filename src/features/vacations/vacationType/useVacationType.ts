import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type VacationTypeListFilters,
  type VacationTypeRow,
} from "../../../api/apiVacationType";

/**
 * أنواع الإجازة — يمرّر الفلاتر الاختيارية إلى `getAll` كما في الـ API.
 */
export function useFetchVacationType(filters?: VacationTypeListFilters) {
  return useQuery<VacationTypeRow[], Error>({
    queryKey: ["vacation_type", filters ?? {}],
    queryFn: () => getAll(filters),
    retry: false,
  });
}
