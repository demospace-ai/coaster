"use client";

import { Button } from "@coaster/components/button/Button";
import { FormError } from "@coaster/components/error/FormError";
import { Input, RichTextEditor } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { updateItinerarySteps, useNotificationContext } from "@coaster/rpc/client";
import { ItineraryStepInput } from "@coaster/types";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useListingContext } from "app/(pages)/listings/[listingID]/edit/context";
import { ItinerarySchema } from "app/(pages)/listings/[listingID]/edit/schema";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const EditListingItinerarySchema = z.object({
  itinerarySteps: ItinerarySchema,
});

type EditListingItinerarySchemaType = z.infer<typeof EditListingItinerarySchema>;

export default function Itinerary() {
  const listing = useListingContext();
  const { showNotification } = useNotificationContext();
  const { handleSubmit, register, reset, control, formState } = useForm<EditListingItinerarySchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EditListingItinerarySchema),
    defaultValues: {
      itinerarySteps: listing?.itinerary_steps?.map((step) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        step_label: step.step_label,
        step_order: step.step_order,
      })),
    },
  });

  const onSubmit = async (values: EditListingItinerarySchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload: ItineraryStepInput[] = values.itinerarySteps.map((step) => ({
      id: "id" in step ? step.id : undefined,
      title: step.title,
      description: step.description,
      step_label: step.step_label,
    }));

    try {
      const updatedItinerary = await updateItinerarySteps(listing.id, payload);

      reset(
        {
          itinerarySteps: updatedItinerary.map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            step_label: step.step_label,
            step_order: step.step_order,
          })),
        },
        { keepValues: true },
      );

      showNotification("success", "Itinerary updated successfully.", 2000);
    } catch (e) {
      // TODO
    }
  };

  const {
    fields: itinerarySteps,
    append,
    remove,
  } = useFieldArray({
    name: "itinerarySteps",
    control,
  });

  return (
    <form className="tw-w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="tw-flex tw-flex-col">
        <div className="tw-mb-2 tw-text-2xl tw-font-semibold">Itinerary</div>
        <div className="tw-flex tw-flex-col tw-gap-3">
          {itinerarySteps.map((field, idx) => (
            <div key={idx} className="tw-mb-4 tw-w-full">
              <div className="tw-flex tw-items-center">
                <div className="tw-w-full">
                  <h2 className="tw-mb-2 tw-text-xl tw-font-medium">Step {idx + 1}</h2>
                  <div className="tw-flex tw-gap-2">
                    <div className="tw-flex tw-w-full tw-flex-col">
                      <Input
                        {...register(`itinerarySteps.${idx}.step_label`)}
                        value={field.step_label}
                        label="Step Label"
                        placeholder="e.g. Day 1 or 9:00 AM"
                      />
                      <FormError message={formState.errors.itinerarySteps?.[idx]?.step_label?.message} />
                    </div>
                    <div className="tw-flex tw-w-full tw-flex-col">
                      <Input
                        {...register(`itinerarySteps.${idx}.title`)}
                        value={field.title}
                        label="Title"
                        placeholder="Hike to Yosemite Valley"
                      />
                      <FormError message={formState.errors.itinerarySteps?.[idx]?.title?.message} />
                    </div>
                  </div>
                  <Controller
                    control={control}
                    name={`itinerarySteps.${idx}.description`}
                    render={({ field }) => (
                      <RichTextEditor
                        value={field.value}
                        setValue={field.onChange}
                        onBlur={field.onBlur}
                        className="tw-mt-2 tw-h-[120px] tw-min-h-[120px]"
                        label="Description"
                      />
                    )}
                  />
                  <FormError message={formState.errors.itinerarySteps?.[idx]?.description?.message} />
                </div>
                <div className="tw-flex tw-items-center">
                  <TrashIcon
                    className="tw-ml-5 tw-h-10 tw-shrink-0 tw-cursor-pointer tw-rounded tw-p-2 hover:tw-bg-gray-100"
                    onClick={() => remove(idx)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="tw-mt-5 tw-flex tw-items-center tw-justify-center tw-border tw-border-solid tw-border-black tw-bg-white tw-py-2 tw-font-medium tw-text-black hover:tw-bg-slate-100"
          onClick={() => {
            append({ id: undefined, title: "", description: "", step_label: "" });
          }}
        >
          <PlusIcon className="tw-mr-1.5 tw-h-4" />
          Add Itinerary Step
        </Button>
      </div>
      <Button type="submit" className="tw-ml-auto tw-mt-6 tw-h-12 tw-w-full sm:tw-w-32" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </form>
  );
}
