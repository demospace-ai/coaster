"use client";

import LongLogo from "@coaster/assets/long-logo.svg";
import { SendInvite, sendRequest } from "@coaster/rpc/common";
import { SendInviteRequest } from "@coaster/types";
import { useMutation } from "@coaster/utils/client";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
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
    <div className="tw-flex tw-h-full tw-w-full tw-flex-row tw-bg-slate-100 tw-pb-20">
      <div className="tw-mx-auto tw-mb-auto tw-mt-20 tw-w-[400px] sm:tw-mt-32">
        <div className="tw-flex tw-flex-col tw-items-center tw-rounded-lg tw-px-8 tw-pb-10 tw-pt-12 sm:tw-bg-white sm:tw-shadow-md">
          <Image src={LongLogo} width={200} height={32} className="tw-mb-4 tw-select-none" alt="coaster logo" />
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
    <form className="tw-my-2 tw-flex tw-w-full tw-flex-col tw-items-center" onSubmit={handleSubmit(onSubmit)}>
      <div className="tw-mb-2 tw-text-center tw-text-xl tw-font-semibold">Invite your friends!</div>
      <div className="tw-ml-5 tw-mt-2 tw-flex tw-w-full tw-flex-col tw-gap-2">
        {fields.map((field, idx) => (
          <div key={field.id} className="last:tw-mb-5">
            <div className="tw-flex tw-items-center">
              <Input {...register(`emails.${idx}.email`)} value={field.email} label={`Email ${idx + 1}`} />
              <TrashIcon
                className="tw-ml-1 tw-h-10 tw-cursor-pointer tw-rounded tw-p-2 hover:tw-bg-gray-100"
                onClick={() => remove(idx)}
              />
            </div>
            <FormError message={errors.emails?.[idx]?.email?.message} />
          </div>
        ))}
      </div>
      <Button
        className="tw-flex tw-h-8 tw-w-40 tw-items-center tw-justify-center tw-border tw-border-solid tw-border-black tw-bg-white tw-font-medium tw-text-black hover:tw-bg-slate-100"
        onClick={() => {
          append({ email: "" });
        }}
      >
        <PlusIcon className="tw-mr-1.5 tw-h-4" />
        Add another
      </Button>
      <Button type="submit" className="tw-mt-4 tw-h-10 tw-w-40">
        {isLoading ? <Loading light /> : "Send invites"}
      </Button>
      <FormError message={submitError?.message} />
    </form>
  );
};
