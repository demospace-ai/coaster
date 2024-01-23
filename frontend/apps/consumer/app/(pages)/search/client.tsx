"use client";

import { Button } from "@coaster/components/button/Button";
import { FormError } from "@coaster/components/error/FormError";
import { Input, TextArea } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { Modal } from "@coaster/components/modal/Modal";
import { getAnonymousID } from "@coaster/components/rudderstack/client";
import { useAuthContext } from "@coaster/rpc/client";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestTrip } from "app/(pages)/request-trip/server-actions";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const CustomResult: React.FC = () => {
  const { user } = useAuthContext();
  const [showModal, setShowModal] = useState<boolean>(false);
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
      <Modal show={showModal} close={() => setShowModal(false)} title="Submit a trip request" clickToClose>
        {submitted ? (
          <div className="tw-flex tw-flex-col tw-items-center tw-px-6 tw-pt-8 tw-pb-16 tw-max-w-lg tw-w-[90vw] ">
            <CheckCircleIcon className="tw-w-10 tw-h-10 tw-stroke-green-600 tw-mb-4" />
            <div className="tw-text-center tw-text-base">
              We&apos;ve received your request and will get back to you within 24 hours with some fantastic options!
            </div>
            <Button className="tw-w-24 tw-py-2 tw-mt-6" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="tw-px-6 tw-pb-10 tw-max-w-lg tw-w-[90vw]">
            <h2>Send us a description of what you&apos;re looking for and we&apos;ll be in touch within 24 hours!</h2>
            <form onSubmit={handleSubmit(submit)}>
              <Input className="tw-mt-4" value={watch("email")} label="Email" {...register("email")} />
              <FormError message={formState.errors["email"]?.message} />
              <TextArea
                className="tw-mt-4 tw-min-h-[120px] tw-max-h-96"
                value={watch("description")}
                label="Trip Description"
                {...register("description")}
              />
              <FormError message={formState.errors["description"]?.message} />
              <Button className="tw-w-24 tw-py-2 tw-mt-6" type="submit">
                {loading ? <Loading light /> : "Submit"}
              </Button>
            </form>
          </div>
        )}
      </Modal>
      <div className="tw-flex tw-flex-col tw-w-full tw-aspect-square tw-bg-gray-100 tw-rounded-xl tw-items-center tw-justify-center tw-p-5 tw-text-center">
        <span className="tw-text-xl tw-font-heading tw-font-semibold tw-mb-1">Looking for something else?</span>
        <span className="tw-text-sm tw-mb-4">
          Let us know and we&apos;ll do our best to find an adventure you&apos;ll love!
        </span>
        <Button className="tw-py-2 tw-px-10" onClick={() => setShowModal(true)}>
          Request Trip
        </Button>
      </div>
    </>
  );
};
