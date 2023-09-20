import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import update from "immutability-helper";
import { FormEvent, useCallback, useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { Card } from "src/components/dnd/DragAndDrop";
import {
  ErrorMessage,
  InputStep,
  MultiStep,
  SelectorStep,
  StepParams,
  SubmitResult,
  TextAreaStep,
  wrapHandleSubmit,
} from "src/components/form/MultiStep";
import mapPreview from "src/components/images/map-preview.webp";
import { Input, PriceInput } from "src/components/input/Input";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import {
  CategorySchema,
  DescriptionSchema,
  DurationSchema,
  MaxGuestsSchema,
  NameSchema,
  PriceSchema,
} from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { AddListingImage, DeleteListingImage, GetDraftListing, GetListing, UpdateListingImages } from "src/rpc/api";
import { createListing, updateListing, useDraftListing, useUpdateListing } from "src/rpc/data";
import { CategoryType, Coordinates, Listing, ListingInput, ListingStatus } from "src/rpc/types";
import { getGcsImageUrl } from "src/utils/images";
import { mutate } from "swr";
import { z } from "zod";

export const NewListing: React.FC = () => {
  const { listing, loading } = useDraftListing();
  const navigate = useNavigate();
  const initialStep = computeInitialStep(listing);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-min-h-[600px] tw-mt-10 tw-items-center tw-pb-24 tw-overflow-scroll">
        <MultiStep
          onComplete={() => {
            navigate("/hosting");
          }}
          initialStepNumber={initialStep}
          steps={[
            { id: "category", elementFn: categoryStep, title: "What kind of experience do you want to host?" },
            { id: "location", elementFn: locationStep, title: "Where is your adventure located?" },
            {
              id: "name",
              elementFn: nameStep,
              title: "What do you want to call your adventure?",
              subtitle: "Giving your trip a fun name can make you stand out!",
            },
            {
              id: "description",
              elementFn: descriptionStep,
              title: "Create your description",
              subtitle: "Share what makes your trip special.",
            },
            {
              id: "images",
              elementFn: imageStep,
              title: "Add images",
              subtitle: "Show off your trip with at least three images.",
            },
            { id: "price", elementFn: priceStep, title: "Set a price", subtitle: "You can change it anytime." },
            {
              id: "details",
              elementFn: detailsStep,
              title: "Provide a few final details",
              subtitle: "Let your guests know what to expect.",
            },
            {
              id: "review",
              elementFn: reviewStep,
              title: "Review your listing",
              subtitle: "Here's what we'll show to guests. Make sure everything looks good.",
            },
          ]}
        />
      </div>
    </div>
  );
};

const locationStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <MapsWrapper loadingClass="tw-h-64 sm:tw-h-80">
      <LocationStep {...params} listing={listing} />
    </MapsWrapper>
  );
};

const priceStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return <PriceStep {...params} listing={listing} />;
};

const detailsStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return <DetailsStep {...params} listing={listing} />;
};

const nameStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <InputStep
      {...params}
      schema={NameSchema}
      existingData={listing.name}
      onSubmit={async (data: { value: string }) => {
        if (data.value === listing.name) {
          // No API call needed if previous value was the same
          return { success: true };
        }
        return updateListing(listing.id, { name: data.value });
      }}
    />
  );
};

const descriptionStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <TextAreaStep
      {...params}
      schema={DescriptionSchema}
      existingData={listing.description}
      onSubmit={async (data: { value: string }) => {
        if (data.value === listing.description) {
          // No API call needed if previous value was the same
          return { success: true };
        }
        return updateListing(listing.id, { description: data.value });
      }}
    />
  );
};

const categoryStep = (params: StepParams) => {
  const { listing, loading } = useDraftListing();
  if (loading) {
    return <Loading />;
  }

  return (
    <SelectorStep
      {...params}
      schema={CategorySchema}
      existingData={listing?.category}
      // TODO: fix the typing issue for the onChange data parameter
      onChange={async (data: string): Promise<SubmitResult> => {
        if (listing) {
          if (data === listing.category) {
            // No API call needed if previous value was the same
            return { success: true };
          }
          return updateListing(listing.id, { category: data as CategoryType });
        } else {
          return createListing({ category: data as CategoryType });
        }
      }}
    />
  );
};

const imageStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ImageStep key={JSON.stringify(listing.images)} {...params} listing={listing} />
    </DndProvider>
  );
};

const reviewStep = (params: StepParams) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return params.renderLayout(
    true,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center tw-pb-6">
        <div className="tw-p-8 tw-shadow-centered-md tw-rounded-xl tw-w-full sm:tw-w-96">
          <img
            src={getGcsImageUrl(listing.images[0])}
            alt="preview-cover"
            className="tw-rounded-lg tw-aspect-square tw-object-cover"
          />
          <div className="tw-mt-4 tw-font-bold tw-text-xl">{listing.name}</div>
          <div className="tw-mt-1 tw-font-medium">{listing.location}</div>
          <div className="tw-mt-1">${listing.price} / person</div>
          <NavLink
            className="tw-flex tw-w-fit tw-items-center tw-gap-1 tw-mt-1 tw-text-blue-600"
            to={`/listings/${listing.id}`}
          >
            See full preview
            <EyeIcon className="tw-h-4" />
          </NavLink>
        </div>
      </div>
    ),
    () => updateListing(listing.id, { status: ListingStatus.Review }),
  );
};

const toGoogleCoordinates = (coordinates: Coordinates): google.maps.LatLngLiteral => {
  return { lat: coordinates.latitude, lng: coordinates.longitude };
};

type LocationParams = {
  listing: Listing;
};

const LocationStep: React.FC<StepParams & LocationParams> = ({ listing, renderLayout }) => {
  const { mutate, isLoading } = useUpdateListing(listing.id);
  const onSelect = useCallback((location: string) => mutate({ location }), []);

  const coordinates = listing.coordinates ? toGoogleCoordinates(listing.coordinates) : null;

  return renderLayout(location !== undefined, () => (
    <div className="tw-flex tw-flex-col tw-items-center">
      <InlineMapSearch key={listing.location} onSelect={onSelect} initial={listing.location} />
      {coordinates ? (
        <MapComponent center={coordinates} zoom={12} marker={coordinates} />
      ) : (
        <>{isLoading ? <Loading /> : <img className="tw-rounded-lg" src={mapPreview} />}</>
      )}
    </div>
  ));
};

type PriceParams = {
  listing: Listing;
};

