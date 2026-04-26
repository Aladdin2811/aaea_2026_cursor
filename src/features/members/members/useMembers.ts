import { useQuery } from "@tanstack/react-query";
import { getAll, orgMember, type MemberRow } from "../../../api/apiMembers";

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
