"use client";

import { useUserContext } from "@coaster/components/src/auth/UserProviderClient";
import { Button } from "@coaster/components/src/button/Button";
import { FormError } from "@coaster/components/src/error/FormError";
import { Input, TextArea } from "@coaster/components/src/input/Input";
import { Loading } from "@coaster/components/src/loading/Loading";
import { useShowToast } from "@coaster/components/src/notifications/Notifications";
import { ProfilePicture } from "@coaster/components/src/profile/ProfilePicture";
import { useUpdateProfilePicture, useUpdateUser } from "@coaster/rpc/client";
import { UserUpdates } from "@coaster/rpc/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { FormEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ProfileFormSchema = z
  .object({
    first_name: z.string().min(1, { message: "First name is required" }),
    last_name: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    about: z.string().optional(),
    password: z
      .union([z.string().length(0), z.string().min(8, { message: "Password must be at least 8 characters" })])
      .optional(),
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

type ProfileFormSchemaType = z.infer<typeof ProfileFormSchema>;

export const Profile: React.FC = () => {
  const showToast = useShowToast();
  const user = useUserContext();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { mutate: mutateUser, isLoading: isSaving } = useUpdateUser(() => {
    showToast("success", "Profile updated successfully.", 2000);
    reset({}, { keepValues: true });
  });
  const { mutate: mutateProfilePicture } = useUpdateProfilePicture();

  const {
    handleSubmit,
    register,
    watch,
    reset,
    formState: { errors, dirtyFields, isDirty },
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

  const lastName = watch("last_name");
  const password = watch("password");

  const onSubmit = (data: ProfileFormSchemaType) => {
    if (!isDirty) {
      return;
    }

    const payload = {} as UserUpdates;
    dirtyFields.first_name && (payload.first_name = data.first_name);
    dirtyFields.last_name && (payload.last_name = data.last_name);
    dirtyFields.password && (payload.password = data.password);
    dirtyFields.about && (payload.about = data.about);
    mutateUser(payload);
  };

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-h-full tw-w-full tw-bg-slate-200 tw-pt-8 sm:tw-pt-14">
      <form
        className="tw-flex tw-flex-col tw-max-w-full sm:tw-max-w-2xl tw-w-full tw-px-4 sm:tw-px-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="tw-text-center sm:tw-text-left tw-w-full tw-text-3xl tw-font-semibold tw-mb-3">
          Profile Details
        </div>
        <div className="tw-flex tw-flex-col tw-w-full tw-items-center tw-justify-center tw-mb-5">
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
            <ProfilePicture
              url={user.profile_picture_url}
              className="tw-w-24 tw-h-24 tw-cursor-pointer"
              name={user.first_name}
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
          <div
            className="tw-text-blue-600 tw-select-none tw-opacity-80 tw-cursor-pointer tw-mt-1"
            onClick={() => imageInputRef.current?.click()}
          >
            Edit
          </div>
        </div>
        <Input className="tw-my-1" label="First Name" {...register("first_name")} value={watch("first_name")} />
        <FormError message={errors.first_name?.message} />
        <Input className="tw-my-1" label="Last Name" {...register("last_name")} value={lastName ? lastName : ""} />
        <FormError message={errors.last_name?.message} />
        <Input
          className="tw-my-1"
          label="Email"
          {...register("email")}
          disabled
          tooltip="Contact us at support@trycoaster.com to change your email."
          value={watch("email")}
        />
        <FormError message={errors.email?.message} />
        <Input
          className="tw-my-1"
          label="New Password"
          {...register("password")}
          type="password"
          value={password ? password : ""}
        />
        <FormError message={errors.password?.message} />
        <Input
          className="tw-my-1"
          label="Confirm Password"
          {...register("confirm_password")}
          type="password"
          value={watch("confirm_password")}
        />
        <FormError message={errors.confirm_password?.message} />
        <TextArea
          className="tw-my-1"
          label="About"
          {...register("about")}
          placeholder="Share some facts about yourself!"
          value={watch("about")}
        />
        <FormError message={errors.about?.message} />
        <Button
          type="submit"
          className="tw-w-full sm:tw-w-32 tw-flex tw-items-center tw-justify-center tw-px-10 tw-py-2 tw-mt-3"
          disabled={!isDirty}
        >
          {isSaving ? <Loading /> : "Save"}
        </Button>
      </form>
    </div>
  );
};
