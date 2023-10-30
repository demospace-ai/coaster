"use client";

import {
  Button,
  ComboInput,
  FormError,
  InlineMapSearch,
  Input,
  PriceInput,
  TextArea,
} from "@coaster/components/client";
import { Loading } from "@coaster/components/common";
import { useNotificationContext } from "@coaster/rpc/client";
import { UpdateListing, sendRequest } from "@coaster/rpc/common";
import { Category, ListingInput } from "@coaster/types";
import { toTitleCase } from "@coaster/utils/common";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useListingContext } from "supplier/app/(pages)/listings/[listingID]/edit/context";
import {
  AvailabilityTypeSchema,
  CategorySchema,
  DescriptionSchema,
  DurationSchema,
  MaxGuestsSchema,
  NameSchema,
  PriceSchema,
} from "supplier/app/(pages)/listings/[listingID]/edit/schema";
import { z } from "zod";

const EditListingDetailsSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema,
  price: PriceSchema,
  category: CategorySchema,
  location: z.string().min(1),
  duration: DurationSchema,
  maxGuests: MaxGuestsSchema,
  availabilityType: AvailabilityTypeSchema,
});

type EditListingDetailsSchemaType = z.infer<typeof EditListingDetailsSchema>;

export default function Details() {
  const listing = useListingContext();
  const { showNotification } = useNotificationContext();
  const { handleSubmit, register, reset, control, watch, formState } = useForm<EditListingDetailsSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EditListingDetailsSchema),
    defaultValues: {
      name: listing.name,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      location: listing.location,
      duration: listing.duration_minutes,
      maxGuests: listing.max_guests,
      availabilityType: listing.availability_type,
    },
  });

  const updateListing = async (values: EditListingDetailsSchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload = {} as ListingInput;
    formState.dirtyFields.name && (payload.name = values.name);
    formState.dirtyFields.description && (payload.description = values.description);
    formState.dirtyFields.price && (payload.price = values.price);
    formState.dirtyFields.category && (payload.category = values.category);
    formState.dirtyFields.location && (payload.location = values.location);
    formState.dirtyFields.duration && (payload.duration_minutes = values.duration);
    formState.dirtyFields.maxGuests && (payload.max_guests = values.maxGuests);
    formState.dirtyFields.availabilityType && (payload.availability_type = values.availabilityType);

    try {
      await sendRequest(UpdateListing, {
        pathParams: { listingID: listing.id },
        payload,
      });

      reset({}, { keepValues: true });

      showNotification("success", "Listing updated successfully.", 2000);
    } catch (e) {
      // TODO
    }
  };

  return (
    <form className="tw-w-full" onSubmit={handleSubmit(updateListing)}>
      <div className="tw-text-2xl tw-font-semibold tw-mb-2">Listing Basics</div>
      <Input className="tw-w-full tw-flex tw-mt-3" label="Name" {...register("name")} value={watch("name")} />
      <FormError message={formState.errors.name?.message} />
      <TextArea
        className="tw-w-full tw-flex tw-mt-3"
        label="Description"
        {...register("description")}
        value={watch("description")}
      />
      <FormError message={formState.errors.description?.message} />
      <PriceInput
        className="tw-w-full tw-flex tw-mt-3"
        label="Price"
        {...register("price", { valueAsNumber: true })}
        value={watch("price")}
      />
      <FormError message={formState.errors.price?.message} />
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <ComboInput
            placeholder={"Category"}
            className="tw-w-full tw-flex tw-mt-3"
            label="Category"
            value={watch("category")}
            options={Category.options}
            onChange={field.onChange}
            getElementForDisplay={(value) => toTitleCase(value)}
          />
        )}
      />
      <FormError message={formState.errors.category?.message} />
      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <InlineMapSearch
            label="Location"
            hideIcon
            className="tw-justify-start tw-mt-3 tw-mb-0"
            key={listing.location}
            onSelect={field.onChange}
            initial={listing.location}
          />
        )}
      />
      <FormError message={formState.errors.location?.message} />
      <Input
        type="number"
        className="tw-w-full tw-flex tw-mt-3"
        label="Duration (minutes)"
        {...register("duration", { valueAsNumber: true })}
        value={watch("duration")}
      />
      <FormError message={formState.errors.duration?.message} />
      <Input
        type="number"
        className="tw-w-full tw-flex tw-mt-3"
        label="Max Guests"
        {...register("maxGuests", { valueAsNumber: true })}
        value={watch("maxGuests")}
      />
      <FormError message={formState.errors.maxGuests?.message} />
      <Button type="submit" className="tw-mt-6 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </form>
  );
}
