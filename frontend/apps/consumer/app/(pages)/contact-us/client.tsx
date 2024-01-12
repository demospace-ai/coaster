"use client";

import { Button } from "@coaster/components/button/Button";
import { FormError } from "@coaster/components/error/FormError";
import { Input, TextArea } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { getAnonymousID } from "@coaster/components/rudderstack/client";
import { useAuthContext } from "@coaster/rpc/client";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactUs } from "app/(pages)/contact-us/server-actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const ContactUs: React.FC = () => {
  const { user } = useAuthContext();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const schema = z.object({
    email: z.string().email(),
    message: z.string().min(2, "Message must be at least 2 characters."),
  });
  type SchemaType = z.infer<typeof schema>;
  const { handleSubmit, register, watch, formState } = useForm<SchemaType>({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      email: user ? user.email : "",
      message: "",
    },
  });

  const submit = async (values: SchemaType) => {
    setLoading(true);
    const anonymousID = getAnonymousID();
    await contactUs(values.email, values.message, anonymousID);
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <div className="tw-max-w-2xl tw-w-[90vw]">
        <form onSubmit={handleSubmit(submit)}>
          <Input className="tw-mt-4" value={watch("email")} label="Email" {...register("email")} />
          <FormError message={formState.errors["email"]?.message} />
          <TextArea
            className="tw-mt-4 tw-min-h-[140px] tw-max-h-96"
            value={watch("message")}
            label="Message"
            {...register("message")}
          />
          <FormError message={formState.errors["message"]?.message} />
          <Button className="tw-w-24 tw-py-2 tw-mt-6" type="submit">
            {loading ? <Loading light /> : "Submit"}
          </Button>
        </form>
      </div>
      {submitted && (
        <div className="tw-flex tw-items-center tw-mt-4 tw-max-w-lg tw-w-[90vw] ">
          <CheckCircleIcon className="tw-w-16 tw-h-16 tw-stroke-green-600 tw-mr-3" />
          <div className="tw-text-left tw-text-base">
            We've received your request and will get back to you as soon as possible!
          </div>
        </div>
      )}
    </>
  );
};

export const ChatButton: React.FC = () => {
  return (
    <Button
      className="tw-flex"
      onClick={() => {
        if ((window as any).Atlas) {
          (window as any).Atlas.chat.openWindow();
        }
      }}
    >
      Chat Now
    </Button>
  );
};
