import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFetchCurrentYear } from "../years/currentYear/useCurrentYear";

function parseYearIdParam(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null;
}

/**
 * سنة عرض الأنشطة المعتمدة: `?year_id=` من الرابط، أو السنة الحالية من `current_year`.
 */
export function useCertifiedProgramsYearFromLocation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: currentYearRow, isLoading: loadingCurrent } =
    useFetchCurrentYear();

  const yearIdFromParam = useMemo(
    () => parseYearIdParam(searchParams.get("year_id")),
    [searchParams],
  );

  const fallbackYearId =
    currentYearRow?.year_id != null && currentYearRow.year_id > 0
      ? currentYearRow.year_id
      : null;

  const yearId = yearIdFromParam ?? fallbackYearId;

  const setYearInSearch = (id: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("year_id", String(id));
        return next;
      },
      { replace: true },
    );
  };

  return {
    yearId,
    yearIdFromParam,
    loadingCurrent,
    setYearInSearch,
  };
}
