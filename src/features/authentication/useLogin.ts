import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login as loginApi } from "../../api/apiAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type LoginInput = {
  email: string;
  password: string;
};

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoading } = useMutation({
    mutationFn: ({ email, password }: LoginInput) => loginApi({ email, password }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("تم تسجيل الدخول");
      navigate("/", { replace: true });
    },
    onError: () => {
      toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    },
  });

  return { login, isLoading };
}
