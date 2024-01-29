"use client";

import { Button } from "@coaster/components/button/Button";
import { FormError } from "@coaster/components/error/FormError";
import { Input } from "@coaster/components/input/Input";
import { Loading } from "@coaster/components/loading/Loading";
import { updateListing, useNotificationContext } from "@coaster/rpc/client";
import { ListingInput } from "@coaster/types";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useListingContext } from "supplier/app/(pages)/listings/[listingID]/edit/context";
import { IncludesSchema, NotIncludedSchema } from "supplier/app/(pages)/listings/[listingID]/edit/schema";
import { z } from "zod";

const EditListingIncludesSchema = z.object({
  includes: IncludesSchema,
  not_included: NotIncludedSchema,
});

type EditListingIncludesSchemaType = z.infer<typeof EditListingIncludesSchema>;

export default function Includes() {
  const listing = useListingContext();
  const { showNotification } = useNotificationContext();
  const { handleSubmit, register, reset, control, formState } = useForm<EditListingIncludesSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EditListingIncludesSchema),
    defaultValues: {
      includes: listing?.includes?.map((include) => ({
        value: include,
      })),
      not_included: listing?.not_included?.map((not_included) => ({
        value: not_included,
      })),
    },
  });

  const onSubmit = async (values: EditListingIncludesSchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload = {} as ListingInput;
    formState.dirtyFields.includes &&
      (payload.includes = values.includes
        .filter((include) => include.value.length > 0)
        .map((include) => include.value));

    formState.dirtyFields.not_included &&
      (payload.not_included = values.not_included
        .filter((not_included) => not_included.value.length > 0)
        .map((not_included) => not_included.value));

    try {
      await updateListing(listing.id, payload);

      reset({}, { keepValues: true });

      showNotification("success", "Listing updated successfully.", 2000);
    } catch (e) {
      // TODO
    }
  };

  const {
    fields: included,
    append: appendIncluded,
    remove: removeIncluded,
  } = useFieldArray({
    name: "includes",
    control,
  });

  const {
    fields: notIncluded,
    append: appendNotIncluded,
    remove: removeNotIncluded,
  } = useFieldArray({
    name: "not_included",
    control,
  });

  return (
    <form className="tw-w-full" onSubmit={handleSubmit(onSubmit)}>
      <div className="tw-flex tw-flex-col">
        <div className="tw-text-2xl tw-font-semibold tw-mb-2">Included Amenities</div>
        <div className="tw-flex tw-flex-col tw-gap-3">
          {included.map((field, idx) => (
            <div key={field.id} className="last:tw-mb-5">
              <div className="tw-flex tw-items-center">
                <Input {...register(`includes.${idx}.value`)} value={field.value} />
                <TrashIcon
                  className="tw-h-10 tw-rounded tw-ml-1 tw-p-2 tw-cursor-pointer hover:tw-bg-gray-100"
                  onClick={() => removeIncluded(idx)}
                />
              </div>
              <FormError message={formState.errors.includes?.[idx]?.value?.message} />
            </div>
          ))}
        </div>
        <Button
          className="tw-flex tw-items-center tw-justify-center tw-bg-white hover:tw-bg-slate-100 tw-text-black tw-font-medium tw-border tw-border-solid tw-border-black tw-py-2"
          onClick={() => {
            appendIncluded({ value: "" });
          }}
        >
          <PlusIcon className="tw-h-4 tw-mr-1.5" />
          Add Included Item
        </Button>
      </div>
      <div className="tw-flex tw-flex-col tw-mt-10">
        <div className="tw-text-2xl tw-font-semibold tw-mb-2">Not Included</div>
        <div className="tw-flex tw-flex-col tw-gap-3">
          {notIncluded.map((field, idx) => (
            <div key={field.id} className="last:tw-mb-5">
              <div className="tw-flex tw-items-center">
                <Input {...register(`not_included.${idx}.value`)} value={field.value} />
                <TrashIcon
                  className="tw-h-10 tw-rounded tw-ml-1 tw-p-2 tw-cursor-pointer hover:tw-bg-gray-100"
                  onClick={() => removeNotIncluded(idx)}
                />
              </div>
              <FormError message={formState.errors.not_included?.[idx]?.value?.message} />
            </div>
          ))}
        </div>
        <Button
          className="tw-flex tw-items-center tw-justify-center tw-bg-white hover:tw-bg-slate-100 tw-text-black tw-font-medium tw-border tw-border-solid tw-border-black tw-py-2"
          onClick={() => {
            appendNotIncluded({ value: "" });
          }}
        >
          <PlusIcon className="tw-h-4 tw-mr-1.5" />
          Add Not Included Item
        </Button>
      </div>
      <Button type="submit" className="tw-mt-6 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </form>
  );
}
