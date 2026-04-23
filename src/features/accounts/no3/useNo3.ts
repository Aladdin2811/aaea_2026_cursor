import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getForSelect,
  type No3WithRelations,
} from "../../../api/apiNo3";
import { useParams } from "react-router-dom";

export function useFetchNo3() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<No3WithRelations[]>({
    queryKey: ["no3", "by_band", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useNo3Select(bandId: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<No3WithRelations[]>({
    queryKey: ["no3", "for_select", bandId],
    queryFn: () => getForSelect(bandId!),
    enabled:
      bandId != null &&
      bandId !== "" &&
      !Number.isNaN(Number(bandId)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}
