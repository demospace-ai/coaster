import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { FormError } from "src/components/FormError";
import { Button } from "src/components/button/Button";
import { Input } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { useShowToast } from "src/components/notifications/Notifications";
import { useListingContext } from "src/pages/listing/edit";
import { IncludesSchema } from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { UpdateListing } from "src/rpc/api";
import { ListingInput } from "src/rpc/types";
import { z } from "zod";

const EditListingIncludesSchema = z.object({
  includes: IncludesSchema,
});

type EditListingIncludesSchemaType = z.infer<typeof EditListingIncludesSchema>;

export const Includes: React.FC = () => {
  const { listing } = useListingContext();
  const showToast = useShowToast();
  const { handleSubmit, register, reset, control, formState } = useForm<EditListingIncludesSchemaType>({
    mode: "onBlur",
    resolver: zodResolver(EditListingIncludesSchema),
    defaultValues: {
      includes: listing?.includes?.map((include) => ({
        value: include,
      })),
    },
  });

  const updateListing = async (values: EditListingIncludesSchemaType) => {
    if (!formState.isDirty) {
      return;
    }

    const payload = {} as ListingInput;
    formState.dirtyFields.includes &&
      (payload.includes = values.includes
        .filter((include) => include.value.length > 0)
        .map((include) => include.value));

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

  const { fields, append, remove } = useFieldArray({
    name: "includes",
    control,
  });

  return (
    <form className="tw-w-full" onSubmit={handleSubmit(updateListing)}>
      <div className="tw-flex tw-flex-col">
        <div className="tw-text-2xl tw-font-semibold tw-mb-2">Included Amenities</div>
        <div className="tw-flex tw-flex-col tw-gap-3">
          {fields.map((field, idx) => (
            <div key={field.id} className="last:tw-mb-5">
              <div className="tw-flex tw-items-center">
                <Input {...register(`includes.${idx}.value`)} value={field.value} />
                <TrashIcon
                  className="tw-h-10 tw-rounded tw-ml-1 tw-p-2 tw-cursor-pointer hover:tw-bg-gray-100"
                  onClick={() => remove(idx)}
                />
              </div>
              <FormError message={formState.errors.includes?.[idx]?.value?.message} />
            </div>
          ))}
        </div>
        <Button
          className="tw-flex tw-items-center tw-justify-center tw-bg-white hover:tw-bg-slate-100 tw-text-black tw-font-medium tw-border tw-border-solid tw-border-black tw-py-2"
          onClick={() => {
            append({ value: "" });
          }}
        >
          <PlusIcon className="tw-h-4 tw-mr-1.5" />
          Add Included Item
        </Button>
      </div>
      <Button type="submit" className="tw-mt-6 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </form>
  );
};
