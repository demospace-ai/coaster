import React from "react";
import { MapSearch } from "src/components/maps/MapSearch";

export const Home: React.FC = () => {
  return (
    <div className="tw-h-full tw-py-7 tw-px-10">
      <div className="tw-m-auto tw-max-w-2xl tw-h-full">
        <div className="tw-flex tw-flex-col tw-mt-8 tw-mb-5 tw-justify-end tw-font-bold tw-text-3xl">
          Welcome to Fabra!
        </div>
        <MapSearch />
      </div>
    </div>
  );
};
