export default function Loading() {
  return (
    <div className="tw-flex tw-w-full tw-items-center tw-justify-center tw-px-5 tw-pt-5 sm:tw-px-20 sm:tw-pt-8">
      <div className="tw-flex tw-w-full tw-max-w-7xl tw-flex-col tw-items-center">
        <div className="tw-w-full tw-text-center tw-text-xl tw-font-bold sm:tw-text-left">Searching...</div>
        <div className="tw-mb-5 tw-mt-5 tw-grid tw-w-full tw-grid-flow-row-dense tw-grid-cols-1 tw-gap-10 tw-text-3xl tw-font-bold sm:tw-grid-cols-2 lg:tw-grid-cols-3 xl:tw-grid-cols-4">
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
      className="tw-flex tw-aspect-square tw-h-full tw-w-full tw-rounded-xl"
      style={{
        backgroundImage:
          "url(data:image/svg+xml;base64,PHN2ZwogICAgICB3aWR0aD0iMTAwJSIKICAgICAgaGVpZ2h0PSIxMDAlIgogICAgICB2aWV3Qm94PSIwIDAgMTAwIDEwMCIKICAgICAgdmVyc2lvbj0iMS4xIgogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHhtbG5zWGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiPgogICAgICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9ImZpbGwiIHZhbHVlcz0iI2VlZTsjZGRkOyNlZWUiIGR1cj0iMnMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiAvPgogICAgICA8L3JlY3Q+CiAgICA8L3N2Zz4=)",
      }}
    />
  );
};
