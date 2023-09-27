import { Tab } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import update from "immutability-helper";
import { FormEvent, useCallback, useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Control, Controller, FormState, UseFormRegister, UseFormWatch, useFieldArray, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { Button } from "src/components/button/Button";
import { Card } from "src/components/dnd/DragAndDrop";
import { ComboInput, DropdownInput, Input, PriceInput, TextArea } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch } from "src/components/maps/Maps";
import { Modal } from "src/components/modal/Modal";
import { useShowToast } from "src/components/notifications/Notifications";
import {
  AvailabilityTypeSchema,
  CategorySchema,
  DescriptionSchema,
  DurationSchema,
  IncludesSchema,
  MaxGuestsSchema,
  NameSchema,
  PriceSchema,
} from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { AddListingImage, DeleteListingImage, GetListing, UpdateListing, UpdateListingImages } from "src/rpc/api";
import { useListing } from "src/rpc/data";
import { AvailabilityType, AvailabilityTypeType, Category, Image, Listing, ListingInput } from "src/rpc/types";
import { isProd } from "src/utils/env";
import { forceErrorMessage } from "src/utils/errors";
import { getGcsImageUrl } from "src/utils/images";
import { toTitleCase } from "src/utils/string";
import { mergeClasses } from "src/utils/twmerge";
import { mutate } from "swr";
import { z } from "zod";

