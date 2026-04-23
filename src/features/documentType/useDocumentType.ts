import { useQuery } from "@tanstack/react-query";
import { getAll, type DocumentTypeRow } from "../../api/apiDocumentType";

export function useFetchDocumentType() {
  const { isLoading, data, error, isError } = useQuery<DocumentTypeRow[]>({
    queryKey: ["document_type"],
    queryFn: getAll,
    retry: false,
  });

  return { isLoading, data, error, isError };
}
