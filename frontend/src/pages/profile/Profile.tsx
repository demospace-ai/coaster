import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { Input, TextArea } from "src/components/input/Input";
import { useSelector } from "src/root/model";
import { useUpdateProfilePicture, useUpdateUser } from "src/rpc/data";
import { z } from "zod";

const ProfileFormSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  about: z.string().optional(),
});

type ProfileFormSchemaType = z.infer<typeof ProfileFormSchema>;

export const Profile: React.FC = () => {
  const user = useSelector((state) => state.login.user);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { mutate: mutateUser } = useUpdateUser();
  const { mutate: mutateProfilePicture } = useUpdateProfilePicture();

  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<ProfileFormSchemaType>({
    mode: "onBlur",
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      about: user?.about,
    },
    resolver: zodResolver(ProfileFormSchema),
  });

  const onSubmit = (data: ProfileFormSchemaType) => {
    mutateUser({
      first_name: data.first_name,
      last_name: data.last_name,
      about: data.about,
    });
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-h-full tw-bg-slate-200 tw-pt-20 sm:tw-pt-24">
      <form
        className="tw-flex tw-flex-col tw-max-w-full sm:tw-max-w-2xl tw-w-full tw-px-4 sm:tw-px-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="tw-text-center sm:tw-text-left tw-w-full tw-text-3xl tw-font-semibold tw-mb-3">
          Profile Details
        </div>
        <div className="tw-flex tw-w-full tw-justify-center tw-mb-5">
          <input
            ref={imageInputRef}
            type="file"
            className="tw-hidden"
            onChange={(e: FormEvent<HTMLInputElement>) => {
              if (e.currentTarget && e.currentTarget.files) {
                const file = e.currentTarget.files[0];
                mutateProfilePicture(file);
              }
            }}
          />
          {user?.profile_picture_url ? (
            <img
              src={user?.profile_picture_url}
              className="tw-rounded-full tw-object-cover tw-aspect-square tw-h-24 tw-mt-2 tw-cursor-pointer"
              referrerPolicy="no-referrer"
              onClick={() => imageInputRef.current?.click()}
            />
          ) : (
            <div
              className="tw-bg-slate-400 tw-text-white tw-text-4xl tw-rounded-full tw-aspect-square tw-h-24 tw-select-none tw-flex tw-items-center tw-justify-center tw-cursor-pointer"
              onClick={() => imageInputRef.current?.click()}
            >
              {user!.first_name.charAt(0)}
            </div>
          )}
        </div>
        <Input className="tw-my-1" label="First Name" {...register("first_name")} />
        <FormError message={errors.first_name?.message} />
        <Input className="tw-my-1" label="Last Name" {...register("last_name")} />
        <FormError message={errors.last_name?.message} />
        <Input className="tw-my-1" label="Email" {...register("email")} disabled tooltip="Cannot change email" />
        <FormError message={errors.email?.message} />
        <TextArea
          className="tw-my-1"
          label="About"
          {...register("about")}
          placeholder="Share some facts about yourself!"
        />
        <FormError message={errors.about?.message} />
        <button
          type="submit"
          className="tw-flex tw-justify-center tw-w-full sm:tw-w-fit tw-rounded-lg tw-bg-yellow-700 tw-text-white tw-font-medium tw-px-10 tw-py-2 tw-mt-3"
        >
          Save
        </button>
      </form>
    </div>
  );
};
