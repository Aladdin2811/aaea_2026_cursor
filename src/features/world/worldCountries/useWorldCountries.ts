import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  getForSelect,
  type WorldCountryWithRelations,
} from "../../../api/apiWorldCountries";

export function useFetchWorldCountries() {
  const { isLoading, data, error, isError } = useQuery<WorldCountryWithRelations[]>(
    {
      queryKey: ["world_countries"],
      queryFn: getAll,
      retry: false,
    },
  );

  return { isLoading, data, error, isError };
}

export function useWorldCountriesSelect(
  worldClassificationId: number | string | undefined,
) {
  const { isLoading, data, error, isError } = useQuery<WorldCountryWithRelations[]>(
    {
      queryKey: ["world_countries", "for_select", worldClassificationId],
      queryFn: () => getForSelect(worldClassificationId!),
      enabled:
        worldClassificationId != null &&
        worldClassificationId !== "" &&
        !Number.isNaN(Number(worldClassificationId)),
      retry: false,
    },
  );

  return { isLoading, data, error, isError };
}
