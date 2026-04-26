import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import Form from "../../ui/Form";
import Input from "../../ui/Input";
import { useSignup } from "./useSignup";
import styled from "styled-components";
import RoleSelect from "../../ui/RoleSelect";

const FormRow = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 24rem 1fr 1.2fr;
  gap: 2.4rem;

  padding: 1.2rem 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-grey-100);
  }

  &:has(button) {
    display: flex;
    justify-content: flex-end;
    gap: 1.2rem;
  }
`;

const Label = styled.label`
  font-size: medium;
  font-weight: 600;
`;

const Error = styled.span`
  font-size: medium;
  color: var(--color-red-700);
`;

// Email regex: /\S+@\S+\.\S+/

function SignupForm({ onCloseModal }) {
  const { signup, isLoading } = useSignup();
  const { register, formState, getValues, handleSubmit, reset } = useForm();
  const { errors } = formState;

  function onSubmit({ fullName, appRole, email, password }) {
    signup(
      { fullName, appRole, email, password },
      {
        onSuccess: (data) => {
          reset();
          onCloseModal?.();
        },
      }
    );
  }

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      type={onCloseModal ? "modal" : "regular"}
    >
      <FormRow>
        <Label htmlFor="fullName">الإسم الكامل :</Label>
        <Input
          type="text"
          id="fullName"
          disabled={isLoading}
          {...register("fullName", { required: "الإسم الكامل مطلوب" })}
        />
        {errors?.fullName && <Error>{errors.fullName.message}</Error>}
      </FormRow>

      <FormRow>
        <RoleSelect register={register} />
        {errors?.appRole && <Error>{errors.appRole.message}</Error>}
      </FormRow>

      <FormRow>
        <Label htmlFor="email">البريد الإلكتروني :</Label>

        <Input
          type="email"
          id="email"
          disabled={isLoading}
          {...register("email", {
            required: "البريد الإلكتروني مطلوب",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "البريد الإلكتروني غير صالح",
            },
          })}
        />
        {errors?.email && <Error>{errors.email.message}</Error>}
      </FormRow>

      <FormRow>
        <Label htmlFor="password">
          كلمة المرور (لا تقل عن 8 حروف أو أرقام) :
        </Label>

        <Input
          type="password"
          id="password"
          disabled={isLoading}
          {...register("password", {
            required: "كلمة المرور مطلوبة",
            minLength: {
              value: 8,
              message: "كلمة المرور يجب أن لا تقل عن 8 حروف أو أرقم",
            },
          })}
        />
        {errors?.password && <Error>{errors.password.message}</Error>}
      </FormRow>

      <FormRow>
        <Label htmlFor="passwordConfirm">تأكيد كلمة المرور :</Label>
        <Input
          type="password"
          id="passwordConfirm"
          disabled={isLoading}
          {...register("passwordConfirm", {
            required: "تأكيد كلمة المرور مطلوب",
            validate: (value) =>
              value === getValues().password ||
              "تأكيد كلمة المرور لا تتطابق مع كلمة المرور",
          })}
        />
        {errors?.passwordConfirm && (
          <Error>{errors.passwordConfirm.message}</Error>
        )}
      </FormRow>

      <FormRow>
        {/* type is an HTML attribute! */}
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
          disabled={isLoading}
        >
          تراجع
        </Button>
        <Button disabled={isLoading}>تسجيل مستخدم جديد</Button>
      </FormRow>
    </Form>
  );
}

export default SignupForm;
