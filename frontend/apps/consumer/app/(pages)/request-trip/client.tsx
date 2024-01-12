"use client";

import { Button } from "@coaster/components/button/Button";
import { FormError } from "@coaster/components/error/FormError";
import { Input, TextArea } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { getAnonymousID } from "@coaster/components/rudderstack/client";
import { useAuthContext } from "@coaster/rpc/client";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestTrip } from "app/(pages)/request-trip/server-actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const RequestTrip: React.FC = () => {
  const { user } = useAuthContext();
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const schema = z.object({
    email: z.string().email(),
    description: z.string().min(4, "Trip description must be at least 4 characters."),
  });
  type SchemaType = z.infer<typeof schema>;
  const { handleSubmit, register, reset, control, watch, formState } = useForm<SchemaType>({
    mode: "onBlur",
    resolver: zodResolver(schema),
    defaultValues: {
      email: user ? user.email : "",
      description: "",
    },
  });

  const submit = async (values: SchemaType) => {
    setLoading(true);
    const anonymousID = getAnonymousID();
    await requestTrip(values.email, values.description, anonymousID);
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
            className="tw-mt-4 tw-min-h-[120px] tw-max-h-96"
            value={watch("description")}
            label="Describe your dream trip"
            {...register("description")}
          />
          <FormError message={formState.errors["description"]?.message} />
          <Button className="tw-w-24 tw-py-2 tw-mt-6" type="submit">
            {loading ? <Loading light /> : "Submit"}
          </Button>
        </form>
      </div>
      {submitted && (
        <div className="tw-flex tw-items-center tw-mt-4 tw-max-w-lg tw-w-[90vw] ">
          <CheckCircleIcon className="tw-w-16 tw-h-16 tw-stroke-green-600 tw-mr-3" />
          <div className="tw-text-left tw-text-base">
            We've received your request and will get back to you within 24 hours with some fantastic options!
          </div>
        </div>
      )}
    </>
  );
};
