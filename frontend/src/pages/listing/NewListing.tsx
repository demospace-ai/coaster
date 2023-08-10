import { useEffect, useRef, useState } from "react";
import {
  ErrorMessage,
  InputStep,
  MultiStep,
  SelectorStep,
  StepParams,
  TextAreaStep,
} from "src/components/form/MultiStep";
import mapPreview from "src/components/images/map-preview.webp";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import { CategorySchema, DescriptionSchema, NameSchema, PriceSchema } from "src/pages/listing/schema";
import { ZodError } from "zod";

export const NewListing: React.FC = () => {
  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-min-h-[600px] tw-mt-10 tw-items-center">
        <MultiStep
          id="new-listing"
          defaultValues={{ price: 205, description: "You'll have the time of your life on our one-of-a-kind trip." }}
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
      <LocationStep {...params} />
    </MapsWrapper>
  );
};

const LocationStep: React.FC<StepParams> = ({ setCanContinue, setData: saveData, data }) => {
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const geocoder = new google.maps.Geocoder();

  const updateCoordinates = (location: string) => {
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setCoordinates(results[0].geometry.location.toJSON());
      }
    });
  };

  // Effect to handle state from local storage
  useEffect(() => {
    if (data) {
      updateCoordinates(data);
      setCanContinue(true);
    }
  }, []);

  const handleChange = (value: string) => {
    updateCoordinates(value);
    saveData(value);
    setCanContinue(true);
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center">
      <InlineMapSearch onSubmit={handleChange} initial={data} />
      {coordinates ? (
        <MapComponent center={coordinates} zoom={12} marker={coordinates} />
      ) : (
        // Can just use a loading component whenever there is a location but no coordinates since we're just waiting
        // for the geocode response to finish
        <>{data ? <Loading className="tw-h-64 sm:tw-h-80" /> : <img className="tw-rounded-lg" src={mapPreview} />}</>
      )}
    </div>
  );
};

const priceStep = (params: StepParams) => {
  return <PriceStep {...params} />;
};

const PriceStep: React.FC<StepParams> = ({ setCanContinue, data, setData }) => {
  const [error, setError] = useState<ZodError | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    const result = PriceSchema.safeParse(value);
    if (result.success) {
      setData(result.data);
      setError(null);
      setCanContinue(true);
    } else {
      setData(NaN);
      setError(result.error);
      setCanContinue(false);
    }
  };

  const preventMinus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Minus") {
      e.preventDefault();
    }
  };

  const toValue = (price: number | undefined) => {
    return price === undefined || price === null || Number.isNaN(price) ? "" : price.toString();
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <div
        className="tw-flex tw-w-full tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-mt-[-1px] focus-within:tw-mb-[-1px] tw-cursor-text"
        onClick={() => ref.current?.focus()}
      >
        <div className="tw-inline-block tw-relative">
          <div className="tw-flex tw-justify-center tw-items-center tw-h-20 tw-py-5 tw-px-3">${toValue(data)}</div>
          <input
            ref={ref}
            type="number"
            className="tw-flex tw-top-0 tw-right-0 tw-bg-transparent tw-absolute tw-h-20 tw-text-right tw-py-5 tw-px-3 tw-w-full tw-outline-0 tw-hide-number-wheel "
            value={toValue(data)}
            onChange={handleChange}
            onKeyDown={preventMinus}
          />
        </div>
      </div>
      <ErrorMessage error={error} />
    </div>
  );
};

const nameStep = (params: StepParams) => {
  return <InputStep {...params} schema={NameSchema} />;
};

const descriptionStep = (params: StepParams) => {
  return <TextAreaStep {...params} schema={DescriptionSchema} />;
};

const categoryStep = (params: StepParams) => {
  return <SelectorStep {...params} schema={CategorySchema} />;
};
