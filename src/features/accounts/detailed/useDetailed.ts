import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getForSelect,
  type DetailedWithRelations,
} from "../../../api/apiDetailed";
import { supabase } from "../../../lib/supabase";
import { useParams } from "react-router-dom";

export function useFetchDetailed() {
  const { id } = useParams();
  const { isLoading, data, error, isError } = useQuery<DetailedWithRelations[]>({
    queryKey: ["detailed", "by_no3", id],
    queryFn: () => getAll(id!),
    enabled: id != null && id !== "",
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useDetailedSelect(no3Id: number | string | undefined) {
  const { isLoading, data, error, isError } = useQuery<DetailedWithRelations[]>({
    queryKey: ["detailed", "for_select", no3Id],
    queryFn: () => getForSelect(no3Id!),
    enabled:
      no3Id != null &&
      no3Id !== "" &&
      !Number.isNaN(Number(no3Id)),
    retry: false,
  });

  return { isLoading, data, error, isError };
}

export function useFetchAccountsForActivityAdvanceSettlement() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["accounts_for_activity_advance_settlement"],
    queryFn: async () => {
      const { data: rows, error: rpcError } = await supabase.rpc(
        "get_accounts_for_activity_advance_settlement",
      );
      if (rpcError) throw rpcError;
      return rows;
    },
    retry: false,
  });

  return { isLoading, data, error };
}
