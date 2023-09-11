import { EyeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { NavLink, useParams } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { BackButton, Button } from "src/components/button/Button";
import { ComboInput, Input, PriceInput, TextArea } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch } from "src/components/maps/Maps";
import { useShowToast } from "src/components/notifications/Notifications";
import {
  CategorySchema,
  DescriptionSchema,
  DurationSchema,
  MaxGuestsSchema,
  NameSchema,
  PriceSchema,
} from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { UpdateListing } from "src/rpc/api";
import { useListing } from "src/rpc/data";
import { Category, Listing, ListingInput } from "src/rpc/types";
import { toTitleCase } from "src/utils/string";
import { z } from "zod";

const EditListingSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema,
  price: PriceSchema,
  category: CategorySchema,
  location: z.string().min(1),
  duration: DurationSchema,
  maxGuests: MaxGuestsSchema,
});

type EditListingSchemaType = z.infer<typeof EditListingSchema>;

export const EditListing: React.FC = () => {
  const { listingID } = useParams<{ listingID: string }>();
  const { listing, error } = useListing(Number(listingID));

  if (!listing) {
    if (!error) {
      return <Loading />;
    } else {
      return <div>Something unexpected happened.</div>;
    }
  }

  return (
    <div className="tw-flex tw-flex-col tw-w-full tw-justify-center tw-items-center tw-px-4 sm:tw-px-20 tw-py-4 sm:tw-py-12">
      <BackButton className="tw-mr-auto tw-mb-5" />
      <div className="tw-flex tw-w-full tw-max-w-lg tw-justify-between tw-items-center">
        <div className="tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl tw-hyphens-auto">Edit Listing</div>
        <NavLink className="tw-flex tw-items-center tw-gap-1 tw-text-blue-600" to={`/listings/${listingID}`}>
          See preview
          <EyeIcon className="tw-h-4" />
        </NavLink>
      </div>
      <EditListingForm listing={listing} />
    </div>
  );
};

const EditListingForm: React.FC<{ listing: Listing }> = ({ listing }) => {
  const showToast = useShowToast();
  const {
    handleSubmit,
    register,
    reset,
    control,
    watch,
    formState: { errors, dirtyFields, isSubmitting, isDirty },
  } = useForm<EditListingSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EditListingSchema),
    defaultValues: {
      name: listing.name,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      location: listing.location,
      duration: listing.duration_minutes,
      maxGuests: listing.max_guests,
    },
  });

  // Needed to display label correctly
  const nameValue = watch("name");
  const descriptionValue = watch("description");
  const priceValue = watch("price");
  const categoryValue = watch("category");
  const durationValue = watch("duration");
  const maxGuestsValue = watch("maxGuests");

  const updateListing = async (values: EditListingSchemaType) => {
    const payload = {} as ListingInput;
    dirtyFields.name && (payload.name = values.name);
    dirtyFields.description && (payload.description = values.description);
    dirtyFields.price && (payload.price = values.price);
    dirtyFields.category && (payload.category = values.category);
    dirtyFields.location && (payload.location = values.location);
    dirtyFields.duration && (payload.duration_minutes = values.duration);
    dirtyFields.maxGuests && (payload.max_guests = values.maxGuests);

    try {
      await sendRequest(UpdateListing, {
        pathParams: { listingID: listing.id },
        payload,
      });

      reset({}, { keepValues: true });

      showToast("success", "Listing updated successfully.", 2000);
    } catch (e) {
      //TODO
    }
  };

  return (
    <form className="tw-mt-4 tw-mb-10 tw-w-full tw-max-w-lg" onSubmit={handleSubmit(updateListing)}>
      <Input className="tw-w-full tw-flex tw-mt-3" label="Name" {...register("name")} value={nameValue} />
      <FormError message={errors.name?.message} />
      <TextArea
        className="tw-w-full tw-flex tw-mt-3"
        label="Description"
        {...register("description")}
        value={descriptionValue}
      />
      <FormError message={errors.description?.message} />
      <PriceInput
        className="tw-w-full tw-flex tw-mt-3"
        label="Price"
        {...register("price", { valueAsNumber: true })}
        value={priceValue}
      />
      <FormError message={errors.price?.message} />
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <ComboInput
            placeholder={"Category"}
            className="tw-w-full tw-flex tw-mt-3"
            label="Category"
            value={categoryValue}
            options={Category.options}
            onChange={field.onChange}
            getElementForDisplay={(value) => toTitleCase(value)}
          />
        )}
      />
      <FormError message={errors.category?.message} />
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
      <FormError message={errors.location?.message} />
      <Input
        type="number"
        className="tw-w-full tw-flex tw-mt-3"
        label="Duration"
        {...register("duration", { valueAsNumber: true })}
        value={durationValue}
      />
      <FormError message={errors.duration?.message} />
      <Input
        type="number"
        className="tw-w-full tw-flex tw-mt-3"
        label="Max Guests"
        {...register("maxGuests", { valueAsNumber: true })}
        value={maxGuestsValue}
      />
      <FormError message={errors.maxGuests?.message} />
      <Button type="submit" className="tw-mt-3 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!isDirty}>
        {isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={errors.root?.message} />
    </form>
  );
};
