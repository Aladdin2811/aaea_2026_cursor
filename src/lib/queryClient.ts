import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000,
      staleTime: 0,
      retry: 1,
      refetchOnWindowFocus: import.meta.env.PROD,
    },
  },
});