const PriceStep: React.FC<StepParams & PriceParams> = ({ listing, renderLayout }) => {
  const formSchema = z.object({
    value: PriceSchema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<formSchemaType>({
    mode: "onBlur",
    defaultValues: { value: listing.price },
    resolver: zodResolver(formSchema),
  });

  // TODO: do we want to update on change too?
  const updatePrice = async (data: { value: number }) => {
    if (data.value === listing.price) {
      // No API call needed if previous value was the same
      return { success: true };
    }
    return updateListing(listing.id, { price: data.value });
  };

  return renderLayout(
    isValid,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center tw-mb-6 tw-mx-0.5">
        <PriceInput
          className="tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-outline-2 focus-within:tw-outline-blue-700"
          {...register("value", { valueAsNumber: true })}
          value={watch("value")}
        />
        <ErrorMessage error={errors.value} />
      </div>
    ),
    wrapHandleSubmit(handleSubmit, updatePrice),
  );
};

type ImageParams = {
  listing: Listing;
};

const ImageStep: React.FC<StepParams & ImageParams> = ({ renderLayout, listing }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const isValid = listing.images && listing.images.length > 2;
  const listingID = listing.id;
  const [images, setImages] = useState(listing.images);

  // TODO: validate size and type of file on frontend

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

  const [, drop] = useDrop(() => ({ accept: "card" }));

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
          pathParams: { listingID },
          formData: formData,
        });

        mutate({ GetDraftListing }, { ...listing, images: [...listing.images, listingImage] });
        mutate({ GetListing, listingID });
        setImages([...images, listingImage]);
      } catch (e) {}
    }
  };

  const deleteImage = async (imageID: number) => {
    try {
      await sendRequest(DeleteListingImage, {
        pathParams: { listingID: listing.id, imageID },
      });

      const newImages = listing.images.filter((item) => item.id !== imageID);
      mutate({ GetListing, listingID: listing.id }, { ...listing, images: newImages });
      setImages(newImages);
    } catch (e) {}
  };

  return renderLayout(isValid, () => (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <button className="tw-flex tw-rounded-xl tw-bg-gray-200 tw-px-10 tw-py-3" onClick={() => ref.current?.click()}>
        Add image
      </button>
      <input ref={ref} type="file" className="tw-flex tw-invisible" onChange={addImage} />
      <div ref={drop} className="tw-grid tw-grid-cols-2 tw-gap-4 tw-justify-items-center tw-items-center">
        {images.map((image) => (
          <Card
            key={image.id}
            id={String(image.id)}
            moveCard={moveCard}
            findCard={findCard}
            onDrop={updateImages}
            className="tw-flex tw-relative tw-w-fit tw-h-fit"
          >
            <img
              src={getGcsImageUrl(image)}
              alt="preview-image"
              className="tw-select-none tw-rounded-lg tw-cursor-grab"
            />
            <XMarkIcon
              className="tw-w-8 tw-absolute tw-right-2 tw-top-2 tw-bg-gray-100 tw-p-1 tw-rounded-lg tw-opacity-[90%] tw-cursor-pointer hover:tw-opacity-100"
              onClick={() => deleteImage(image.id)}
            />
          </Card>
        ))}
      </div>
    </div>
  ));
};

type DetailsParams = {
  listing: Listing;
};

const DetailsStep: React.FC<StepParams & DetailsParams> = ({ listing, renderLayout }) => {
  const formSchema = z.object({
    duration: DurationSchema,
    maxGuests: MaxGuestsSchema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm<formSchemaType>({
    mode: "onBlur",
    defaultValues: { duration: listing.duration_minutes, maxGuests: listing.max_guests },
    resolver: zodResolver(formSchema),
  });

  // TODO: do we want to update on change too?
  const updateDetails = async (data: formSchemaType) => {
    if (data.duration === listing.duration_minutes && data.maxGuests === listing.max_guests) {
      // No API call needed if previous value was the same
      return { success: true };
    }

    const payload: ListingInput = {};
    if (data.duration !== listing.duration_minutes) {
      payload.duration_minutes = data.duration;
    }

    if (data.maxGuests !== listing.max_guests) {
      payload.max_guests = data.maxGuests;
    }

    return updateListing(listing.id, payload);
  };

  return renderLayout(
    isValid,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center tw-mb-6 tw-gap-1 tw-mx-0.5">
        <Input
          label="Duration (minutes)"
          type="number"
          className=""
          {...register("duration", { valueAsNumber: true })}
          value={watch("duration")}
        />
        <ErrorMessage error={errors.duration} />
        <Input
          label="Max Guests"
          type="number"
          className=""
          {...register("maxGuests", { valueAsNumber: true })}
          value={watch("maxGuests")}
        />
        <ErrorMessage error={errors.duration} />
      </div>
    ),
    wrapHandleSubmit(handleSubmit, updateDetails),
  );
};

const computeInitialStep = (listing: Listing | undefined): number => {
  if (!listing) {
    return 0;
  }
  if (!listing.category) {
    return 0;
  }
  if (!listing.location) {
    return 1;
  }
  if (!listing.name) {
    return 2;
  }
  if (!listing.description) {
    return 3;
  }
  if (!listing.images || listing.images.length < 3) {
    return 4;
  }
  if (!listing.price) {
    return 5;
  }
  if (!listing.duration_minutes || !listing.max_guests) {
    return 6;
  }

  return 7;
};
