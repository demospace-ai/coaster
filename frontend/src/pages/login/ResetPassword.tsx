import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { Button } from "src/components/button/Button";
import longlogo from "src/components/images/long-logo.svg";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useResetPassword } from "src/rpc/data";
import { z } from "zod";

const ResetPasswordFormSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirm_password: z.string(),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm_password"],
        message: "The passwords did not match.",
      });
    }
  });

type ResetPasswordFormSchemaType = z.infer<typeof ResetPasswordFormSchema>;

export const ResetPassword: React.FC = () => {
  const { mutate: mutatePassword, isLoading, error: submitError } = useResetPassword();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ResetPasswordFormSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  if (!token) {
    return <div>Unexpected error</div>;
  }

  const onSubmit = (data: ResetPasswordFormSchemaType) => {
    mutatePassword({
      password: data.password,
      token: token,
    });
  };

  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-bg-slate-100">
      <div className="tw-mt-20 sm:tw-mt-32 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg sm:tw-shadow-md sm:tw-bg-white tw-items-center">
          <img src={longlogo} className="tw-h-8 tw-select-none tw-mb-4" alt="coaster logo" />
          <form className="tw-flex tw-flex-col tw-items-center tw-my-2 tw-w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className="tw-text-xl tw-font-semibold tw-text-center tw-mb-2">Reset Password</div>
            <Input className="tw-my-1" label="New Password" {...register("password")} type="password" />
            <FormError message={errors.password?.message} />
            <Input className="tw-my-1" label="Confirm Password" {...register("confirm_password")} type="password" />
            <FormError message={errors.confirm_password?.message} />
            <Button type="submit" className="tw-w-full tw-bg-[#3673aa] hover:tw-bg-[#396082] tw-px-10 tw-h-12 tw-mt-4">
              {isLoading ? <Loading /> : "Submit"}
            </Button>
            <FormError
              className="tw-mt-2"
              message={submitError ? "Try requesting a new reset password link." : undefined}
            />
          </form>
        </div>
        <div className="tw-text-xs tw-text-center tw-mt-4 tw-text-slate-800 tw-select-none tw-mx-8 sm:tw-mx-0">
          By continuing you agree to Coaster's{" "}
          <a className="tw-text-blue-500" href="https://trycoaster.com/terms" target="_blank" rel="noreferrer">
            Terms of Use
          </a>{" "}
          and{" "}
          <a className="tw-text-blue-500" href="https://trycoaster.com/privacy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </div>
  );
};
