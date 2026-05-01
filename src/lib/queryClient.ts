import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /** بيانات مرجعية/نادرة التغيير؛ يمكن تجاوزها لكل استعلام (مثلاً staleTime: 0 للقوائم المالية). */
      staleTime: 60 * 1000,
      retry: 1,
      /** إعادة الجلب عند العودة للتبويب — مفيد بعد تعديل البيانات من Supabase أو أداة خارجية */
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
});
