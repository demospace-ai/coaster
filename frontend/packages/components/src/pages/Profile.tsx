"use client";

import { useAuthContext, useNotificationContext, useUpdateProfilePicture, useUpdateUser } from "@coaster/rpc/client";
import { UserUpdates } from "@coaster/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { FormEvent, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../button/Button";
import { FormError } from "../error/FormError";
import { Input, TextArea } from "../input/Input";
import { Loading } from "../loading/Loading";
import { ProfilePicture } from "../profile/ProfilePicture";

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
  const { user, loading } = useAuthContext();
  if (loading && !user) {
    return <Loading />;
  }

  if (!user) {
    redirect("/login");
  }

  const { showNotification } = useNotificationContext();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { mutate: mutateUser, isLoading: isSaving } = useUpdateUser(() => {
    showNotification("success", "Profile updated successfully.", 2000);
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

  return (
    <div className="tw-flex tw-h-full tw-w-full tw-flex-col tw-items-center tw-bg-slate-200 tw-pb-24 tw-pt-8 sm:tw-pt-14">
      <form
        className="tw-flex tw-w-full tw-max-w-full tw-flex-col tw-px-4 sm:tw-max-w-2xl sm:tw-px-0"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="tw-mb-3 tw-w-full tw-text-center tw-text-3xl tw-font-semibold sm:tw-text-left">
          Profile Details
        </div>
        <div className="tw-mb-5 tw-flex tw-w-full tw-flex-col tw-items-center tw-justify-center">
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
              className="tw-cursor-pointer"
              width={96}
              height={96}
              name={user.first_name}
              onClick={() => imageInputRef.current?.click()}
            />
          ) : (
            <div
              className="tw-flex tw-aspect-square tw-h-24 tw-cursor-pointer tw-select-none tw-items-center tw-justify-center tw-rounded-full tw-bg-slate-400 tw-text-4xl tw-text-white"
              onClick={() => imageInputRef.current?.click()}
            >
              {user!.first_name.charAt(0)}
            </div>
          )}
          <div
            className="tw-mt-1 tw-cursor-pointer tw-select-none tw-text-blue-600 tw-opacity-80"
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
          className="tw-mt-3 tw-flex tw-w-full tw-items-center tw-justify-center tw-px-10 tw-py-2 sm:tw-w-32"
          disabled={!isDirty}
        >
          {isSaving ? <Loading /> : "Save"}
        </Button>
      </form>
    </div>
  );
};
