import { useQuery } from "@tanstack/react-query";
import { getAll } from "../../../api/apiSocialSecurityPercentage";

export function useFetchSocialSecurityPercentage() {
  const { isLoading, data, error } = useQuery({
    queryKey: ["social_security_percentage"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error };
}
