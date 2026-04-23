import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getForSelect,
  type BandWithRelations,
} from "../../../api/apiBand";
import { useParams } from "react-router-dom";

export function useFetchBand() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<BandWithRelations[]>({
    queryKey: ["band", "by_bab", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useBandSelect(babId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<BandWithRelations[]>({
    queryKey: ["band", "for_select", babId],
    queryFn: () => getForSelect(babId!),
    enabled:
      babId != null &&
      babId !== "" &&
      !Number.isNaN(Number(babId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