const EditListingSchema = z.object({
  name: NameSchema,
  description: DescriptionSchema,
  price: PriceSchema,
  category: CategorySchema,
  location: z.string().min(1),
  duration: DurationSchema,
  maxGuests: MaxGuestsSchema,
  includes: IncludesSchema,
  availabilityType: AvailabilityTypeSchema,
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
      <div className="tw-flex tw-flex-col tw-w-full tw-max-w-7xl">
        <div className="tw-flex tw-w-full tw-justify-between tw-items-center">
          <div className="tw-font-semibold sm:tw-font-bold tw-text-3xl sm:tw-text-4xl tw-hyphens-auto">
            Edit Listing
          </div>
          <a
            className="tw-flex tw-items-center tw-gap-1 tw-text-blue-600 tw-border tw-border-solid tw-border-blue-600 tw-px-3 tw-py-1 tw-rounded-lg"
            href={
              isProd()
                ? `https://www.trycoaster.com/listings/${listingID}`
                : `http://localhost:3000/listings/${listingID}`
            }
            target="_blank"
            rel="noreferrer"
          >
            See preview
            <EyeIcon className="tw-h-4" />
          </a>
        </div>
        <div className="tw-flex tw-flex-col sm:tw-flex-row tw-mt-4 sm:tw-mt-8">
          <Tab.Group>
            <div className="tw-relative tw-flex tw-items-center sm:tw-items-start tw-mb-3">
              <ChevronLeftIcon className="sm:tw-hidden tw-h-4" />
              <Tab.List className="sm:tw-sticky sm:tw-top-32 tw-flex tw-flex-1 sm:tw-flex-col tw-space-x-1 tw-rounded-xl tw-p-1 tw-overflow-scroll tw-hide-scrollbar sm:tw-overflow-visible tw-gap-3 sm:tw-mr-[10vw]">
                {["Listing Details", "Images", "Included Amenities", "Availability"].map((section) => (
                  <Tab
                    key={section}
                    className={({ selected }) =>
                      mergeClasses(
                        "tw-w-full tw-rounded-lg tw-py-2.5 tw-px-4 tw-text-sm tw-font-medium tw-leading-5 tw-whitespace-nowrap tw-text-start tw-outline-none",
                        selected ? "tw-bg-white tw-shadow" : "hover:tw-bg-slate-100",
                      )
                    }
                  >
                    {section}
                  </Tab>
                ))}
              </Tab.List>
              <ChevronRightIcon className="sm:tw-hidden tw-h-4" />
            </div>
            <EditListingForm listing={listing} />
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

const EditListingForm: React.FC<{ listing: Listing }> = ({ listing }) => {
  const showToast = useShowToast();
  const { handleSubmit, register, reset, control, watch, formState } = useForm<EditListingSchemaType>({
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
      availabilityType: listing.availability_type,
      includes: listing.includes?.map((include) => ({
        value: include,
      })),
    },
  });

  const updateListing = async (values: EditListingSchemaType) => {
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

  return (
    <form className="tw-w-full tw-mt-2 tw-mb-32" onSubmit={handleSubmit(updateListing)}>
      <Tab.Panels>
        {[
          <ListingDetails
            register={register}
            control={control}
            formState={formState}
            watch={watch}
            listing={listing}
          />,
          <Images listing={listing} formState={formState} />,
          <Includes register={register} control={control} formState={formState} />,
          <Availability register={register} control={control} formState={formState} watch={watch} listing={listing} />,
        ].map((panel, idx) => (
          <Tab.Panel key={idx}>{panel}</Tab.Panel>
        ))}
      </Tab.Panels>
    </form>
  );
};

const Availability: React.FC<{
  listing: Listing;
  watch: UseFormWatch<EditListingSchemaType>;
  register: UseFormRegister<EditListingSchemaType>;
  control: Control<EditListingSchemaType>;
  formState: FormState<EditListingSchemaType>;
}> = ({ listing, watch, register, control, formState }) => {
  return (
    <>
      <div className="tw-text-2xl tw-font-semibold tw-mb-2">Availability</div>
      <Controller
        name="availabilityType"
        control={control}
        render={({ field }) => (
          <DropdownInput
            placeholder={"Availability Type"}
            className="tw-w-full tw-flex tw-mt-3"
            label="Availability Type"
            value={watch("availabilityType")}
            options={AvailabilityType.options}
            onChange={field.onChange}
            getElementForDisplay={getAvailabilityTypeDisplay}
          />
        )}
      />
      <FormError message={formState.errors.availabilityType?.message} />
      <Button type="submit" className="tw-mt-6 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </>
  );
};

const ListingDetails: React.FC<{
  listing: Listing;
  watch: UseFormWatch<EditListingSchemaType>;
  register: UseFormRegister<EditListingSchemaType>;
  control: Control<EditListingSchemaType>;
  formState: FormState<EditListingSchemaType>;
}> = ({ listing, watch, register, control, formState }) => {
  return (
    <>
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
    </>
  );
};

const Includes: React.FC<{
  register: UseFormRegister<EditListingSchemaType>;
  control: Control<EditListingSchemaType>;
  formState: FormState<EditListingSchemaType>;
}> = ({ register, control, formState }) => {
  const { fields, append, remove } = useFieldArray({
    name: "includes",
    control,
  });

  return (
    <>
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
    </>
  );
};

const Images: React.FC<{ listing: Listing; formState: FormState<EditListingSchemaType> }> = ({
  listing,
  formState,
}) => {
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <ImagesInner listing={listing} />
      </DndProvider>
      <Button type="submit" className="tw-mt-6 tw-w-full sm:tw-w-32 tw-h-12 tw-ml-auto" disabled={!formState.isDirty}>
        {formState.isSubmitting ? <Loading /> : "Save"}
      </Button>
      <FormError message={formState.errors.root?.message} />
    </>
  );
};

const ImagesInner: React.FC<{ listing: Listing }> = ({ listing }) => {
  const [error, setError] = useState<string | undefined>(undefined);
  const [images, setImages] = useState(listing.images);
  const newImageRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  const findCard = useCallback(
    (id: string) => {
      const image = images.filter((image) => `${image.id}` === id)[0];
      return {
        image,
        index: images.indexOf(image),
      };
    },
    [images],
  );

  const moveCard = useCallback(
    (id: string, atIndex: number) => {
      const { image, index } = findCard(id);
      setImages(
        update(images, {
          $splice: [
            [index, 1],
            [atIndex, 0, image],
          ],
        }),
      );
    },
    [findCard, images, setImages],
  );

  const updateImages = async () => {
    try {
      await sendRequest(UpdateListingImages, {
        pathParams: { listingID: listing.id },
        payload: { images },
      });

      mutate({ GetListing, listingID: listing.id }, { ...listing, images });
    } catch (e) {}
  };

  const addImage = async (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget && e.currentTarget.files) {
      const formData = new FormData();
      formData.append("listing_image", e.currentTarget.files[0]);
      try {
        const listingImage = await sendRequest(AddListingImage, {
          pathParams: { listingID: listing.id },
          formData: formData,
        });

        mutate({ GetListing, listingID: listing.id }, { ...listing, images: [...listing.images, listingImage] });
        setImages([...images, listingImage]);
        setError(undefined);
      } catch (e) {
        setError(forceErrorMessage(e));
      }
    }
  };

  const [, drop] = useDrop(() => ({ accept: "card" }));
  return (
    <>
      <div className="tw-text-2xl tw-font-semibold">Images</div>
      <div
        ref={drop}
        className="tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 tw-mt-3 tw-gap-4 sm:tw-gap-8 tw-justify-items-center"
      >
        {images.map((image) => (
          <Card
            key={image.id}
            id={String(image.id)}
            moveCard={moveCard}
            findCard={findCard}
            onDrop={updateImages}
            className="tw-relative tw-w-fit"
          >
            <img
              className="tw-aspect-square tw-bg-gray-100 tw-object-cover hover:tw-brightness-90 tw-transition-all tw-duration-100 tw-rounded-lg tw-cursor-grab"
              src={listing.images.length > 0 ? getGcsImageUrl(image) : "TODO"}
            />
            <XMarkIcon
              className="tw-w-8 tw-absolute tw-right-2 tw-top-2 tw-bg-gray-100 tw-p-1 tw-rounded-lg tw-opacity-80 tw-cursor-pointer hover:tw-opacity-100"
              onClick={() => {
                setImageToDelete(image.id);
                setShowDeleteConfirmation(true);
              }}
            />
          </Card>
        ))}
        <div
          className="tw-group tw-aspect-square tw-w-full tw-bg-gray-100 tw-rounded-lg tw-cursor-pointer tw-flex tw-justify-center tw-items-center"
          onClick={() => newImageRef.current?.click()}
        >
          <input ref={newImageRef} type="file" className="tw-hidden tw-invisible" onChange={addImage} />
          <PlusIcon className="tw-h-12 tw-mx-auto tw-my-auto tw-text-gray-400 group-hover:tw-text-gray-600 tw-transition-all tw-duration-100" />
        </div>
        <Modal
          show={showDeleteConfirmation}
          close={() => {
            setShowDeleteConfirmation(false);
          }}
          clickToEscape={true}
        >
          <DeleteModal
            listing={listing}
            imageID={imageToDelete}
            setImages={setImages}
            closeModal={() => setShowDeleteConfirmation(false)}
          />
        </Modal>
      </div>
      {error && <FormError message={error} />}
    </>
  );
};

