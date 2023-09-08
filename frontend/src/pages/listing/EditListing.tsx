import { EyeIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { NavLink, useParams } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { BackButton } from "src/components/button/Button";
import { ComboInput, Input, PriceInput, TextArea } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch } from "src/components/maps/Maps";
import {
  CategorySchema,
  DescriptionSchema,
  DurationSchema,
  MaxGuestsSchema,
  NameSchema,
  PriceSchema,
} from "src/pages/listing/schema";
import { useListing } from "src/rpc/data";
import { Category, Listing } from "src/rpc/types";
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
      <BackButton className="tw-mr-auto tw-mb-10" />
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
  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
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

  return (
    <form className="tw-mt-4 tw-w-full tw-max-w-lg">
      <Input className="tw-w-full tw-flex tw-mt-3" label="Name" {...register("name")} value={nameValue} />
      <FormError message={errors.name?.message} />
      <TextArea
        className="tw-w-full tw-flex tw-mt-3"
        label="Description"
        {...register("description")}
        value={descriptionValue}
      />
      <FormError message={errors.description?.message} />
      <PriceInput className="tw-w-full tw-flex tw-mt-3" label="Price" {...register("price")} value={priceValue} />
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
            className="tw-justify-start tw-mt-3"
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
    </form>
  );
};
