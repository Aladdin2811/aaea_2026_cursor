import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000,
      staleTime: 0,
      retry: 1,
      /** إعادة الجلب عند العودة للتبويب — مفيد بعد تعديل البيانات من Supabase أو أداة خارجية */
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
