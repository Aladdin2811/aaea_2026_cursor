import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup as signupApi } from "../../api/apiAuth";
import { toast } from "sonner";

type SignupInput = {
  fullName: string;
  roleId: number;
  email: string;
  password: string;
};

export function useSignup() {
  const queryClient = useQueryClient();

  const { mutate: signup, isPending: isLoading } = useMutation({
    mutationFn: (input: SignupInput) => signupApi(input),
    onSuccess: () => {
      toast.success("تم إنشاء الحساب. راجع البريد إن كان التفعيل مفعّلاً.");
      void queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "تعذر إنشاء المستخدم");
    },
  });

  return { signup, isLoading };
}