interface DeleteModalProps {
  listing: Listing;
  imageID: number | null;
  setImages: (images: Image[]) => void;
  closeModal: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ listing, imageID, setImages, closeModal }) => {
  const [deleting, setDeleting] = useState(false);
  const deleteImage = async () => {
    setDeleting(true);
    try {
      await sendRequest(DeleteListingImage, {
        pathParams: { listingID: listing.id, imageID },
      });

      const newImages = listing.images.filter((item) => item.id !== imageID);
      mutate({ GetListing, listingID: listing.id }, { ...listing, images: newImages });
      setImages(newImages);
      closeModal();
    } catch (e) {}
    setDeleting(false);
  };

  return (
    <div className="tw-w-[320px] sm:tw-w-[420px] tw-px-8 sm:tw-px-12 tw-pb-10">
      <div className="tw-text-center tw-w-full tw-text-xl tw-font-semibold tw-mb-5">Permanently delete this image?</div>
      <Button
        className="tw-flex tw-h-[52px] tw-items-center tw-justify-center tw-whitespace-nowrap tw-w-full"
        onClick={deleteImage}
      >
        {deleting ? <Loading /> : "Delete"}
      </Button>
    </div>
  );
};

function getAvailabilityTypeDisplay(value: AvailabilityTypeType) {
  switch (value) {
    case AvailabilityType.Enum.date:
      return "Full day (customer just chooses a date)";
    case AvailabilityType.Enum.datetime:
      return "Date and time (customer chooses a date and time slot)";
  }
}
