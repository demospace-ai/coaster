import { XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
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
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import { CategorySchema, DescriptionSchema, NameSchema, PriceSchema } from "src/pages/listing/schema";
import { sendRequest } from "src/rpc/ajax";
import { GetListing, GetNewListing, UploadListingImage } from "src/rpc/api";
import { updateListing, useNewListing, useUpdateListing } from "src/rpc/data";
import { CategoryType, Coordinates, Listing, ListingStatus } from "src/rpc/types";
import { getGcsImageUrl } from "src/utils/images";
import { mutate } from "swr";
import { z } from "zod";

export const NewListing: React.FC = () => {
  const { listing } = useNewListing();
  const navigate = useNavigate();

  if (!listing) {
    return <Loading />;
  }

  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-min-h-[600px] tw-mt-10 tw-items-center tw-pb-24 tw-overflow-scroll">
        <MultiStep
          onComplete={() => {
            navigate("/hosting");
          }}
          initialStepNumber={computeStepNumber(listing)}
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
  const { listing } = useNewListing();
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
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return <PriceStep {...params} listing={listing} />;
};

const nameStep = (params: StepParams) => {
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <InputStep
      {...params}
      schema={NameSchema}
      existingData={listing.name}
      onSubmit={async (data: string) => {
        if (data === listing.name) {
          // No API call needed if previous value was the same
          return { success: true };
        }
        return updateListing(listing.id, { name: data });
      }}
    />
  );
};

const descriptionStep = (params: StepParams) => {
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <TextAreaStep
      {...params}
      schema={DescriptionSchema}
      existingData={listing.description}
      onSubmit={async (data: string) => {
        if (data === listing.description) {
          // No API call needed if previous value was the same
          return { success: true };
        }
        return updateListing(listing.id, { description: data });
      }}
    />
  );
};

const categoryStep = (params: StepParams) => {
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return (
    <SelectorStep
      {...params}
      schema={CategorySchema}
      existingData={listing.category}
      // TODO: fix the typing issue for the onChange data parameter
      onChange={async (data: string): Promise<SubmitResult> => {
        if (data === listing.category) {
          // No API call needed if previous value was the same
          return { success: true };
        }
        return updateListing(listing.id, { category: data as CategoryType });
      }}
    />
  );
};

const imageStep = (params: StepParams) => {
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return <ImageStep key={JSON.stringify(listing.images)} {...params} listing={listing} />;
};

const reviewStep = (params: StepParams) => {
  const { listing } = useNewListing();
  if (!listing) {
    return <Loading />;
  }

  return params.renderLayout(
    true,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center tw-pb-6">
        <div className="tw-p-8 tw-shadow-centered-md tw-rounded-xl">
          <img
            src={getGcsImageUrl(listing.images[0])}
            alt="preview-cover"
            className="tw-rounded-lg tw-aspect-square tw-object-cover tw-w-80"
          />
          <div className="tw-mt-4 tw-font-bold tw-text-xl">{listing.name}</div>
          <div className="tw-mt-1 tw-font-medium">{listing.location}</div>
          <div className="tw-mt-1">${listing.price} / person</div>
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
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formSchema = z.object({
    value: PriceSchema,
  });
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<{ value: number }>({
    mode: "onBlur",
    defaultValues: { value: listing.price },
    resolver: zodResolver(formSchema),
  });

  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Minus") {
      e.preventDefault();
    }
  };

  const stringifyPrice = (price: number | undefined): string => {
    return price === undefined || price === null || Number.isNaN(price) ? "" : price.toString();
  };

  // TODO: do we want to update on change too?
  const updatePrice = async (data: number) => {
    if (data === listing.price) {
      // No API call needed if previous value was the same
      return { success: true };
    }
    return updateListing(listing.id, { price: data });
  };

  return renderLayout(
    isValid,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
        <div
          className="tw-flex tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-mt-[-1px] focus-within:tw-mb-[-1px] tw-cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          <div className="tw-inline-block tw-relative">
            <Controller
              name={"value"}
              control={control}
              render={({ field }) => (
                <>
                  <div className="tw-flex tw-justify-center tw-items-center tw-h-20 tw-py-5 tw-px-3">
                    ${stringifyPrice(field.value)}
                  </div>
                  <input
                    ref={(e) => {
                      field.ref(e);
                      inputRef.current = e;
                    }}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    onBlur={field.onBlur}
                    value={field.value ? field.value : ""}
                    type="number"
                    className="tw-flex tw-top-0 tw-right-0 tw-bg-transparent tw-absolute tw-h-20 tw-text-right tw-py-5 tw-px-3 tw-w-full tw-outline-0 tw-hide-number-wheel"
                    onKeyDown={preventMinus}
                  />
                </>
              )}
            />
          </div>
        </div>
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
  const isValid = listing.images.length > 2;
  const listingID = listing.id;

  // TODO: validate size and type of file on frontend

  const addImage = async (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget && e.currentTarget.files) {
      const formData = new FormData();
      formData.append("listing_image", e.currentTarget.files[0]);
      try {
        await sendRequest(UploadListingImage, {
          pathParams: { listingID },
          formData: formData,
        });

        mutate({ GetNewListing });
        mutate({ GetListing, listingID });
      } catch (e) {}
    }
  };

  // TODO
  const deleteImage = (imageIndex: number) => {};

  return renderLayout(isValid, () => (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <button className="tw-flex tw-rounded-xl tw-bg-gray-200 tw-px-10 tw-py-3" onClick={() => ref.current?.click()}>
        Add image
      </button>
      <input ref={ref} type="file" className="tw-flex tw-invisible" onChange={addImage} />
      <>
        {listing.images.map((previewImage, index) => (
          <div className="tw-relative tw-m-3" key={index}>
            <img src={getGcsImageUrl(previewImage)} alt="preview-image" className="tw-select-none tw-rounded-lg" />
            <XMarkIcon
              className="tw-w-8 tw-absolute tw-right-2 tw-top-2 tw-bg-gray-100 tw-p-1 tw-rounded-lg tw-opacity-[90%] tw-cursor-pointer hover:tw-opacity-100"
              onClick={() => deleteImage(index)}
            />
          </div>
        ))}
      </>
    </div>
  ));
};

const computeStepNumber = (listing: Listing): number => {
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
  return 6;
};
