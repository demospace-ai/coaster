import { XMarkIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ErrorMessage,
  InputStep,
  MultiStep,
  SelectorStep,
  StepParams,
  SubmitResult,
  TextAreaStep,
  wrapSubmit,
} from "src/components/form/MultiStep";
import mapPreview from "src/components/images/map-preview.webp";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import { CategorySchema, DescriptionSchema, NameSchema, PriceSchema } from "src/pages/listing/schema";
import { Coordinates } from "src/rpc/types";

export const NewListing: React.FC = () => {
  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-min-h-[600px] tw-mt-10 tw-items-center tw-pb-24 tw-overflow-scroll">
        <MultiStep
          id="new-listing"
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
              id: "photos",
              elementFn: photoStep,
              title: "Add photos",
              subtitle: "Show off your trip with at least three photos.",
            },
            { id: "price", elementFn: priceStep, title: "Set a price", subtitle: "You can change it anytime." },
          ]}
        />
      </div>
    </div>
  );
};

const locationStep = (params: StepParams) => {
  return (
    <MapsWrapper loadingClass="tw-h-64 sm:tw-h-80">
      <LocationStep
        {...params}
        onSubmit={async (data: string): Promise<SubmitResult> => {
          // TODO
          return { success: true, error: "" };
        }}
      />
    </MapsWrapper>
  );
};

const priceStep = (params: StepParams) => {
  return (
    <PriceStep
      {...params}
      onSubmit={async (data: string): Promise<SubmitResult> => {
        // TODO
        return { success: true, error: "" };
      }}
    />
  );
};

const nameStep = (params: StepParams) => {
  return (
    <InputStep
      {...params}
      schema={NameSchema}
      onSubmit={async (data: string): Promise<SubmitResult> => {
        // TODO
        return { success: true, error: "" };
      }}
    />
  );
};

const descriptionStep = (params: StepParams) => {
  return (
    <TextAreaStep
      {...params}
      schema={DescriptionSchema}
      onSubmit={async (data: string): Promise<SubmitResult> => {
        // TODO
        return { success: true, error: "" };
      }}
    />
  );
};

const categoryStep = (params: StepParams) => {
  return (
    <SelectorStep
      {...params}
      schema={CategorySchema}
      onSubmit={async (data: string): Promise<SubmitResult> => {
        // TODO
        return { success: true, error: "" };
      }}
    />
  );
};

const photoStep = (params: StepParams) => {
  return (
    <PhotoStep
      {...params}
      onSubmit={async (data: string): Promise<SubmitResult> => {
        // TODO
        return { success: true, error: "" };
      }}
    />
  );
};

const toGoogleCoordinates = (coordinates: Coordinates): google.maps.LatLngLiteral => {
  return { lat: coordinates.latitude, lng: coordinates.longitude };
};

const LocationStep: React.FC<
  StepParams & {
    onSubmit: (data: string) => Promise<SubmitResult>;
    existingData?: { location: string; coordinates: Coordinates };
  }
> = ({ existingData, onSubmit, renderLayout: renderStep }) => {
  const [location, setLocation] = useState<string | undefined>(existingData ? existingData.location : undefined);
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | undefined>(
    existingData ? toGoogleCoordinates(existingData.coordinates) : undefined,
  );
  const geocoder = new google.maps.Geocoder();

  const updateCoordinates = (location: string) => {
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setCoordinates(results[0].geometry.location.toJSON());
      }
    });
  };

  const handleChange = (value: string) => {
    updateCoordinates(value);
    setLocation(value);
  };

  return renderStep(
    async () => {
      if (location) {
        return onSubmit(location);
      } else {
        return { success: false, error: "" };
      }
    },
    location !== undefined,
    () => (
      <div className="tw-flex tw-flex-col tw-items-center">
        <InlineMapSearch onSelect={handleChange} initial={existingData?.location} />
        {coordinates ? (
          <MapComponent center={coordinates} zoom={12} marker={coordinates} />
        ) : (
          // Can just use a loading component whenever there is a location but no coordinates since we're just waiting
          // for the geocode response to finish
          <>
            {location ? <Loading className="tw-h-64 sm:tw-h-80" /> : <img className="tw-rounded-lg" src={mapPreview} />}
          </>
        )}
      </div>
    ),
  );
};

const PriceStep: React.FC<
  StepParams & { onSubmit: (data: string) => Promise<SubmitResult>; existingData?: number }
> = ({ existingData, onSubmit, renderLayout: renderStep }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<{ price: number }>({
    mode: "onBlur",
    defaultValues: { price: existingData },
    resolver: zodResolver(PriceSchema),
  });

  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Minus") {
      e.preventDefault();
    }
  };

  const stringifyPrice = (price: number | undefined) => {
    return price === undefined || price === null || Number.isNaN(price) ? "" : price.toString();
  };

  return renderStep(wrapSubmit(handleSubmit, onSubmit), isValid, () => (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <div
        className="tw-flex tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-mt-[-1px] focus-within:tw-mb-[-1px] tw-cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="tw-inline-block tw-relative">
          <Controller
            name={"price"}
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
                  value={field.value}
                  type="number"
                  className="tw-flex tw-top-0 tw-right-0 tw-bg-transparent tw-absolute tw-h-20 tw-text-right tw-py-5 tw-px-3 tw-w-full tw-outline-0 tw-hide-number-wheel"
                  onKeyDown={preventMinus}
                />
              </>
            )}
          />
        </div>
      </div>
      <ErrorMessage error={errors.price} />
    </div>
  ));
};

const PhotoStep: React.FC<
  StepParams & { onSubmit: (data: string) => Promise<SubmitResult>; existingData?: number }
> = ({ existingData, onSubmit, renderLayout: renderStep }) => {
  const ref = useRef<HTMLInputElement | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <button className="tw-flex tw-rounded-xl tw-bg-gray-200 tw-px-10 tw-py-3" onClick={() => ref.current?.click()}>
        Add photo
      </button>
      <input ref={ref} type="file" className="tw-flex tw-invisible" />
      <>
        {photos.map((previewImage, index) => (
          <div className="tw-relative" key={index}>
            <img src={previewImage} alt="preview-image" className="tw-select-none" />
            <XMarkIcon
              className="tw-w-8 tw-absolute tw-right-1 tw-top-1 tw-bg-gray-100 tw-p-1 tw-rounded-lg tw-opacity-[90%] tw-cursor-pointer hover:tw-opacity-100"
              onClick={() => {
                photos.splice(index, 1);
                setPhotos(photos);
              }}
            />
          </div>
        ))}
      </>
    </div>
  );
};
