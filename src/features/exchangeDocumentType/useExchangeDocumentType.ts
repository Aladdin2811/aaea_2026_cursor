import { useQuery } from "@tanstack/react-query";
import {
  getAll,
  type ExchangeDocumentTypeRow,
} from "../../api/apiExchangeDocumentType";

export function useFetchExchangeDocumentType() {
  const { isLoading, data, error, isError } = useQuery<ExchangeDocumentTypeRow[]>(
    {
      queryKey: ["exchange_document_type"],
      queryFn: getAll,
      retry: false,
    },
  );

  return { isLoading, data, error, isError };
}
