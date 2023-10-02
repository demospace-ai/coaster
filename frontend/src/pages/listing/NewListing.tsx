import { EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import update from "immutability-helper";
import { FormEvent, useCallback, useRef, useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { FormError } from "src/components/FormError";
import { Card } from "src/components/dnd/DragAndDrop";
import {
  ErrorMessage,
  InputStep,
  SelectorStep,
  StepProps,
  SubmitResult,
  TextAreaStep,
  WizardNavButtons,
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
  const initialStepNumber = computeInitialStep(listing);

  if (loading) {
    return <Loading />;
  }

  return <NewListingInner initialStepNumber={initialStepNumber} />;
};

const NewListingInner: React.FC<{ initialStepNumber: number }> = ({ initialStepNumber }) => {
  const { listing } = useDraftListing();
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(initialStepNumber);

  const steps = [
    {
      element: CategoryStep,
      title: "What kind of experience do you want to host?",
    },
    {
      element: LocationStep,
      title: "Where is your adventure located?",
    },
    {
      element: NameStep,
      title: "What do you want to call your adventure?",
      subtitle: "Giving your trip a fun name can make you stand out!",
    },
    {
      element: DescriptionStep,
      title: "Create your description",
      subtitle: "Share what makes your trip special.",
    },
    {
      element: ImageStep,
      title: "Add images",
      subtitle: "Show off your trip with at least three images.",
    },
    {
      element: PriceStep,
      title: "Set a price",
      subtitle: "You can change it anytime.",
    },
    {
      element: DetailsStep,
      title: "Provide a few final details",
      subtitle: "Let your guests know what to expect.",
    },
    {
      element: ReviewStep,
      title: "Review your listing",
      subtitle: "Here's what we'll show to guests. Make sure everything looks good.",
    },
  ];

  const stepsHydrated = steps.map((step, idx) => ({
    element: (
      <step.element
        nextStep={() => setCurrentStepNumber(idx + 1)}
        prevStep={() => setCurrentStepNumber(idx - 1)}
        values={listing}
      />
    ),
    title: step.title,
    subtitle: step.subtitle,
  }));

  const currentStep = stepsHydrated[currentStepNumber];

  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-min-h-[600px] tw-mt-10 tw-items-center tw-pb-24 tw-overflow-scroll">
        <div className="tw-w-full">
          <div className="tw-w-full tw-text-left tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-3">
            {currentStep.title}
          </div>
          {currentStep.subtitle && (
            <div className="tw-w-full tw-text-left tw-text-base tw-text-gray-600 tw-mb-6">{currentStep.subtitle}</div>
          )}
          {currentStep.element}
        </div>
      </div>
    </div>
  );
};

const LocationStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <MapsWrapper loadingClass="tw-h-64 sm:tw-h-80">
      <LocationStepInner {...props} listing={listing} />
    </MapsWrapper>
  );
};

const PriceStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return <PriceStepInner {...props} listing={listing} />;
};

const DetailsStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return <DetailsStepInner {...props} listing={listing} />;
};

const NameStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <InputStep
      {...props}
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

const DescriptionStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <TextAreaStep
      {...props}
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

const CategoryStep: React.FC<StepProps<{}>> = (props) => {
  const { listing, loading } = useDraftListing();
  if (loading) {
    return <Loading />;
  }

  return (
    <SelectorStep
      {...props}
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

const ImageStep: React.FC<StepProps<{}>> = (props) => {
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ImageStepInner key={JSON.stringify(listing.images)} {...props} listing={listing} />
    </DndProvider>
  );
};

const ReviewStep: React.FC<StepProps<Listing>> = ({ nextStep, prevStep }) => {
  const navigate = useNavigate();
  const { listing } = useDraftListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <>
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
      <WizardNavButtons
        isLastStep
        nextStep={async () => {
          const result = await updateListing(listing.id, { status: ListingStatus.Review });
          if (result.success) {
            navigate("/listings");
          }
        }}
        prevStep={prevStep}
      />
    </>
  );
};

const toGoogleCoordinates = (coordinates: Coordinates): google.maps.LatLngLiteral => {
  return { lat: coordinates.latitude, lng: coordinates.longitude };
};

type LocationParams = {
  listing: Listing;
};

const LocationStepInner: React.FC<StepProps<{}> & LocationParams> = ({ nextStep, prevStep, listing }) => {
  const { mutate, isLoading } = useUpdateListing(listing.id);
  const onSelect = useCallback((location: string) => mutate({ location }), []);
  const coordinates = listing.coordinates ? toGoogleCoordinates(listing.coordinates) : null;
  const [error, setError] = useState<string | undefined>(undefined);
  const onSubmit = async () => {
    if (coordinates !== undefined) {
      nextStep && nextStep();
    } else {
      setError("Please select an location.");
    }
  };

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center">
        <InlineMapSearch key={listing.location} onSelect={onSelect} initial={listing.location} />
        {coordinates ? (
          <MapComponent center={coordinates} zoom={12} marker={coordinates} />
        ) : (
          <>{isLoading ? <Loading /> : <img className="tw-rounded-lg" src={mapPreview} />}</>
        )}
      </div>
      <FormError message={error} />
      <WizardNavButtons nextStep={onSubmit} prevStep={prevStep} />
    </>
  );
};

type PriceParams = {
  listing: Listing;
};

const PriceStepInner: React.FC<StepProps<{}> & PriceParams> = ({ nextStep, prevStep, listing }) => {
  const formSchema = z.object({
    value: PriceSchema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    register,
    setError,
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
      return { success: true, error: "" };
    }
    return updateListing(listing.id, { price: data.value });
  };

  return (
    <>
      <div className="tw-flex tw-flex-col tw-items-center tw-mb-6 tw-mx-0.5">
        <PriceInput
          className="tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-outline-2 focus-within:tw-outline-blue-700"
          {...register("value", { valueAsNumber: true })}
          value={watch("value")}
        />
        <ErrorMessage error={errors.value} />
      </div>
      <WizardNavButtons
        nextStep={wrapHandleSubmit(
          handleSubmit,
          updatePrice,
          (error: string) => setError("value", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
      />
    </>
  );
};

type ImageProps = {
  listing: Listing;
};

const ImageStepInner: React.FC<StepProps<{}> & ImageProps> = ({ nextStep, prevStep, listing }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const listingID = listing.id;
  const [images, setImages] = useState(listing.images);
  const [error, setError] = useState<string | undefined>(undefined);

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

  const onSubmit = async () => {
    if (listing.images && listing.images.length > 2) {
      nextStep && nextStep();
    } else {
      setError("Please select at least 3 images.");
    }
  };

  return (
    <>
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
        <FormError message={error} />
      </div>
      <WizardNavButtons nextStep={onSubmit} prevStep={prevStep} />
    </>
  );
};

type DetailsParams = {
  listing: Listing;
};

const DetailsStepInner: React.FC<StepProps<{}> & DetailsParams> = ({ nextStep, prevStep, listing }) => {
  const formSchema = z.object({
    duration: DurationSchema,
    maxGuests: MaxGuestsSchema,
  });
  type formSchemaType = z.infer<typeof formSchema>;
  const {
    watch,
    handleSubmit,
    register,
    setError,
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

  return (
    <>
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
        <ErrorMessage error={errors.maxGuests} />
      </div>
      <FormError message={errors.root?.message} />
      <WizardNavButtons
        nextStep={wrapHandleSubmit(
          handleSubmit,
          updateDetails,
          (error: string) => setError("root", { message: error }),
          nextStep,
        )}
        prevStep={prevStep}
      />
    </>
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
