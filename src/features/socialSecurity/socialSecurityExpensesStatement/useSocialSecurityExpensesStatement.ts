import { useQuery } from "@tanstack/react-query";
import supabase from "../../../services/supabase";

export function useSocialSecurityExpensesStatement(
  yearId,
  monthId,
  paymentMethod
) {
  const { data, error, isLoading } = useQuery({
    queryKey: [
      "social_security_expenses_statement",
      yearId,
      monthId,
      paymentMethod,
    ],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_social_security_expenses_statement",
        {
          p_year_id: yearId,
          p_month_id: monthId,
          p_payment_method: paymentMethod,
        }
      );
      if (error) throw error;
      return data;
    },
    retry: false,
    enabled: !!yearId && !!monthId && !!paymentMethod, // عشان مينفذش الكويري لو القيم null
  });

  return { isLoading, data, error };
}
