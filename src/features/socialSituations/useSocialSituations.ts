import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type SocialSituationsRow,
} from "../../api/apiSocialSituations";

export function useFetchSocialSituations() {
  const { isLoading, data, error, isError } = useQuery<SocialSituationsRow[]>({
    queryKey: ["social_situations"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
