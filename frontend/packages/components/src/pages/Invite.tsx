"use client";

import { LongLogo } from "@coaster/assets";
import { SendInvite, SendInviteRequest, sendRequest } from "@coaster/rpc/common";
import { useMutation } from "@coaster/utils";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../button/Button";
import { FormError } from "../error/FormError";
import { Input } from "../input/Input";
import { Loading } from "../loading/Loading";

export const Invite: React.FC = () => {
  const [done, setDone] = useState(false);
  return (
    <div className="tw-flex tw-flex-row tw-h-full tw-w-full tw-bg-slate-100 tw-pb-20">
      <div className="tw-mt-20 sm:tw-mt-32 tw-mb-auto tw-mx-auto tw-w-[400px]">
        <div className="tw-flex tw-flex-col tw-pt-12 tw-pb-10 tw-px-8 tw-rounded-lg sm:tw-shadow-md sm:tw-bg-white tw-items-center">
          <img src={LongLogo.src} className="tw-h-8 tw-select-none tw-mb-4" alt="coaster logo" />
          {done ? (
            <div className="tw-flex tw-flex-col tw-items-center">
              <div className="tw-text-xl">Invites sent!</div>
              <Button className="tw-mt-4" onClick={() => setDone(false)}>
                Send more
              </Button>
            </div>
          ) : (
            <InviteForm setDone={setDone} />
          )}
        </div>
      </div>
    </div>
  );
};

const InviteFormSchema = z.object({
  emails: z
    .array(
      z.object({
        email: z.string().email(),
      }),
    )
    .min(1, "Please enter at least one email address."),
});

type InviteFormSchemaType = z.infer<typeof InviteFormSchema>;

const InviteForm: React.FC<{ setDone: (done: boolean) => void }> = ({ setDone }) => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<InviteFormSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(InviteFormSchema),
    defaultValues: {
      emails: [{ email: "" }],
    },
  });

  const {
    mutate: invite,
    isLoading,
    error: submitError,
  } = useMutation<undefined, SendInviteRequest>(
    (request: SendInviteRequest) => {
      return sendRequest(SendInvite, { payload: request });
    },
    {
      onSuccess: () => {
        setDone(true);
        reset();
      },
    },
  );

  const { fields, append, remove } = useFieldArray({
    name: "emails",
    control,
  });

  const onSubmit = (data: InviteFormSchemaType) => {
    invite({
      emails: data.emails.map((e) => e.email),
    });
  };

  return (
    <form className="tw-flex tw-flex-col tw-items-center tw-my-2 tw-w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="tw-text-xl tw-font-semibold tw-text-center tw-mb-2">Invite your friends!</div>
      <div className="tw-flex tw-flex-col tw-gap-2 tw-w-full tw-mt-2 tw-ml-5">
        {fields.map((field, idx) => (
          <div key={field.id} className="last:tw-mb-5">
            <div className="tw-flex tw-items-center">
              <Input {...register(`emails.${idx}.email`)} value={field.email} label={`Email ${idx + 1}`} />
              <TrashIcon
                className="tw-h-10 tw-rounded tw-ml-1 tw-p-2 tw-cursor-pointer hover:tw-bg-gray-100"
                onClick={() => remove(idx)}
              />
            </div>
            <FormError message={errors.emails?.[idx]?.email?.message} />
          </div>
        ))}
      </div>
      <Button
        className="tw-flex tw-w-40 tw-h-8 tw-items-center tw-justify-center tw-bg-white hover:tw-bg-slate-100 tw-text-black tw-font-medium tw-border tw-border-solid tw-border-black"
        onClick={() => {
          append({ email: "" });
        }}
      >
        <PlusIcon className="tw-h-4 tw-mr-1.5" />
        Add another
      </Button>
      <Button type="submit" className="tw-mt-4 tw-w-40 tw-h-10">
        {isLoading ? <Loading light /> : "Send invites"}
      </Button>
      <FormError message={submitError?.message} />
    </form>
  );
};
