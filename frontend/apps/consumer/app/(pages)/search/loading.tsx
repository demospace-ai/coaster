export default function Loading() {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-w-full tw-px-5 sm:tw-px-20 tw-pt-5 sm:tw-pt-8">
      <div className="tw-flex tw-flex-col tw-items-center tw-w-full tw-max-w-7xl">
        <div className="tw-font-bold tw-font-heading tw-text-2xl tw-w-full tw-text-center sm:tw-text-left">
          Searching...
        </div>
        <div className="tw-grid tw-grid-flow-row-dense tw-grid-cols-1 sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4 tw-mt-5 tw-mb-5 tw-font-bold tw-text-3xl tw-gap-10 tw-w-full">
          <LoadingListing />
          <LoadingListing />
          <LoadingListing />
          <LoadingListing />
        </div>
      </div>
    </div>
  );
}

const LoadingListing: React.FC = () => {
  return (
    <div
      className="tw-flex tw-w-full tw-h-full tw-aspect-square tw-rounded-xl"
      style={{
        backgroundImage:
          "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
      }}
    />
  );
};
