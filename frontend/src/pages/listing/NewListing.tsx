import { CustomFormTypeProps, FrigadeForm } from "@frigade/react";
import { useEffect, useRef, useState } from "react";
import mapPreview from "src/components/images/map-preview.webp";
import { Loading } from "src/components/loading/Loading";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import { useLocalStorage } from "src/utils/localStorage";

export const NewListing: React.FC = () => {
  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-px-8 sm:tw-px-0 tw-w-[500px] tw-h-[600px] tw-mt-10 tw-items-center">
        <FrigadeForm
          flowId="flow_VgZhRZThrelxTs4o"
          type="inline"
          repeatable
          showPagination
          allowBackNavigation
          appearance={{
            theme: {
              colorBorder: "#bcbcbc",
            },
            styleOverrides: {
              mediumTitle: "tw-text-2xl sm:tw-text-3xl tw-font-bold tw-mb-5",
              mediumSubtitle: "tw-mt-[-10px] tw-mb-5",
              formPagination: "tw-flex tw-justify-center tw-mb-2",
            },
          }}
          customStepTypes={{
            locationStep: locationStep,
            priceStep: priceStep,
          }}
        />
      </div>
    </div>
  );
};

const locationStep = (params: CustomFormTypeProps) => {
  return (
    <MapsWrapper loadingClass="tw-h-80">
      <LocationStepInternal params={params} />
    </MapsWrapper>
  );
};

const LocationStepInternal: React.FC<{ params: CustomFormTypeProps }> = ({ params }) => {
  const [location, setLocation] = useLocalStorage<string | undefined>("location", undefined);
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const geocoder = new google.maps.Geocoder();

  const updateCoordinates = (location: string) => {
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setCoordinates(results[0].geometry.location.toJSON());
      }
    });
  };

  useEffect(() => {
    params.setCanContinue(location !== undefined);
    if (location) {
      updateCoordinates(location);
    }
  }, []);

  const handleChange = (location: string) => {
    setLocation(location);
    updateCoordinates(location);
    params.onSaveData({
      location: location,
    });
    params.setCanContinue(true);
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <div className="tw-w-full tw-text-left tw-text-3xl tw-font-bold tw-mb-6">{params.stepData.title}</div>
      <InlineMapSearch onSubmit={handleChange} initial={location} />
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
  );
};

const priceStep = (params: CustomFormTypeProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useLocalStorage<number>("price", 204);

  useEffect(() => {
    params.setCanContinue(!Number.isNaN(price));
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setPrice(value);
    params.onSaveData({
      price: value,
    });
    params.setCanContinue(!Number.isNaN(value));
  };

  const toValue = (price: number) => {
    return Number.isNaN(price) ? "" : price.toString();
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <div className="tw-w-full tw-text-left tw-text-3xl tw-font-bold tw-mb-2">{params.stepData.title}</div>
      <div className="tw-w-full tw-text-left tw-text-[15px] tw-mb-6">{params.stepData.subtitle}</div>
      <div
        className="tw-flex tw-w-full tw-mb-6 tw-border tw-border-solid tw-border-[#bcbcbc] tw-rounded-lg tw-text-3xl tw-font-semibold tw-justify-center focus-within:tw-border-2 focus-within:tw-border-blue-700 focus-within:tw-mt-[-1px] focus-within:tw-mb-[23px] tw-cursor-text"
        onClick={() => ref.current?.focus()}
      >
        <div className="tw-inline-block tw-relative">
          <div className="tw-flex tw-justify-center tw-items-center tw-h-20 tw-py-5 tw-px-3">${toValue(price)}</div>
          <input
            ref={ref}
            type="number"
            className="tw-flex tw-top-0 tw-right-0 tw-bg-transparent tw-absolute tw-h-20 tw-text-right tw-py-5 tw-px-3 tw-w-full tw-outline-0 tw-hide-number-wheel"
            value={toValue(price)}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};
