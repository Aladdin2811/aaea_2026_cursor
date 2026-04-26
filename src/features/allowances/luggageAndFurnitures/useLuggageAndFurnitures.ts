import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type LuggageAndFurnituresRow,
} from "../../../api/apiLuggageAndFurnitures";

export function useFetchLuggageAndFurnitures() {
  const { isLoading, data, error, isError } = useQuery<LuggageAndFurnituresRow[]>(
    {
      queryKey: ["luggage_and_furnitures"],
      queryFn: () => getAll(),
      retry: false,
    },
  );

  return { isLoading, data, error, isError };
}
