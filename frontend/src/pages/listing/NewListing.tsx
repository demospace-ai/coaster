import { CustomFormTypeProps, FrigadeForm } from "@frigade/react";
import { useEffect, useState } from "react";
import mapPreview from "src/components/images/map-preview.webp";
import { InlineMapSearch, MapComponent, MapsWrapper } from "src/components/maps/Maps";
import { useLocalStorage } from "src/utils/localStorage";

export const NewListing: React.FC = () => {
  return (
    <div className="tw-w-full tw-flex tw-justify-center">
      <div className="tw-flex tw-w-[500px] tw-h-[600px] tw-mt-10 tw-items-center">
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
              mediumTitle: {
                fontSize: "30px",
                fontWeight: "bold",
                lineHeight: "36px",
                marginBottom: "20px",
              },
              mediumSubtitle: {
                marginTop: "-10px",
                marginBottom: "20px",
              },
              formPagination: {
                display: "flex",
                justifyContent: "center",
              },
              inputComponent: {
                marginBottom: "12px",
              },
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
    <MapsWrapper loadingClass="tw-h-64">
      <LocationStepInternal params={params} />
    </MapsWrapper>
  );
};

const LocationStepInternal: React.FC<{ params: CustomFormTypeProps }> = ({ params }) => {
  const [location, setLocation] = useLocalStorage<string | undefined>("location", undefined);
  const [coordinates, setCoordinates] = useState<google.maps.LatLngLiteral | undefined>(undefined);
  const geocoder = new google.maps.Geocoder();

  useEffect(() => {
    params.setCanContinue(location !== undefined);
    if (location) {
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          setCoordinates(results[0].geometry.location.toJSON());
        }
      });
    }
  }, []);

  const handleChange = (location: string) => {
    setLocation(location);
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results && results.length > 0) {
        setCoordinates(results[0].geometry.location.toJSON());
      }
    });
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
        <img className="tw-rounded-lg" src={mapPreview} />
      )}
    </div>
  );
};

const priceStep = (params: CustomFormTypeProps) => {
  const [price, setPrice] = useLocalStorage<number | undefined>("price", 204);

  useEffect(() => {
    params.setCanContinue(price !== undefined);
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setPrice(value);
    params.onSaveData({
      price: value,
    });
    params.setCanContinue(true);
  };

  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-mb-6">
      <div className="tw-w-full tw-text-left tw-text-3xl tw-font-bold tw-mb-2">{params.stepData.title}</div>
      <div className="tw-w-full tw-text-left tw-text-[15px] tw-text-[#505050] tw-mb-6">{params.stepData.subtitle}</div>
      <input
        type="number"
        className="tw-border tw-border-solid tw-border-[#bcbcbc] tw-rounded-lg tw-w-full tw-py-5 tw-px-3 tw-text-center tw-text-3xl tw-font-semibold"
        value={price}
        onChange={handleChange}
      />
    </div>
  );
};
